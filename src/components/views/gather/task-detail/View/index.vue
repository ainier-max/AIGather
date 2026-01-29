<template>
    <div class="task-detail-container" v-if="taskDetailModel">
        <div class="titleClass">任务详情管理</div>

        <div class="detail-content">
            <!-- Left: Tree Panel -->
            <div class="tree-panel">
                <el-card class="panel-card" shadow="never" style="height: 100%; display: flex; flex-direction: column;">
                    <template #header>
                        <div style="font-weight: 600;">图层架构树</div>
                    </template>
                    <el-tree ref="layerTreeRef" :data="taskDetailModel.gatherTaskTreeData" node-key="id"
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
                                    <el-icon v-else-if="data.type.includes('absence')" color="#94a3b8">
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

            <!-- Right: Detail Panel -->
            <div class="detail-panel">
                <!-- Task Basic Info -->
                <el-card class="panel-card" shadow="never">
                    <template #header>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: 600;">图层基本信息</span>
                            <div v-if="taskDetailModel.currentNode?.taskid">
                                <el-button v-if="taskDetailModel.editFlag" type="warning" size="small" :icon="Edit"
                                    @click="taskDetailModel.editFlag = false">编辑详情</el-button>
                                <el-button v-else type="primary" size="small" :icon="Check"
                                    @click="taskDetailModel.saveTaskDetail()">保存变更</el-button>
                            </div>
                        </div>
                    </template>

                    <el-form label-width="80px" size="small">
                        <el-row :gutter="20">
                            <el-col :span="14">
                                <el-form-item label="任务名称">
                                    <el-input v-model="taskDetailModel.taskName" :disabled="taskDetailModel.editFlag"
                                        placeholder="请从左侧选择图层" />
                                </el-form-item>
                                <el-form-item label="任务描述">
                                    <el-input v-model="taskDetailModel.taskDescription" type="textarea" :rows="2"
                                        :disabled="taskDetailModel.editFlag" placeholder="图层功能说明" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="10"
                                style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                                <div v-if="taskDetailModel.taskType === 'point'" class="file-preview" title="点击更换图标">
                                    <img v-if="taskDetailModel.layerimg" :src="taskDetailModel.layerimg" />
                                    <el-icon v-else size="24" color="#94a3b8">
                                        <Picture />
                                    </el-icon>
                                    <input type="file" :disabled="taskDetailModel.editFlag" @change="handleFileChange"
                                        accept="image/*" />
                                </div>
                                <div v-else-if="['polyline', 'polygon'].includes(taskDetailModel.taskType)">
                                    <div style="margin-bottom: 8px; font-size: 12px; color: #64748b;">图层渲染颜色</div>
                                    <el-color-picker v-model="taskDetailModel.layerColor"
                                        :disabled="taskDetailModel.editFlag" />
                                </div>
                            </el-col>
                        </el-row>
                    </el-form>
                </el-card>

                <!-- Task Fields -->
                <el-card class="panel-card" shadow="never">
                    <template #header>
                        <div style="font-weight: 600;">业务字段配置</div>
                    </template>

                    <el-table :data="taskDetailModel.gatherTaskFieldData" border stripe size="small" height="260">
                        <el-table-column prop="field_dec" label="字段描述" min-width="120" />
                        <el-table-column prop="field_name" label="数据库字段" width="120" />
                        <el-table-column prop="field_type" label="类型" width="100" align="center">
                            <template #default="{ row }">
                                <el-tag size="small" effect="light">{{ row.field_type }}</el-tag>
                            </template>
                        </el-table-column>
                        <el-table-column prop="field_length" label="长度" width="80" align="center" />
                        <el-table-column prop="show_flag" label="显示级" width="80" align="center" />
                        <el-table-column label="操作" width="100" align="center" fixed="right">
                            <template #default="{ row }">
                                <el-button type="primary" link :icon="Edit"
                                    @click="taskDetailModel.showEditFieldWin(row)" />
                                <el-button type="danger" link :icon="Delete"
                                    @click="taskDetailModel.showDeleteFieldWin(row)" />
                            </template>
                        </el-table-column>
                    </el-table>

                    <!-- Add Field Area -->
                    <div class="add-field-section">
                        <div v-if="taskDetailModel.addFieldType" class="add-field-form">
                            <div class="section-title">
                                <el-icon color="#fe6c6f">
                                    <CirclePlus />
                                </el-icon>
                                <span>新增 {{ taskDetailModel.addFieldType }} 字段</span>
                            </div>

                            <el-form :model="taskDetailModel.addFieldDataForm" ref="addFieldFormRef" :inline="true"
                                size="small">
                                <!-- Word Field -->
                                <template v-if="taskDetailModel.addFieldType === 'word'">
                                    <el-form-item prop="wordFieldNameValue" :rules="filedNameRule">
                                        <el-input v-model="taskDetailModel.addFieldDataForm.wordFieldNameValue"
                                            placeholder="字段名(如:NAME)" width="120" />
                                    </el-form-item>
                                    <el-form-item prop="wordFieldCommentValue" :rules="filedCommentRule">
                                        <el-input v-model="taskDetailModel.addFieldDataForm.wordFieldCommentValue"
                                            placeholder="描述(如:名称)" width="120" />
                                    </el-form-item>
                                    <el-form-item prop="wordFieldLengthValue" :rules="filedLengthRule">
                                        <el-input v-model="taskDetailModel.addFieldDataForm.wordFieldLengthValue"
                                            placeholder="长度(默认30)" width="100" />
                                    </el-form-item>
                                </template>

                                <!-- Select Field -->
                                <template v-else-if="taskDetailModel.addFieldType === 'select'">
                                    <el-form-item>
                                        <el-select v-model="taskDetailModel.addFieldDataForm.selectDicId"
                                            style="width: 150px;" placeholder="选择预设字典"
                                            @change="handleDicChange('select')">
                                            <el-option v-for="item in taskDetailModel.selectArrData" :key="item.dicid"
                                                :label="item.dicms" :value="item.dicid" />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item prop="selectFieldNameValue" :rules="filedNameRule">
                                        <el-input v-model="taskDetailModel.addFieldDataForm.selectFieldNameValue"
                                            disabled width="120" />
                                    </el-form-item>
                                </template>

                                <!-- Tree Field -->
                                <template v-else-if="taskDetailModel.addFieldType === 'tree'">
                                    <el-form-item>
                                        <el-select v-model="taskDetailModel.addFieldDataForm.treeDicId"
                                            style="width: 150px;" placeholder="选择树形字典"
                                            @change="handleDicChange('tree')">
                                            <el-option v-for="item in taskDetailModel.treeArrData" :key="item.treeid"
                                                :label="item.treems" :value="item.treeid" />
                                        </el-select>
                                    </el-form-item>
                                    <el-form-item prop="treeFieldNameValue" :rules="filedNameRule">
                                        <el-input v-model="taskDetailModel.addFieldDataForm.treeFieldNameValue" disabled
                                            width="120" />
                                    </el-form-item>
                                </template>

                                <!-- Other Fields (Common) -->
                                <template v-else>
                                    <el-form-item prop="otherFieldNameValue" :rules="filedNameRule">
                                        <el-input v-model="taskDetailModel.addFieldDataForm.otherFieldNameValue"
                                            placeholder="字段名" width="120" />
                                    </el-form-item>
                                    <el-form-item prop="otherFieldCommentValue" :rules="filedCommentRule">
                                        <el-input v-model="taskDetailModel.addFieldDataForm.otherFieldCommentValue"
                                            placeholder="业务描述" width="120" />
                                    </el-form-item>
                                </template>

                                <el-form-item>
                                    <el-button type="primary" @click="confirmAddField">确认添加</el-button>
                                    <el-button link
                                        @click="taskDetailModel.addFieldType = ''; taskDetailModel.addFlag = false">取消</el-button>
                                </el-form-item>
                            </el-form>
                        </div>

                        <div class="field-actions">
                            <el-button-group>
                                <el-button type="success" plain size="small" :disabled="taskDetailModel.addFlag"
                                    @click="taskDetailModel.startAddField('word')">文本</el-button>
                                <el-button type="success" plain size="small" :disabled="taskDetailModel.addFlag"
                                    @click="taskDetailModel.startAddField('select')">下拉</el-button>
                                <el-button type="success" plain size="small" :disabled="taskDetailModel.addFlag"
                                    @click="taskDetailModel.startAddField('tree')">树形</el-button>
                                <el-button type="success" plain size="small" :disabled="taskDetailModel.addFlag"
                                    @click="taskDetailModel.startAddField('time')">时间</el-button>
                                <el-button type="success" plain size="small" :disabled="taskDetailModel.addFlag"
                                    @click="taskDetailModel.startAddField('rich')">富文本</el-button>
                                <el-button type="success" plain size="small" :disabled="taskDetailModel.addFlag"
                                    @click="taskDetailModel.startAddField('photo')">图片</el-button>
                                <el-button type="success" plain size="small" :disabled="taskDetailModel.addFlag"
                                    @click="taskDetailModel.startAddField('audio')">音频</el-button>
                                <el-button type="success" plain size="small" :disabled="taskDetailModel.addFlag"
                                    @click="taskDetailModel.startAddField('video')">视频</el-button>
                            </el-button-group>
                        </div>
                    </div>
                </el-card>
            </div>
        </div>

        <!-- Field Edit Dialog -->
        <el-dialog title="修改字段配置" v-model="taskDetailModel.fieldDialogVisible" width="30%" append-to-body>
            <el-form :model="taskDetailModel.fieldDataForm" ref="editFieldFormRef" label-width="100px" size="small">
                <el-form-item label="字段描述" prop="field_dec" :rules="filedCommentRule">
                    <el-input v-model="taskDetailModel.fieldDataForm.field_dec" placeholder="业务名称" />
                </el-form-item>

                <template v-if="!['select', 'tree'].includes(taskDetailModel.currentField?.field_type)">
                    <el-form-item label="数据库字段" prop="field_name" :rules="filedNameRule">
                        <el-input v-model="taskDetailModel.fieldDataForm.field_name" placeholder="DB Field Name" />
                    </el-form-item>
                    <el-form-item label="存储长度" prop="field_length"
                        v-if="taskDetailModel.fieldDataForm.field_length !== null" :rules="filedLengthRule">
                        <el-input v-model="taskDetailModel.fieldDataForm.field_length" placeholder="Max Length" />
                    </el-form-item>
                </template>

                <el-form-item label="显示优先级" prop="show_flag">
                    <el-select v-model="taskDetailModel.fieldDataForm.show_flag" style="width:100%">
                        <el-option v-for="item in taskDetailModel.showFlagArr" :key="item" :label="'级别 ' + item"
                            :value="item" />
                    </el-select>
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="taskDetailModel.fieldDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="confirmEditField">确认保存</el-button>
            </template>
        </el-dialog>

        <!-- Delete Field Confirmation -->
        <el-dialog title="安全删除提示" v-model="taskDetailModel.deleteFieldDialogVisible" width="30%" append-to-body>
            <div style="display: flex; align-items: center; gap: 12px;">
                <el-icon size="24" color="#ef4444">
                    <WarningFilled />
                </el-icon>
                <span>确定删除字段 <b style="color:#ef4444">{{ taskDetailModel.deleteFieldName }}</b>
                    吗？数据同步可能受影响，删除后不可恢复。</span>
            </div>
            <template #footer>
                <el-button @click="taskDetailModel.deleteFieldDialogVisible = false">取消</el-button>
                <el-button type="danger" @click="taskDetailModel.deleteGatherTaskField()">确定删除</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { onMounted, ref, nextTick } from 'vue';
