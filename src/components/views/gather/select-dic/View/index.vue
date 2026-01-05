<template>
    <div class="select-dic-container" v-if="selectDicModel">
        <div class="titleClass">下拉框字典管理</div>

        <el-card class="section-card" shadow="never">
            <template #header>
                <div style="font-weight: 600;">创建下拉框字典</div>
            </template>
            <el-form :model="selectDicModel.ruleForm" :rules="rules" ref="ruleFormRef" label-width="100px" size="small">
                <el-form-item label="字段名" prop="dicname">
                    <el-input v-model="selectDicModel.ruleForm.dicname"
                        placeholder="请输入下拉框字典字段名（如：COLOR）*数据库表的字段名"></el-input>
                </el-form-item>
                <el-form-item label="字段描述" prop="dicms">
                    <el-input v-model="selectDicModel.ruleForm.dicms" placeholder="请输入下拉框字典字段名称（如：颜色）"></el-input>
                </el-form-item>
                <el-form-item label="字段长度" prop="diclength">
                    <el-input v-model="selectDicModel.ruleForm.diclength" placeholder="请输入下拉框字典字段名称长度（如：30）"></el-input>
                </el-form-item>
                <div style="text-align: center;">
                    <el-button type="primary" size="small" @click="onSubmit">创建下拉框字典</el-button>
                </div>
            </el-form>
        </el-card>

        <el-card class="section-card" shadow="never">
            <template #header>
                <div style="font-weight: 600;">下拉框字典选项维护</div>
            </template>

            <el-select v-model="selectDicModel.currentDicid" style="width:100%" placeholder="请选择" size="small">
                <el-option v-for="item in selectDicModel.dics" :key="item.dicid" :label="item.dicms"
                    :value="item.dicid">
                </el-option>
            </el-select>

            <div class="maintenance-panel">
                <select multiple v-model="selectDicModel.currentDicDataids" size="5">
                    <option v-for="item in selectDicModel.dicdatas" :key="item.dicdataid" :value="item.dicdataid">
                        {{ item.dicdataname }}
                    </option>
                </select>
            </div>

            <div class="action-bar">
                <el-button type="primary" size="small" :icon="Plus"
                    @click="selectDicModel.showSelectDicDataWin()">添加选项</el-button>
                <el-button type="danger" size="small" :icon="Delete"
                    @click="selectDicModel.deleteDicData()">删除选项</el-button>
                <el-button type="danger" size="small" :icon="DeleteFilled"
                    @click="selectDicModel.deleteDicWin()">删除字典</el-button>
            </div>
        </el-card>

        <!-- Add Option Dialog -->
        <el-dialog title="添加选项" v-model="selectDicModel.dialogVisible" width="30%" append-to-body>
            <el-form :model="selectDicModel.selectDicDataForm" :rules="selectDicrules" ref="selectDicDataFormRef"
                label-width="100px">
                <el-form-item label="选项内容" prop="dicdataname">
                    <el-input v-model="selectDicModel.selectDicDataForm.dicdataname" placeholder="请输入选项内容"></el-input>
                </el-form-item>
            </el-form>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="selectDicModel.cancle()">取 消</el-button>
                    <el-button type="primary" @click="addSelectDicData">确 定</el-button>
                </span>
            </template>
        </el-dialog>

        <!-- Delete Dic Confirmation -->
        <el-dialog title="确认框" v-model="selectDicModel.deleteDicDialogVisible" width="30%" append-to-body>
            <span style="color:red">将要删除该字典与其所属的所有选项？此操作不可恢复。</span>
            <template #footer>
                <span class="dialog-footer">
                    <el-button @click="selectDicModel.deleteDicCancle()">取 消</el-button>
                    <el-button type="primary" @click="selectDicModel.deleteDic()">确 定</el-button>
                </span>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { selectDicStore } from "@/components/views/gather/select-dic/Controller/selectDicStore.ts";
import { storeToRefs } from "pinia";
import { Plus, Delete, DeleteFilled } from '@element-plus/icons-vue';

const store = selectDicStore();
const { selectDicModel } = storeToRefs(store);

const ruleFormRef = ref(null);
const selectDicDataFormRef = ref(null);

const rules = {
    dicname: [
        { required: true, message: '字段名称不能为空', trigger: 'blur' },
        { validator: window.validateA_Z, trigger: 'blur' }
    ],
    dicms: [
        { required: true, message: '字段描述不能为空', trigger: 'blur' }
    ],
    diclength: [
        { required: true, message: '字段长度不能为空', trigger: 'blur' },
        { validator: window.validateInteger, trigger: 'blur' }
    ],
};

const selectDicrules = {
    dicdataname: [
        { required: true, message: '选项名称不能为空', trigger: 'blur' }
    ],
};

onMounted(() => {
    store.initClass();
    if (selectDicModel.value) {
        selectDicModel.value.findAllSelectDic();
    }
});

watch(() => selectDicModel.value?.currentDicid, (newVal) => {
    if (selectDicModel.value && newVal) {
        selectDicModel.value.findSelectDicData(newVal);
    }
}, { immediate: true });

const onSubmit = () => {
    if (!ruleFormRef.value) return;
    ruleFormRef.value.validate((valid) => {
        if (valid) {
            selectDicModel.value.createSelectDic();
        }
    });
};

const addSelectDicData = () => {
    if (!selectDicDataFormRef.value) return;
    selectDicDataFormRef.value.validate((valid) => {
        if (valid) {
            selectDicModel.value.addSelectDicData();
        }
    });
};

</script>

<style scoped>
@import "./style/index.css";
</style>
