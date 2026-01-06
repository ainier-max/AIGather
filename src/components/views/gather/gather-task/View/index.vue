<template>
    <div class="gather-task-container" v-if="gatherTaskModel">
        <div class="titleClass">任务采集工作台</div>

        <div class="gather-content">
            <el-card class="task-card" shadow="never">
                <template #header>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <el-icon color="#fe6c6f" size="20">
                            <List />
                        </el-icon>
                        <span style="font-weight: 600; font-size: 16px;">待处理图层任务</span>
                    </div>
                </template>

                <el-table v-loading="gatherTaskModel.loading" :data="gatherTaskModel.gatherTaskData" border stripe
                    size="default" height="100%">
                    <el-table-column prop="cjsj" label="创建日期" width="120" align="center" />
                    <el-table-column prop="name" label="图层任务名" min-width="150">
                        <template #default="{ row }">
                            <span style="font-weight: 500; color: #334155;">{{ row.name }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="table_name" label="实体表名" width="180">
                        <template #default="{ row }">
                            <code
                                style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-size: 12px; color: #475569;">{{ row.table_name }}</code>
                        </template>
                    </el-table-column>
                    <el-table-column prop="type" label="空间类型" width="100" align="center">
                        <template #default="{ row }">
                            <el-tag :type="getTypeTag(row.type)" effect="light" class="type-tag" size="small">
                                {{ row.type }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="140" align="center" fixed="right">
                        <template #default="{ row }">
                            <el-button type="primary" size="small" class="action-btn" :icon="VideoPlay"
                                @click="gatherTaskModel.gather(row)">
                                开始采集
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { gatherTaskStore } from "@/components/views/gather/gather-task/Controller/gatherTaskStore.ts";
import { storeToRefs } from "pinia";
import { List, VideoPlay } from '@element-plus/icons-vue';

const store = gatherTaskStore();
const { gatherTaskModel } = storeToRefs(store);

onMounted(async () => {
    store.initClass();
    if (gatherTaskModel.value) {
        await gatherTaskModel.value.findGatherTask();
    }
});

const getTypeTag = (type) => {
    switch (type) {
        case 'point': return 'primary';
        case 'polyline': return 'success';
        case 'polygon': return 'warning';
        case 'absence': return 'info';
        default: return '';
    }
};

</script>

<style scoped>
@import "./style/index.css";
</style>
