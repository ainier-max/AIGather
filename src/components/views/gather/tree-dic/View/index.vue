<template>
    <div class="tree-dic-container" v-if="treeDicModel">
        <div class="titleClass">树形字典管理</div>

        <div class="content-wrapper">
            <!-- Create Section -->
            <el-card class="section-card" shadow="never">
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <Plus />
                        </el-icon>
                        <span>创建树形字典</span>
                    </div>
                </template>

                <el-row :gutter="40" justify="center">
                    <el-col :xs="24" :sm="20" :md="16" :lg="12">
                        <el-form :model="treeDicModel.ruleForm" :rules="rules" ref="ruleFormRef" label-width="100px"
                            status-icon>
                            <el-form-item label="字段名" prop="treename">
                                <el-input v-model="treeDicModel.ruleForm.treename" placeholder="请输入树形字典字段名 (例: ZZJG)">
                                    <template #prefix>
                                        <el-icon>
                                            <Postcard />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="字段描述" prop="treems">
                                <el-input v-model="treeDicModel.ruleForm.treems" placeholder="请输入树形字典描述 (例: 组织机构)">
                                    <template #prefix>
                                        <el-icon>
                                            <Document />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>
                            <el-form-item label="字段长度" prop="treelength">
                                <el-input v-model="treeDicModel.ruleForm.treelength" placeholder="请输入字段最大长度 (例: 30)">
                                    <template #prefix>
                                        <el-icon>
                                            <Handbag />
                                        </el-icon>
                                    </template>
                                </el-input>
                            </el-form-item>

                            <div style="text-align: center; margin-top: 20px;">
                                <el-button type="primary" size="large" @click="onSubmit" :icon="CirclePlus">
                                    立即创建树形字典
                                </el-button>
                            </div>
                        </el-form>
                    </el-col>
                </el-row>
            </el-card>

            <!-- Maintenance Section -->
            <el-card class="section-card" shadow="never">
                <template #header>
                    <div class="card-header">
                        <el-icon>
                            <Edit />
                        </el-icon>
                        <span>树形字典选项维护</span>
                    </div>
                </template>

                <div class="maintenance-content">
                    <el-select v-model="treeDicModel.currentTreeDicid" filterable style="width:100%"
                        placeholder="选择一个树形字典进行维护">
                        <el-option v-for="item in treeDicModel.treedics" :key="item.treeid" :label="item.treems"
                            :value="item.treeid">
                            <span style="float: left">{{ item.treems }}</span>
                            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.treename }}</span>
                        </el-option>
                    </el-select>

                    <div class="tree-panel">
                        <el-tree :data="treeDicModel.treeData" default-expand-all :expand-on-click-node="false"
                            :props="treeDicModel.defaultProps" :highlight-current="true" @node-click="handleNodeClick"
                            node-key="id">
                            <template #default="{ node, data }">
                                <span class="custom-tree-node">
                                    <el-icon style="margin-right: 6px; color: #64748b;">
                                        <FolderOpened v-if="data.children" />
                                        <Document v-else />
                                    </el-icon>
                                    <span>{{ node.label }}</span>
                                </span>
                            </template>
                        </el-tree>
                    </div>

                    <div class="action-bar">
                        <el-button-group>
                            <el-button type="primary" :icon="Plus"
                                @click="treeDicModel.showTreeDicDataAddWin()">添加节点</el-button>
                            <el-button type="primary" :icon="Edit"
                                @click="treeDicModel.showTreeDicDataEditWin()">修改节点</el-button>
                        </el-button-group>

                        <el-button-group style="margin-left: 20px;">
                            <el-button type="danger" plain :icon="Delete"
                                @click="treeDicModel.deleteTreeDataWin()">删除节点</el-button>
                            <el-button type="danger" :icon="DeleteFilled"
                                @click="treeDicModel.deleteTreeDicWin()">删除整个字典</el-button>
                        </el-button-group>
                    </div>
                </div>
            </el-card>
        </div>

        <!-- Add/Edit Dialog -->
        <el-dialog :title="treeDicModel.treeDialogTitle" v-model="treeDicModel.dialogVisible" width="35%"
            :before-close="handleClose" destroy-on-close align-center>
            <el-form :model="treeDicModel.treeDicDataForm" :rules="treeDicrules" ref="treeDicDataFormRef"
                label-width="110px">
                <el-form-item label="树节点ID" prop="treeid">
                    <el-input v-if="treeDicModel.editFlag == 0" v-model="treeDicModel.treeDicDataForm.treeid"
                        placeholder="请输入唯一的节点ID" />
                    <el-input v-if="treeDicModel.editFlag == 1" v-model="treeDicModel.treeDicDataForm.treeid" disabled
                        placeholder="节点ID" />
                </el-form-item>
                <el-form-item label="树节点内容" prop="treems">
                    <el-input v-model="treeDicModel.treeDicDataForm.treems" placeholder="请输入节点显示的名称" />
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="cancle">取 消</el-button>
                    <el-button v-if="treeDicModel.editFlag == 0" type="primary" @click="addTreeDicData">确认添加</el-button>
                    <el-button v-if="treeDicModel.editFlag == 1" type="primary"
                        @click="editTreeDicData">确认修改</el-button>
                </span>
            </template>
        </el-dialog>


        <!-- Delete Node Confirmation -->
        <el-dialog title="安全删除确认" v-model="treeDicModel.deleteTreeDataDialogVisible" width="30%" align-center>
            <div style="display: flex; align-items: center;">
                <el-icon size="24" color="#ef4444" style="margin-right: 12px;">
                    <WarningFilled />
                </el-icon>
                <span>将要删除 <b style="color:#ef4444">{{ treeDicModel.currentTreeLabel }}</b> 及其所属的所有子选项，确定继续吗？</span>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="treeDicModel.deleteTreeDataDialogVisible = false">取消</el-button>
                    <el-button type="danger" @click="treeDicModel.deleteTreeData()">确定删除</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- Delete Dic Confirmation -->
        <el-dialog title="高危操作确认" v-model="treeDicModel.deleteTreeDicDialogVisible" width="30%" align-center>
            <div style="display: flex; align-items: center;">
                <el-icon size="24" color="#ef4444" style="margin-right: 12px;">
                    <WarningFilled />
                </el-icon>
                <span>将要永久删除该树形字典，数据不可恢复！确定执行此操作吗？</span>
            </div>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="treeDicModel.deleteTreeDicDialogVisible = false">取消</el-button>
                    <el-button type="danger" @click="treeDicModel.deleteTreeDic()">持久化删除</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { treeDicStore } from "@/components/views/gather/tree-dic/Controller/treeDicStore.ts";
