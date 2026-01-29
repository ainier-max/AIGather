<template>
    <div class="task-distribution-container" v-if="taskDistributionModel">
        <div class="titleClass">任务分配与人员授权</div>

        <div class="dist-content">
            <!-- Left: Tree Panel -->
            <div class="tree-panel">
                <el-card class="panel-card" shadow="never">
                    <template #header>
                        <div style="font-weight: 600;">图层架构树</div>
                    </template>
                    <el-tree ref="layerTreeRef" :data="taskDistributionModel.gatherTaskTreeData" node-key="id"
                        class="down-tree" default-expand-all highlight-current :expand-on-click-node="false"
                        @node-click="handleNodeClick">
                        <template #default="{ node, data }">
                            <span class="custom-tree-node">
                                <el-icon v-if="data.taskid == null" color="#eab308">
                                    <FolderOpened />
                                </el-icon>
                                <template v-else>
                                    <el-icon v-if="data.type.includes('polyline')" :style="data.colorStyle">
                                        <Share />
                                    </el-icon>
                                    <el-icon v-else-if="data.type.includes('polygon')" :style="data.colorStyle">
                                        <House />
                                    </el-icon>
                                    <el-icon v-else-if="data.type.includes('none')" color="#94a3b8">
                                        <Memo />
                                    </el-icon>
                                    <el-image v-else-if="data.type.includes('point')"
                                        style="width: 14px; height: 14px; border-radius: 2px;" :src="data.layerimg" />
                                </template>
                                <span>{{ node.label }}</span>
                            </span>
                        </template>
                    </el-tree>
                </el-card>
            </div>

            <!-- Right: User Management Panel -->
            <div class="user-panel">
                <el-card class="panel-card" shadow="never">
                    <template #header>
                        <div class="action-header">
                            <div class="authorized-title">
                                <el-icon color="#fe6c6f">
                                    <UserFilled />
                                </el-icon>
                                <span>已授权人员 - {{ taskDistributionModel.currentNode?.label || '未选择图层' }}</span>
                            </div>
                            <el-button type="primary" size="small" :icon="Plus"
                                @click="taskDistributionModel.showAddTaskDistributionWin()">新增授权</el-button>
                        </div>
                    </template>

                    <el-table :data="taskDistributionModel.distributionUserData" stripe border size="small"
                        height="100%">
                        <el-table-column prop="USERID" label="用户 ID" width="120" />
                        <el-table-column prop="USERNAME" label="姓名" min-width="120" />
                        <el-table-column prop="PHONE" label="联系电话" width="150" />
                        <el-table-column label="操作" width="80" align="center" fixed="right">
                            <template #default="{ row }">
                                <el-tooltip content="取消授权" placement="top">
                                    <el-button type="danger" link :icon="Delete"
                                        @click="taskDistributionModel.deleteTaskDistribution(row)" />
                                </el-tooltip>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </div>
        </div>

        <!-- Add User Dialog -->
        <el-dialog title="选择待授权人员" v-model="taskDistributionModel.allUserDialogVisible" width="35%" append-to-body>
            <el-table :data="taskDistributionModel.allUserData" stripe size="small" height="300">
                <el-table-column prop="USERID" label="用户 ID" width="100" />
                <el-table-column prop="USERNAME" label="姓名" min-width="150" />
                <el-table-column label="操作" width="80" align="center">
                    <template #default="{ row }">
                        <el-button type="primary" link :icon="CirclePlus"
                            @click="taskDistributionModel.gatherTaskDistribution(row)">授权</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue';
import { taskDistributionStore } from "@/components/views/gather/task-distribution/Controller/taskDistributionStore.ts";
import { storeToRefs } from "pinia";
import {
    FolderOpened,
    Share,
    House,
    Memo,
    UserFilled,
    Plus,
    Delete,
    CirclePlus
} from '@element-plus/icons-vue';

const store = taskDistributionStore();
const { taskDistributionModel } = storeToRefs(store);

const layerTreeRef = ref(null);

onMounted(async () => {
    store.initClass();
    if (taskDistributionModel.value) {
        await taskDistributionModel.value.findGatherTaskTree();
        nextTick(() => {
            if (layerTreeRef.value) {
                layerTreeRef.value.setCurrentKey(taskDistributionModel.value.currentNodeKey);
            }
        });
    }
});

const handleNodeClick = (data) => {
    taskDistributionModel.value.handleNodeClick(data);
};

</script>

<style scoped>
@import "./style/index.css";
</style>
