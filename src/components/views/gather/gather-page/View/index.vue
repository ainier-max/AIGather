<template>
    <div class="gather-page-none-container" v-if="gatherPageModel">
        <div class="titleClass">{{ gatherPageModel.gatherTaskObj.name || '数据采集' }}</div>

        <!-- 表格视图 -->
        <div v-if="gatherPageModel.showTableFlag">
            <div class="table-header">
                <div>
                    <el-tag type="info">空间类型: 无坐标</el-tag>
                </div>
                <el-button type="primary" :icon="Plus" @click="gatherPageModel.prepareAdd()">新增数据</el-button>
            </div>

            <el-table :data="gatherPageModel.tableData" v-loading="gatherPageModel.loading" border stripe
                style="width: 100%">
                <el-table-column type="index" label="序号" width="60" align="center" />

                <!-- 动态生成列 -->
                <el-table-column v-for="field in displayFields" :key="field.field_name" :prop="field.field_name"
                    :label="field.field_dec"
                    :width="['photo', 'video', 'audio', 'rich'].includes(field.field_type) ? 120 : ''" align="center">
                    <template #default="{ row }">
                        <!-- 照片展示 -->
                        <div v-if="field.field_type === 'photo' && row[field.field_name]" class="table-media-preview">
                            <div class="media-icon-wrapper">
                                <el-button type="primary" :icon="Picture" circle size="small" />
                                <el-image class="hidden-preview-trigger"
                                    :src="commonApi.getFileUrl(row[field.field_name].split(',')[0], 'photo')"
                                    :preview-src-list="row[field.field_name].split(',').map(uuid => commonApi.getFileUrl(uuid, 'photo'))"
                                    preview-teleported fit="cover" />
                            </div>
                        </div>

                        <!-- 音频展示 -->
                        <div v-else-if="field.field_type === 'audio' && row[field.field_name]"
                            class="table-media-preview">
                            <el-popover placement="top" :width="300" trigger="hover">
                                <template #reference>
                                    <el-button type="info" :icon="Headset" circle size="small" />
                                </template>
                                <div class="audio-list-popover">
                                    <audio v-for="(uuid, idx) in row[field.field_name].split(',')" :key="idx" controls
                                        style="width: 100%; margin-bottom: 5px;">
                                        <source :src="commonApi.getFileUrl(uuid, 'audio')" type="audio/mpeg">
                                    </audio>
                                </div>
                            </el-popover>
                        </div>

                        <!-- 视频展示 -->
                        <div v-else-if="field.field_type === 'video' && row[field.field_name]"
                            class="table-media-preview">
                            <el-popover placement="top" :width="320" trigger="hover">
                                <template #reference>
                                    <el-button type="warning" :icon="VideoCamera" circle size="small" />
                                </template>
                                <div class="video-list-popover">
                                    <video v-for="(uuid, idx) in row[field.field_name].split(',')" :key="idx" controls
                                        style="width: 100%; margin-bottom: 5px; border-radius: 4px;">
                                        <source :src="commonApi.getFileUrl(uuid, 'video')" type="video/mp4">
                                    </video>
                                </div>
                            </el-popover>
                        </div>

                        <!-- 富文本展示 -->
                        <div v-else-if="field.field_type === 'rich' && row[field.field_name]"
                            class="table-media-preview">
                            <el-popover placement="top" :width="600" trigger="hover">
                                <template #reference>
                                    <el-button type="success" :icon="Document" circle size="small" />
                                </template>
                                <div class="rich-list-popover-content">
                                    <div class="rich-preview-window" v-html="row[field.field_name]"></div>
                                </div>
                            </el-popover>
                        </div>

                        <span v-else>{{ row[field.field_name] }}</span>
                    </template>
                </el-table-column>

                <el-table-column prop="gather_cjsj" label="采集时间" width="180" align="center" />
                <el-table-column prop="gather_cjr" label="采集人" width="120" align="center" />

                <el-table-column label="操作" width="150" fixed="right" align="center">
                    <template #default="{ row }">
                        <el-button type="primary" link @click="gatherPageModel.prepareEdit(row)">编辑</el-button>
                        <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-container">
                <el-pagination v-model:current-page="gatherPageModel.curPage"
                    v-model:page-size="gatherPageModel.pageSize" :total="gatherPageModel.total"
                    :page-sizes="[10, 20, 50, 100]" layout="total, sizes, prev, pager, next, jumper"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </div>

        <!-- 表单视图 -->
        <div v-if="gatherPageModel.showFormFlag" class="form-container">
            <div class="form-title">
                <el-icon style="margin-right: 8px;">
                    <EditPen />
                </el-icon>
                {{ gatherPageModel.editFlag ? '修改现有数据' : '采集新数据' }}
            </div>

            <div class="form-body">
                <div v-for="field in gatherPageModel.fieldArr" :key="field.field_name">
                    <field-component :ref="el => setFieldRef(field.field_name, el)" :field="field"
                        :valueObj="gatherPageModel.currentEditObj" />
                </div>
            </div>

            <div class="form-footer">
                <el-button @click="gatherPageModel.cancel()">放弃更改</el-button>
                <el-button type="primary" @click="handleSave()" :icon="Check">提交并保存</el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from "pinia";