import { taskDetailStore } from "@/components/views/gather/task-detail/Controller/taskDetailStore.ts";
import { storeToRefs } from "pinia";
import {
    FolderOpened,
    Share,
    House,
    Memo,
    Edit,
    Check,
    Picture,
    Delete,
    CirclePlus,
    WarningFilled
} from '@element-plus/icons-vue';

const store = taskDetailStore();
const { taskDetailModel } = storeToRefs(store);

const layerTreeRef = ref(null);
const addFieldFormRef = ref(null);
const editFieldFormRef = ref(null);

// Validation Rules
const filedNameRule = [
    { required: true, message: '字段名称不能为空', trigger: 'blur' },
    { validator: window.validateA_Z, trigger: 'blur' }
];
const filedCommentRule = [
    { required: true, message: '字段描述不能为空', trigger: 'blur' }
];
const filedLengthRule = [
    { required: true, message: '字段长度不能为空', trigger: 'blur' },
    { validator: window.validateInteger, trigger: 'blur' }
];

onMounted(async () => {
    store.initClass();
    if (taskDetailModel.value) {
        await taskDetailModel.value.findGatherTaskTree();
        nextTick(() => {
            if (layerTreeRef.value) {
                layerTreeRef.value.setCurrentKey(taskDetailModel.value.currentNodeKey);
            }
        });
    }
});

