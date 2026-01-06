<template>
    <div class="task-deploy-container" v-if="taskDeployModel">
        <div class="titleClass">任务调配管理</div>

        <div class="deploy-content">
            <!-- Left Side: Task List -->
            <div class="left-panel">
                <el-card class="panel-card" shadow="never">
                    <template #header>
                        <div style="font-weight: 600;">待调配采集任务</div>
                    </template>

                    <div class="info-tip">
                        <el-icon color="#3b82f6">
                            <InfoFilled />
                        </el-icon>
                        <span>选中右侧目录后，点击 <el-icon color="#3b82f6">
                                <Upload />
                            </el-icon> 即可将任务挂载到图层树</span>
                    </div>

                    <el-table :data="taskDeployModel.gatherTaskData" border stripe height="100%" size="small">
                        <el-table-column prop="cjsj" label="创建日期" width="110" />
                        <el-table-column prop="name" label="任务名" />
                        <el-table-column prop="table_name" label="表名" width="150" />
                        <el-table-column prop="type" label="类型" width="90">
                            <template #default="{ row }">
                                <el-tag size="small" effect="light">{{ row.type }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80" align="center" fixed="right">
                            <template #default="{ row }">
                                <div style="display: flex; gap: 10px; justify-content: center;">
                                    <el-tooltip content="调配到已选目录" placement="top">
                                        <el-icon style="color: #3b82f6; cursor: pointer; font-size: 16px;"
                                            @click="handleTaskDeploy(row)">
                                            <Upload />
                                        </el-icon>
                                    </el-tooltip>
                                    <el-tooltip content="删除任务" placement="top">
                                        <el-icon style="color: #ef4444; cursor: pointer; font-size: 16px;"
                                            @click="taskDeployModel.getGatherTaskCount(row)">
                                            <Delete />
                                        </el-icon>
                                    </el-tooltip>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </div>

            <!-- Right Side: Layer Tree -->
            <div class="right-panel">
                <el-card class="panel-card" shadow="never">
                    <template #header>
                        <div style="font-weight: 600;">发布图层树</div>
                    </template>

                    <el-tree ref="layerTreeRef" :data="taskDeployModel.gatherTaskTreeData" node-key="id"
                        class="down-tree" default-expand-all highlight-current :expand-on-click-node="false"
                        @node-click="handleNodeClick">
                        <template #default="{ node, data }">
                            <span class="custom-tree-node">
                                <span style="display: flex; align-items: center; gap: 6px;">
                                    <!-- Directory Icon -->
                                    <el-icon v-if="data.taskid == null" color="#eab308">
                                        <FolderOpened />
                                    </el-icon>

                                    <!-- Task Type Icons -->
                                    <template v-else>
                                        <el-icon v-if="data.type.includes('polyline')" :style="data.colorStyle">
                                            <Share />
                                        </el-icon>
                                        <el-icon v-else-if="data.type.includes('polygon')" :style="data.colorStyle">
                                            <House />
                                        </el-icon>
                                        <el-icon v-else-if="data.type.includes('absence')" color="#94a3b8">
                                            <Memo />
                                        </el-icon>
                                        <el-image v-else-if="data.type.includes('point')"
                                            style="width: 14px; height: 14px; border-radius: 2px;"
                                            :src="data.layerimg" />
                                    </template>
                                    <span>{{ node.label }}</span>
                                </span>

                                <span class="node-actions">
                                    <el-icon v-if="data.taskid == null" color="#8b5cf6"
                                        @click.stop="taskDeployModel.showAddWin(data)">
                                        <CirclePlus />
                                    </el-icon>
                                    <el-icon v-if="data.taskid == null" color="#8b5cf6"
                                        @click.stop="taskDeployModel.showEditWin(data)">
                                        <Edit />
                                    </el-icon>
                                    <el-icon color="#ef4444" @click.stop="taskDeployModel.showDeleteWin(data)">
                                        <Remove />
                                    </el-icon>
                                </span>
                            </span>
                        </template>
                    </el-tree>
                </el-card>
            </div>
        </div>

        <!-- Node Add/Edit Dialog -->
        <el-dialog :title="taskDeployModel.treeDialogTitle" v-model="taskDeployModel.dialogVisible" width="30%"
            align-center destroy-on-close>
            <el-form :model="taskDeployModel.treeDicDataForm" :rules="treeDicrules" ref="treeDicDataFormRef"
                label-width="100px">
                <el-form-item label="节点名称" prop="treems">
                    <el-input v-model="taskDeployModel.treeDicDataForm.treems" placeholder="请输入节点显示的名称" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="handleCancle">取 消</el-button>
                    <el-button type="primary" @click="handleConfirm">确 定</el-button>
                </div>
            </template>
        </el-dialog>

        <!-- Delete Node Confirmation -->
        <el-dialog title="安全删除确认" v-model="taskDeployModel.deleteTreeDataDialogVisible" width="30%" align-center>
            <div style="display: flex; align-items: center; gap: 12px;">
                <el-icon size="24" color="#ef4444">
                    <WarningFilled />
                </el-icon>
                <span>确定要删除 <b style="color:#ef4444">{{ taskDeployModel.currentTreeLabel }}</b> 及其下的子目录吗？</span>
            </div>
            <template #footer>
                <el-button @click="taskDeployModel.deleteTreeDataDialogVisible = false">取消</el-button>
                <el-button type="danger" @click="taskDeployModel.deleteTreeData()">确定删除</el-button>
            </template>
        </el-dialog>

        <!-- Delete Task Confirmation -->
        <el-dialog title="高危操作确认" v-model="taskDeployModel.deleteGatherTaskDialogVisible" width="30%" align-center>
            <div style="line-height: 1.6;">
                确定要删除 <b style="color:#ef4444">({{ taskDeployModel.opGatherTask.name }})</b> 采集任务吗？<br />
                此操作将清理所有关联图层及配置信息，<span style="color:red; font-weight: bold;">数据不可恢复</span>。
            </div>
            <template #footer>
                <el-button @click="taskDeployModel.deleteGatherTaskDialogVisible = false">取消</el-button>
                <el-button type="danger" @click="taskDeployModel.deleteGatherTask()">持久化删除</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue';
import { taskDeployStore } from "@/components/views/gather/task-deploy/Controller/taskDeployStore.ts";
import { storeToRefs } from "pinia";
import { ElMessage, ElMessageBox } from 'element-plus';
import {
    InfoFilled,
    Upload,
    Delete,
    FolderOpened,
    Share,
    House,
    Memo,
    CirclePlus,
    Edit,
    Remove,
    WarningFilled
} from '@element-plus/icons-vue';

const store = taskDeployStore();
const { taskDeployModel } = storeToRefs(store);

const layerTreeRef = ref(null);
const treeDicDataFormRef = ref(null);

const treeDicrules = {
    treems: [
        { required: true, message: '节点标签不能为空', trigger: 'blur' }
    ],
};

onMounted(async () => {
    store.initClass();
    if (taskDeployModel.value) {
        await taskDeployModel.value.findGatherTask();
        await taskDeployModel.value.findGatherTaskTree();

        // Initial selection visibility
        nextTick(() => {
            if (layerTreeRef.value) {
                layerTreeRef.value.setCurrentKey(taskDeployModel.value.currentNodeKey);
            }
        });
    }
});

const handleNodeClick = (data) => {
    if (taskDeployModel.value) {
        taskDeployModel.value.currentNodeKey = data.id;
    }
};

const handleTaskDeploy = (row) => {
    const currentNode = layerTreeRef.value?.getCurrentNode();
    taskDeployModel.value.taskDeploy(row, currentNode);
};

const handleConfirm = () => {
    if (!treeDicDataFormRef.value) return;
    treeDicDataFormRef.value.validate((valid) => {
        if (valid) {
            if (taskDeployModel.value.editFlag === 0) {
                taskDeployModel.value.addTreeDicData();
            } else {
                taskDeployModel.value.editTreeDicData();
            }
        }
    });
};

const handleCancle = () => {
    if (taskDeployModel.value) {
        taskDeployModel.value.dialogVisible = false;
        taskDeployModel.value.treeDicDataForm.treems = "";
    }
};

</script>

<style scoped>
@import "./style/index.css";
</style>
