<template>
    <div class="gather-page-none-container" v-if="modelClass">
        <div class="titleClass">{{ modelClass.gatherTaskObj.name || '数据采集' }}</div>

        <!-- 表格视图 -->
        <div v-if="modelClass.showTableFlag">
            <div class="table-header">
                <div>
                    <el-tag type="info">空间类型: 无坐标</el-tag>
                </div>
                <el-button type="primary" :icon="Plus" @click="modelClass.prepareAdd()">新增数据</el-button>
            </div>

            <el-table :data="modelClass.tableData" v-loading="modelClass.loading" border stripe style="width: 100%">
                <el-table-column type="index" label="序号" width="60" align="center" />

                <!-- 动态生成列 (只显示部分字段以保持表格整洁) -->
                <el-table-column v-for="field in modelClass.fieldArr.slice(0, 5)" :key="field.field_name"
                    :prop="field.field_name" :label="field.field_dec" show-overflow-tooltip>
                    <template #default="{ row }">
                        <span v-if="['photo', 'video', 'audio'].includes(field.field_type)">
                            [多媒体数据]
                        </span>
                        <span v-else>{{ row[field.field_name] }}</span>
                    </template>
                </el-table-column>

                <el-table-column prop="gather_cjsj" label="采集时间" width="180" align="center" />
                <el-table-column prop="gather_cjr" label="采集人" width="120" align="center" />

                <el-table-column label="操作" width="150" fixed="right" align="center">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="modelClass.prepareEdit(row)">编辑</el-button>
                        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination v-model:current-page="modelClass.curPage" v-model:page-size="modelClass.pageSize"
                    :total="modelClass.total" :page-sizes="[10, 20, 50, 100]"
                    layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" />
            </div>
        </div>

        <!-- 表单视图 -->
        <div v-if="modelClass.showFormFlag" class="form-container">
            <div class="form-title">
                {{ modelClass.editFlag ? '编辑数据' : '新增数据' }}
            </div>

            <el-form label-width="120px" :model="modelClass.tableFieldValue">
                <el-form-item v-for="field in modelClass.fieldArr" :key="field.field_name" :label="field.field_dec">
                    <!-- 简单实现常用类型，复杂多媒体可根据需求引入 FieldComponent -->
                    <el-input v-if="['word', 'int'].includes(field.field_type) || !field.field_type"
                        v-model="modelClass.tableFieldValue[field.field_name]" :placeholder="'请输入' + field.field_dec" />

                    <el-date-picker v-else-if="field.field_type === 'time'"
                        v-model="modelClass.tableFieldValue[field.field_name]" type="datetime"
                        value-format="YYYY-MM-DD HH:mm:ss" :placeholder="'请选择' + field.field_dec" style="width: 100%" />

                    <el-select v-else-if="field.field_type === 'select'"
                        v-model="modelClass.tableFieldValue[field.field_name]" style="width: 100%">
                        <!-- 这里通常需要加载字典，为简化暂用输入框或空 -->
                        <el-option label="选项1" value="1" />
                    </el-select>

                    <div v-else>
                        <el-tag type="warning">不支持的编辑类型: {{ field.field_type }}</el-tag>
                    </div>
                </el-form-item>

                <div class="form-footer">
                    <el-button @click="modelClass.cancel()">取消</el-button>
                    <el-button type="primary" @click="modelClass.saveData()">保存</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from "pinia";
import { gatherPageStore } from "../Controller/gatherPageStore.ts";
import { Plus } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';

const route = useRoute();
const store = gatherPageStore();
const { modelClass } = storeToRefs(store);

onMounted(async () => {
    store.initClass();
    const taskid = route.query.taskid;
    if (taskid && modelClass.value) {
        await modelClass.value.findGatherTask(taskid);
        await modelClass.value.findGatherLayerField(taskid);
        await modelClass.value.findDataList();
    }
});

const handleSizeChange = (val) => {
    if (modelClass.value) {
        modelClass.value.pageSize = val;
        modelClass.value.curPage = 1;
        modelClass.value.findDataList();
    }
};

const handleCurrentChange = (val) => {
    if (modelClass.value) {
        modelClass.value.curPage = val;
        modelClass.value.findDataList();
    }
};

const handleDelete = (row) => {
    ElMessageBox.confirm('确定要删除这条数据吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        await modelClass.value.deleteData(row.gather_id);
    }).catch(() => { });
};

</script>

<style scoped>
@import "./style/index.css";
</style>
