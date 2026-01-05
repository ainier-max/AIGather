<template>
    <div style="height: 100%;" v-if="treeDicModel">
        <div class="titleClass">树形字典</div>
        <div style="margin:40px 50px">
            <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">创建树形字典</span>
            </el-divider>
            <el-form :model="treeDicModel.ruleForm" :rules="rules" ref="ruleFormRef" label-width="100px">
                <el-form-item label="字段名" prop="treename">
                    <el-input v-model="treeDicModel.ruleForm.treename"
                        placeholder="请输入树形字典字段名（如：ZZJG）*数据库表的字段名"></el-input>
                </el-form-item>
                <el-form-item label="字段描述" prop="treems">
                    <el-input v-model="treeDicModel.ruleForm.treems" placeholder="请输入树形字典字段名称（如：组织机构）"></el-input>
                </el-form-item>
                <el-form-item label="字段长度" prop="treelength">
                    <el-input v-model="treeDicModel.ruleForm.treelength" placeholder="请输入树形字典字段名称长度（如：30）"></el-input>
                </el-form-item>
            </el-form>
            <div align="center">
                <el-button type="primary" @click="onSubmit">创建树形字典</el-button>
            </div>

            <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">树形字典选项维护</span>
            </el-divider>

            <el-select v-model="treeDicModel.currentTreeDicid" style="width:100%" placeholder="请选择">
                <el-option v-for="item in treeDicModel.treedics" :key="item.treeid" :label="item.treems"
                    :value="item.treeid">
                </el-option>
            </el-select>

            <div style="height: 300px;border: 1px solid gray;margin-top:30px; overflow: auto;">
                <el-tree :data="treeDicModel.treeData" default-expand-all :expand-on-click-node="false"
                    :props="treeDicModel.defaultProps" :highlight-current="true"
                    @node-click="handleNodeClick"></el-tree>
            </div>

            <div align="center" style="padding-top: 20px">
                <el-button type="primary" @click="treeDicModel.showTreeDicDataAddWin()">添加树节点</el-button>
                <el-button type="primary" @click="treeDicModel.showTreeDicDataEditWin()">修改树节点</el-button>
                <el-button type="danger" @click="treeDicModel.deleteTreeDataWin()">删除树节点</el-button>
                <el-button type="danger" @click="treeDicModel.deleteTreeDicWin()">删除树形字典</el-button>
            </div>
            <div style="height: 50px"></div>
        </div>

        <!-- Add/Edit Dialog -->
        <el-dialog :title="treeDicModel.treeDialogTitle" v-model="treeDicModel.dialogVisible" width="30%"
            :before-close="handleClose">
            <el-form :model="treeDicModel.treeDicDataForm" :rules="treeDicrules" ref="treeDicDataFormRef"
                label-width="100px">
                <el-form-item label="树节点ID" prop="treeid">
                    <el-input v-if="treeDicModel.editFlag == 0" v-model="treeDicModel.treeDicDataForm.treeid"
                        placeholder="树节点ID"></el-input>
                    <el-input v-if="treeDicModel.editFlag == 1" v-model="treeDicModel.treeDicDataForm.treeid" disabled
                        placeholder="树节点ID"></el-input>
                </el-form-item>
                <el-form-item label="树节点内容" prop="treems">
                    <el-input v-model="treeDicModel.treeDicDataForm.treems" placeholder="树节点内容"></el-input>
                </el-form-item>
            </el-form>

            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="cancle">取 消</el-button>
                    <el-button v-if="treeDicModel.editFlag == 0" type="primary" @click="addTreeDicData">确 定</el-button>
                    <el-button v-if="treeDicModel.editFlag == 1" type="primary" @click="editTreeDicData">确 定</el-button>
                </span>
            </template>
        </el-dialog>


        <!-- Delete Node Confirmation -->
        <el-dialog title="确认框" v-model="treeDicModel.deleteTreeDataDialogVisible" width="30%">
            <span style="color:red">将要删除( {{ treeDicModel.currentTreeLabel }} )与其所属的所有选项？</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="treeDicModel.deleteTreeDataDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="treeDicModel.deleteTreeData()">确 定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- Delete Dic Confirmation -->
        <el-dialog title="确认框" v-model="treeDicModel.deleteTreeDicDialogVisible" width="30%">
            <span style="color:red">将要删除该树形字典,数据不可恢复！</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="treeDicModel.deleteTreeDicDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="treeDicModel.deleteTreeDic()">确 定</el-button>
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
        // treeDicModel.value.currentTreeid = ""; // Handled in findTreeDic
        // treeDicModel.value.currentTreeLabel = "";
        console.log('深度监听-新数据-currentTreeDicid', newVal);
        treeDicModel.value.findTreeDic(newVal);
    }
}, { deep: true });

// Note: In original code, currentTreeTableName watcher called findTreeDicData.
// In Model refactoring, findTreeDic calls findTreeDicData directly after setting tableName.
// So we might not strictly need to watch tableName here if the Model logic flows sequentially.
// But to ensure reactivity if it changes otherwise:
watch(() => treeDicModel.value?.currentTreeTableName, (newVal) => {
    // This might be redundant if findTreeDic already calls findTreeDicData, 
    // but useful if tableName is set via other means.
    // console.log('深度监听-新数据-currentTreeTableName', newVal);
    // if (newVal && treeDicModel.value) {
    //     treeDicModel.value.findTreeDicData(newVal);
    // }
});

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
    ElMessageBox.confirm('确认关闭？')
        .then(() => {
            treeDicModel.value.currentTreeid = "";
            treeDicModel.value.currentTreeLabel = "";
            done();
            treeDicModel.value.dialogVisible = false; // Ensure it closes model prop
        })
        .catch(() => { });
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
</style>
