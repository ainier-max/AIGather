<template>
    <div class="task-apply-container" v-if="taskApplyModel">
        <div class="titleClass">任务申请</div>

        <el-form :model="taskApplyModel.taskForm" label-width="120px" ref="formRef">
            <el-row>
                <el-col :span="12">
                    <el-form-item label="任务名称" prop="taskName" :rules="[{ required: true, message: '必填' }]">
                        <el-input v-model="taskApplyModel.taskForm.taskName"></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="任务表名" prop="taskTableName" :rules="[
                        { required: true, message: '必填', trigger: 'blur' },
                        { pattern: /^[A-Z]+$/, message: '必须全是大写英文字母', trigger: 'blur' }
                    ]">
                        <el-input v-model="taskApplyModel.taskForm.taskTableName" @input="handleTableNameInput">
                            <template #prepend>{{ taskApplyModel.getTableNamePrefix() }}</template>
                        </el-input>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-form-item label="任务描述">
                <el-input type="textarea" v-model="taskApplyModel.taskForm.taskDec"></el-input>
            </el-form-item>

            <el-form-item label="采集类型">
                <el-radio-group v-model="taskApplyModel.taskForm.gatherType">
                    <el-radio value="point">点</el-radio>
                    <el-radio value="polyline">线</el-radio>
                    <el-radio value="polygon">面</el-radio>
                    <el-radio value="none">无坐标</el-radio>
                </el-radio-group>
            </el-form-item>

            <el-form-item label="任务图标" v-if="taskApplyModel.taskForm.gatherType === 'point'">
                <div class="upload-icon-wrapper"
                    :style="taskApplyModel.layerImage ? { backgroundImage: `url(${taskApplyModel.layerImage})`, backgroundSize: 'cover' } : {}">
                    <el-icon v-if="!taskApplyModel.layerImage">
                        <Plus />
                    </el-icon>
                    <input type="file" @change="handleFileChange" accept="image/*" />
                </div>
            </el-form-item>

            <el-divider content-position="left">字段信息</el-divider>
            <div>
                <el-button-group style="margin-bottom: 20px;">
                    <el-button type="primary" size="small" @click="addField('word', '文本字段', 'TEXT')">文本</el-button>
                    <el-button type="success" size="small" @click="addField('int', '数字字段', 'NUM')">数字</el-button>
                    <el-button type="warning" size="small" @click="addField('time', '时间字段', 'TIME')">时间</el-button>
                    <el-button type="danger" size="small" @click="addField('image', '照片说明', 'PHOTO')">照片</el-button>
                    <el-button type="info" size="small" @click="addField('video', '视频说明', 'VIDEO')">视频</el-button>
                    <el-button size="small" @click="addField('select', '下拉字典', 'DIC')">下拉</el-button>
                    <el-button size="small" @click="addField('tree', '树形字典', 'TREE')">树形</el-button>
                </el-button-group>

                <div v-for="(field, index) in taskApplyModel.fieldDataForm.fileds" :key="index"
                    style="margin-bottom: 15px; border: 1px solid #EBEEF5; padding: 10px;">
                    <el-row :gutter="10">
                        <el-col :span="6">
                            <el-input v-model="field.filedNameValue" placeholder="字段名"
                                :disabled="['select', 'tree'].includes(field.type)">
                                <template #prepend>字段名</template>
                            </el-input>
                        </el-col>
                        <el-col :span="6">
                            <el-input v-model="field.filedCommentValue" placeholder="描述"
                                :disabled="['select', 'tree'].includes(field.type)">
                                <template #prepend>描述</template>
                            </el-input>
                        </el-col>
                        <el-col :span="4">
                            <el-tag>{{ field.type }}</el-tag>
                        </el-col>
                        <el-col :span="6" v-if="['select', 'tree'].includes(field.type)">
                            <el-select v-model="field.dicid" placeholder="选择字典"
                                @change="(val) => handleDicChange(field, val)">
                                <template v-if="field.type === 'select'">
                                    <el-option v-for="dic in taskApplyModel.allSelectdics" :key="dic.dicid"
                                        :label="dic.dicname" :value="dic.dicid" />
                                </template>
                                <template v-else>
                                    <el-option v-for="dic in taskApplyModel.allTreedics" :key="dic.treeid"
                                        :label="dic.treems" :value="dic.treeid" />
                                </template>
                            </el-select>
                        </el-col>
                        <el-col :span="2">
                            <el-button type="danger" :icon="Minus" @click="removeField(index)"
                                v-if="field.filedNameValue !== 'GATHER_NAME'"></el-button>
                        </el-col>
                    </el-row>
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <el-button type="primary" size="large" @click="submit">提交申请</el-button>
            </div>
        </el-form>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { taskApplyStore } from "@/components/views/gather/task-apply/Controller/taskApplyStore.ts";
import { storeToRefs } from "pinia";
import { Plus, Minus } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const store = taskApplyStore();
const { taskApplyModel } = storeToRefs(store);
const formRef = ref(null);
const router = useRouter();

onMounted(() => {
    store.initClass();
    console.log("onMounted--taskApplyModel", taskApplyModel);
});

const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && taskApplyModel.value) {
        taskApplyModel.value.photoObj = file;
        const reader = new FileReader();
        reader.onload = (evt) => {
            taskApplyModel.value.layerImage = evt.target.result;
        };
        reader.readAsDataURL(file);
    }
}

const addField = (type, dec, name) => {
    if (taskApplyModel.value) {
        const count = taskApplyModel.value.fieldDataForm.fileds.length;
        taskApplyModel.value.addField(type, dec, name + '_' + count);
    }
}

const removeField = (index) => {
    if (taskApplyModel.value) {
        taskApplyModel.value.removeField(index);
    }
}

const handleTableNameInput = (val) => {
    if (taskApplyModel.value) {
        taskApplyModel.value.taskForm.taskTableName = val.toUpperCase().replace(/[^A-Z]/g, '');
    }
}

const handleDicChange = (field, dicid) => {
    const isSelect = field.type === 'select';
    const dics = isSelect ? taskApplyModel.value.allSelectdics : taskApplyModel.value.allTreedics;
    const idKey = isSelect ? 'dicid' : 'treeid';
    const selectedDic = dics.find(d => d[idKey] === dicid);

    if (selectedDic) {
        if (isSelect) {
            field.filedNameValue = selectedDic.dicname;
            field.filedCommentValue = selectedDic.dicms;
        } else {
            field.filedNameValue = selectedDic.treename; // Using ID as name or should it also be treems? Based on user's earlier requirement for sync.
            field.filedCommentValue = selectedDic.treems;
        }
    }
}

const submit = async () => {
    if (!formRef.value) return;
    await formRef.value.validate(async (valid) => {
        if (valid) {
            const uid = localStorage.getItem('loginUserid');
            if (!uid) {
                ElMessage.error('请登录');
                return;
            }
            const success = await taskApplyModel.value.submitTask(uid);
            if (success) {
                router.push({ name: 'task-approval' });
            }
        }
    })
}
</script>

<style scoped>
@import "./style/index.css";
</style>