import { storeToRefs } from "pinia";
import { ElMessage, ElMessageBox } from 'element-plus';
import {
    Plus,
    Edit,
    Delete,
    DeleteFilled,
    CirclePlus,
    Postcard,
    Document,
    Handbag,
    FolderOpened,
    WarningFilled
} from '@element-plus/icons-vue';

const store = treeDicStore();
const { treeDicModel } = storeToRefs(store);

const ruleFormRef = ref(null);
const treeDicDataFormRef = ref(null);

const rules = {
    treename: [
        { required: true, message: '字段名称不能为空', trigger: 'blur' },
        { validator: window.validateA_Z, trigger: 'blur' }
    ],
    treems: [
        { required: true, message: '字段描述不能为空', trigger: 'blur' }
    ],
    treelength: [
        { required: true, message: '字段长度不能为空', trigger: 'blur' },
        { validator: window.validateInteger, trigger: 'blur' }
    ],
};

const treeDicrules = {
    treeid: [
        { required: true, message: '树节点ID不能为空', trigger: 'blur' }
    ],
    treems: [
        { required: true, message: '树节点内容不能为空', trigger: 'blur' }
    ],
};

onMounted(() => {
    store.initClass();
    if (treeDicModel.value) {
        treeDicModel.value.findAllTreeDic();
    }
});

// Watchers
watch(() => treeDicModel.value?.currentTreeDicid, (newVal) => {
    if (treeDicModel.value && newVal) {
        console.log('深度监听-新数据-currentTreeDicid', newVal);
        treeDicModel.value.findTreeDic(newVal);
    }
}, { deep: true });

const onSubmit = () => {
    if (!ruleFormRef.value) return;
    ruleFormRef.value.validate((valid) => {
        if (valid) {
            treeDicModel.value.createTreeDic();
        }
    });
};

const handleNodeClick = (data) => {
    treeDicModel.value.handleNodeClick(data);
};

const handleClose = (done) => {
    ElMessageBox.confirm('确认关闭正在编辑的窗口吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
    }).then(() => {
        treeDicModel.value.currentTreeid = "";
        treeDicModel.value.currentTreeLabel = "";
        done();
        treeDicModel.value.dialogVisible = false;
    }).catch(() => { });
};

const cancle = () => {
    treeDicModel.value.dialogVisible = false;
    treeDicModel.value.treeDicDataForm.treeid = "";
    treeDicModel.value.treeDicDataForm.treems = "";
};

const addTreeDicData = () => {
    if (!treeDicDataFormRef.value) return;
    treeDicDataFormRef.value.validate((valid) => {
        if (valid) {
            treeDicModel.value.addTreeDicData();
        }
    });
};

const editTreeDicData = () => {
    if (!treeDicDataFormRef.value) return;
    treeDicDataFormRef.value.validate((valid) => {
        if (valid) {
            treeDicModel.value.editTreeDicData();
        }
    });
};

</script>

<style scoped>
@import "./style/index.css";

.maintenance-content {
    padding: 10px 0;
}

.custom-tree-node b {
    color: #ef4444;
}

:deep(.el-card__body) {
    padding: 15px 20px;
}
</style>