import { gatherPageStore } from "../Controller/gatherPageStore.ts";
import FieldComponent from "./components/FieldComponent.vue";
import { Plus, EditPen, Check, VideoCamera, Headset, Picture, Document } from '@element-plus/icons-vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import commonApi from '@/api/common';

const route = useRoute();
const store = gatherPageStore();
const { gatherPageModel } = storeToRefs(store);

// 过滤列表显示的字段 (只限 show_flag 为 '1' 或 '2')
const displayFields = computed(() => {
    if (!gatherPageModel.value || !gatherPageModel.value.fieldArr) return [];
    return gatherPageModel.value.fieldArr.filter(f => f.show_flag == '1' || f.show_flag == '2');
});

// 字段组件引用
const fieldRefs = ref({});

/**
 * 设置字段组件引用
 */
function setFieldRef(fieldName, el) {
    if (el) {
        fieldRefs.value[fieldName] = el;
    }
}

onMounted(async () => {
    store.initClass();
    const taskid = route.query.taskid;
    if (taskid && gatherPageModel.value) {
        await gatherPageModel.value.findGatherTask(taskid);
        await gatherPageModel.value.findGatherLayerField(taskid);
        await gatherPageModel.value.findDataList();
    }
});

const handleSizeChange = (val) => {
    if (gatherPageModel.value) {
        gatherPageModel.value.pageSize = val;
        gatherPageModel.value.curPage = 1;
        gatherPageModel.value.findDataList();
    }
};

const handleCurrentChange = (val) => {
    if (gatherPageModel.value) {
        gatherPageModel.value.curPage = val;
        gatherPageModel.value.findDataList();
    }
};

const handleDelete = (row) => {
    ElMessageBox.confirm('确定要删除这条数据吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(async () => {
        await gatherPageModel.value.deleteData(row.gather_id);
    }).catch(() => { });
};

const handleSave = async () => {
    // 检查文件上传状态
    for (let i = 0; i < gatherPageModel.value.fieldArr.length; i++) {
        const field = gatherPageModel.value.fieldArr[i];
        if (field.field_type === 'photo' || field.field_type === 'audio' || field.field_type === 'video') {
            const fieldRef = fieldRefs.value[field.field_name];
            if (fieldRef && fieldRef.fileEndFlag === false) {
                ElMessage.error('文件未上传完成，请稍后保存！');
                return;
            }
        }
    }
    await gatherPageModel.value.saveData();
};

</script>

<style scoped>
@import "./style/index.css";
</style>