const handleNodeClick = (data) => {
    taskDetailModel.value.handleNodeClick(data);
};

const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        taskDetailModel.value.choosePhoto(event.target.result);
    };
};

const handleDicChange = (type) => {
    const model = taskDetailModel.value;
    if (type === 'select') {
        const item = model.selectArrData.find(d => d.dicid === model.addFieldDataForm.selectDicId);
        if (item) {
            model.addFieldDataForm.selectFieldNameValue = item.dicname;
            model.addFieldDataForm.selectFieldCommentValue = item.dicms;
            model.addFieldDataForm.selectFieldLengthValue = item.diclength;
        }
    } else if (type === 'tree') {
        const item = model.treeArrData.find(d => d.treeid === model.addFieldDataForm.treeDicId);
        if (item) {
            model.addFieldDataForm.treeFieldNameValue = item.treename;
            model.addFieldDataForm.treeFieldCommentValue = item.treems;
            model.addFieldDataForm.treeFieldLengthValue = item.treelength;
        }
    }
};

const confirmAddField = () => {
    if (!addFieldFormRef.value) return;
    addFieldFormRef.value.validate((valid) => {
        if (valid) {
            taskDetailModel.value.addField();
        }
    });
};

const confirmEditField = () => {
    if (!editFieldFormRef.value) return;
    editFieldFormRef.value.validate((valid) => {
        if (valid) {
            taskDetailModel.value.editGatherTaskField();
        }
    });
};

</script>

<style scoped>
@import "./style/index.css";
</style>
