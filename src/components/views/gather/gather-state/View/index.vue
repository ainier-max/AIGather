<!--MVC中的View层,主要用来显示界面信息-->
<template>
    <div class="gather-state-container" v-if="gatherStateModel">
        <div class="titleClass">
            <el-icon style="vertical-align: middle; margin-right: 8px;">
                <Document />
            </el-icon>
            采集状况
        </div>

        <div class="state-content">
            <!-- Left: Layer Tree Panel -->
            <div class="tree-panel">
                <el-card class="panel-card" shadow="never">
                    <template #header>
                        <div style="font-weight: 600; color: #475569;">图层架构树</div>
                    </template>
                    <el-tree ref="layerTreeRef" :data="gatherStateModel.layerTreeData" node-key="id" default-expand-all
                        highlight-current :expand-on-click-node="false" @node-click="handleNodeClick">
                        <template #default="{ node, data }">
                            <span class="custom-tree-node">
                                <el-icon v-if="data.taskid == null" color="#eab308">
                                    <FolderOpened />
                                </el-icon>
                                <template v-else>
                                    <el-icon v-if="data.type && data.type.includes('polyline')"
                                        :style="data.colorStyle">
                                        <Share />
                                    </el-icon>
                                    <el-icon v-else-if="data.type && data.type.includes('polygon')"
                                        :style="data.colorStyle">
                                        <House />
                                    </el-icon>
                                    <el-icon v-else-if="data.type && data.type.includes('none')" color="#94a3b8">
                                        <Memo />
                                    </el-icon>
                                    <el-image v-else-if="data.type && data.type.includes('point')"
                                        style="width: 14px; height: 14px; border-radius: 2px;" :src="data.layerimg" />
                                </template>
                                <span>{{ node.label }}</span>
                            </span>
                        </template>
                    </el-tree>
                </el-card>
            </div>

            <!-- Right: Display Panel -->
            <div class="display-panel">
                <!-- Mode Toggle Bar -->
                <div class="mode-toggle-bar">
                    <div class="mode-toggle-left">
                        <span v-if="gatherStateModel.currentNode">
                            {{ gatherStateModel.currentNode.label }}
                        </span>
                        <span v-else style="color: #94a3b8;">请选择图层</span>
                    </div>
                    <el-radio-group v-model="gatherStateModel.displayMode" @change="handleModeChange">
                        <el-radio-button value="map">
                            <el-icon style="vertical-align: middle; margin-right: 4px;">
                                <Location />
                            </el-icon>
                            地图展示
                        </el-radio-button>
                        <el-radio-button value="list">
                            <el-icon style="vertical-align: middle; margin-right: 4px;">
                                <List />
                            </el-icon>
                            列表展示
                        </el-radio-button>
                    </el-radio-group>
                </div>

                <!-- Map Display -->
                <div class="map-container" v-show="gatherStateModel.displayMode === 'map'">
                    <div id="gatherStateMap"></div>
                    <div class="map-placeholder" v-if="!gatherStateModel.currentNode">
                        <span>请从左侧选择图层以查看地图数据</span>
                    </div>
                </div>

                <!-- List Display -->
                <div class="list-container" v-show="gatherStateModel.displayMode === 'list'">
                    <div class="list-table-wrapper" v-if="gatherStateModel.currentNode">
                        <el-table :data="gatherStateModel.listData" stripe style="width: 100%">
                            <el-table-column type="index" label="序号" width="60" align="center" />
                            <el-table-column prop="gather_cjsj" label="采集时间" width="180" align="center" />
                            <el-table-column prop="gather_cjr" label="采集人" width="120" align="center" />
                            <el-table-column label="详细信息" align="center">
                                <template #default="{ row }">
                                    <el-button type="primary" link size="small">查看详情</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div v-else class="map-placeholder">
                        <span>请从左侧选择图层以查看列表数据</span>
                    </div>

                    <div class="pagination-wrapper" v-if="gatherStateModel.currentNode">
                        <el-pagination v-model:current-page="gatherStateModel.currentPage"
                            v-model:page-size="gatherStateModel.pageSize" :page-sizes="[10, 20, 50, 100]"
                            layout="total, sizes, prev, pager, next, jumper" :total="gatherStateModel.total"
                            @size-change="handleSizeChange" @current-change="handlePageChange" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from "pinia";
import { gatherStateStore } from "@/components/views/gather/gather-state/Controller/gatherStateStore.ts";
import { Document, FolderOpened, Share, House, Memo, Location, List } from '@element-plus/icons-vue';

const store = gatherStateStore();
const { gatherStateModel } = storeToRefs(store);

onMounted(async () => {
    store.initClass();
    if (gatherStateModel.value) {
        await gatherStateModel.value.loadLayerTree();
    }
});

// 处理节点点击
const handleNodeClick = (data) => {
    if (gatherStateModel.value) {
        gatherStateModel.value.handleNodeClick(data);
    }
};

// 处理模式切换
const handleModeChange = (mode) => {
    if (gatherStateModel.value) {
        gatherStateModel.value.toggleDisplayMode(mode);
    }
};

// 处理页码改变
const handlePageChange = (page) => {
    if (gatherStateModel.value) {
        gatherStateModel.value.handlePageChange(page);
    }
};

// 处理每页条数改变
const handleSizeChange = (size) => {
    if (gatherStateModel.value) {
        gatherStateModel.value.handleSizeChange(size);
    }
};
</script>

<style scoped>
@import "./style/index.css";
</style>
