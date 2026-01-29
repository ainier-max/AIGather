<template>
    <div class="task-approval-container" v-if="taskApprovalModel">
        <div class="titleClass">任务审批管理</div>

        <el-card class="approval-card" shadow="never" v-loading="taskApprovalModel.loading">
            <template #header>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600;">待审批任务列表</span>
                    <el-button type="primary" link @click="taskApprovalModel.findGatherTask()">刷新</el-button>
                </div>
            </template>

            <div v-if="taskApprovalModel.gatherTasks.length > 0">
                <el-collapse v-model="taskApprovalModel.activeNames">
                    <el-collapse-item v-for="(item, index) in taskApprovalModel.gatherTasks" :key="index" :name="index">
                        <template #title>
                            <el-icon style="margin-right: 8px; color: #fe6c6f;">
                                <Stamp />
                            </el-icon>
                            <span>{{ item.name }}</span>
                            <el-tag size="small" style="margin-left: 10px;" type="info">{{ item.username }}</el-tag>
                        </template>

                        <div class="task-form-wrapper">
                            <el-form label-width="80px" size="small">
                                <el-form-item label="任务描述">
                                    <el-input :model-value="item.description" disabled type="textarea" :rows="2" />
                                </el-form-item>
                                <el-row :gutter="20">
                                    <el-col :span="8">
                                        <el-form-item label="任务表名">
                                            <el-input :model-value="item.table_name" disabled />
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="8">
                                        <el-form-item label="采集类型">
                                            <el-tag>{{ item.type }}</el-tag>
                                        </el-form-item>
                                    </el-col>
                                    <el-col :span="8">
                                        <el-form-item v-if="item.type == 'point'" label="图层图标">
                                            <el-image style="width: 40px; height: 40px; border-radius: 4px;"
                                                :src="item.layerimg" fit="cover" />
                                        </el-form-item>
                                        <el-form-item v-if="item.type == 'polyline' || item.type == 'polygon'"
                                            label="图层颜色">
                                            <div
                                                :style="{ width: '40px', height: '24px', backgroundColor: item.color, border: '1px solid #dcdfe6', borderRadius: '4px' }">
                                            </div>
                                        </el-form-item>
                                    </el-col>
                                </el-row>

                                <div style="display: flex; justify-content: center; gap: 16px; margin: 20px 0;">
                                    <el-button type="primary" :icon="Check"
                                        @click="handleApproval(item)">确认授权</el-button>
                                    <el-button type="danger" plain :icon="Close"
                                        @click="taskApprovalModel.taskRefuse(item.id)">否决申请</el-button>
                                </div>

                                <div class="field-table-title">
                                    <el-icon>
                                        <Warning />
                                    </el-icon>
                                    授权后，系统将自动创建具备以下业务字段的数据表
                                </div>

                                <el-table :data="item.minGatherTaskFields" height="200" border size="small" stripe>
                                    <el-table-column prop="field_name" label="字段名称" />
                                    <el-table-column prop="field_dec" label="业务描述" />
                                    <el-table-column prop="field_length" label="长度" width="80" align="center" />
                                    <el-table-column prop="field_type" label="类型" width="100" align="center">
                                        <template #default="{ row }">
                                            <el-tag size="small" effect="light">{{ row.field_type }}</el-tag>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </el-form>
                        </div>
                    </el-collapse-item>
                </el-collapse>
            </div>

            <div v-else class="empty-state">
                <el-empty description="暂无待审批的任务" />
            </div>
        </el-card>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { taskApprovalStore } from "@/components/views/gather/task-approval/Controller/taskApprovalStore.ts";
import { storeToRefs } from "pinia";
import { Stamp, Check, Close, Warning } from '@element-plus/icons-vue';

const store = taskApprovalStore();
const { taskApprovalModel } = storeToRefs(store);
const router = useRouter();

const handleApproval = async (item) => {
    const success = await taskApprovalModel.value.taskApproval(item);
    if (success) {
        router.push({ name: 'task-distribution' });
    }
}

onMounted(() => {
    store.initClass();
    if (taskApprovalModel.value) {
        taskApprovalModel.value.findGatherTask();
    }
});
</script>

<style scoped>
@import "./style/index.css";
</style>
