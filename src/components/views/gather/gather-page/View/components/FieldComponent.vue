<template>
  <div class="field-item-wrapper">
    <!-- 标示必填或显示级别 -->
    <div class="field-label-row">
      <span class="field-label" :class="{ 'is-required': field.show_flag == '1' }">
        {{ field.field_dec }}
      </span>
      <span v-if="field.is_coordinate" class="coordinate-tag">系统自动赋值</span>
    </div>

    <div class="field-input-container">
      <!-- 文本字段 -->
      <template v-if="field.field_type == 'word'">
        <el-input v-model="fieldModel.wordFieldValue" :placeholder="'请输入' + field.field_dec"
          :disabled="field.is_coordinate"></el-input>
      </template>

      <!-- 时间字段 -->
      <template v-if="field.field_type == 'time'">
        <el-date-picker style="width:100%" v-model="fieldModel.timeFieldValue" type="datetime"
          :placeholder="'请选择' + field.field_dec" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss">
        </el-date-picker>
      </template>

      <!-- 富文本字段 -->
      <template v-if="field.field_type == 'rich'">
        <div class="media-input-box">
          <el-button :type="fieldModel.richButtonType" size="small" @click="fieldModel.showRichWin">
            {{ fieldModel.richFieldValue ? '已编辑内容 (点击修改)' : '开启富文本编辑' }}
          </el-button>
        </div>
      </template>

      <!-- 下拉框字段 -->
      <template v-if="field.field_type == 'select'">
        <el-select v-model="fieldModel.selectFieldValue" @change="filedSelectChange" style="width:100%"
          :placeholder="'请选择' + field.field_dec">
          <el-option v-for="selectItem in fieldModel.selectArrData" :key="selectItem.dicdataid"
            :label="selectItem.dicdataname" :value="selectItem.dicdataname">
          </el-option>
        </el-select>
      </template>

      <!-- 树形选择字段 -->
      <template v-if="field.field_type == 'tree'">
        <div class="media-input-box">
          <el-button :type="fieldModel.treeButtonType" size="small" @click="fieldModel.showTreeWin">
            {{ fieldModel.treeFieldValue ? '已选: ' + fieldModel.treeFieldValue : '开启树形选择' }}
          </el-button>
        </div>
      </template>

      <!-- 文件上传字段 (照片/音频/视频) -->
      <template v-if="['photo', 'audio', 'video'].includes(field.field_type)">
        <div class="upload-section">
          <!-- 媒体预览区域 -->
          <div class="media-preview-list"
            v-if="(fieldModel.editPhotoArr && fieldModel.editPhotoArr.length > 0) || (fieldModel.editAudioArr && fieldModel.editAudioArr.length > 0) || (fieldModel.editVideoArr && fieldModel.editVideoArr.length > 0)">

            <!-- 照片 -->
            <template v-if="field.field_type == 'photo'">
              <div v-for="(uuid, i) in fieldModel.editPhotoArr" :key="i" class="preview-item photo">
                <img :src="commonApi.getFileUrl(uuid, 'photo')" class="thumb">
                <div class="remove-overlay" @click="fieldModel.removePhotoByUUID(uuid)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </div>
              </div>
            </template>

            <!-- 音频 -->
            <template v-if="field.field_type == 'audio'">
              <div v-for="(uuid, i) in fieldModel.editAudioArr" :key="i" class="preview-item audio">
                <audio controls>
                  <source :src="commonApi.getFileUrl(uuid, 'audio')" type="audio/mpeg">
                </audio>
                <div class="remove-overlay" @click="fieldModel.removeAudioByUUID(uuid)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </div>
              </div>
            </template>

            <!-- 视频 -->
            <template v-if="field.field_type == 'video'">
              <div v-for="(uuid, i) in fieldModel.editVideoArr" :key="i" class="preview-item video">
                <video controls>
                  <source :src="commonApi.getFileUrl(uuid, 'video')" type="video/mp4">
                </video>
                <div class="remove-overlay" @click="fieldModel.removeVideoByUUID(uuid)">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </div>
              </div>
            </template>
          </div>

          <el-upload class="custom-uploader" :action="fieldModel.uploadUrl" :on-preview="handlePreview"
            :accept="fieldModel.acceptType" :on-remove="fieldModel.handleRemove"
            :on-success="fieldModel.handleAvatarSuccess" :on-error="fieldModel.handleUploadError"
            :data="fieldModel.paramData" :before-remove="fieldModel.beforeRemove"
            :before-upload="fieldModel.beforeAvatarUpload" multiple :limit="5" :on-exceed="fieldModel.handleExceed"
            :file-list="fieldModel.fileList" :list-type="field.field_type === 'photo' ? 'picture' : 'text'">
            <el-button size="small" type="primary" plain>{{ fieldModel.buttonTip }}</el-button>
            <template #tip>
              <div class="upload-tip">{{ fieldModel.fileTip }}</div>
            </template>
          </el-upload>
        </div>
      </template>
    </div>

    <!-- 富文本编辑对话框 -->
    <el-dialog :title="field.field_dec + ' - 富文本编辑'" v-model="fieldModel.richFieldDialogVisible" :append-to-body="true"
      :close-on-click-modal="false" width="70%">
      <quill-editor ref="richTextRef" style="height: 350px; margin-bottom: 20px;"
        v-model:content="fieldModel.richFieldValue" :options="fieldModel.editorOption" contentType="html" />
      <template #footer>
        <el-button @click="fieldModel.richFieldDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="fieldModel.richConfirm">保存内容</el-button>
      </template>
    </el-dialog>

    <!-- 树形选择对话框 -->
    <el-dialog :title="field.field_dec + ' - 选择'" v-model="fieldModel.treeFieldDialogVisible" :append-to-body="true"
      :close-on-click-modal="false" width="50%">
      <div class="tree-dialog-content">
        <el-tree ref="layerTreeRef" :data="fieldModel.treeData" @node-click="fieldModel.handleNodeClick" node-key="id"
          class="custom-tree" default-expand-all :highlight-current="true" :expand-on-click-node="false">
        </el-tree>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, reactive } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import commonApi from '@/api/common';
import { storeToRefs } from 'pinia';
import { gatherPageStore } from '@/components/views/gather/gather-page/Controller/gatherPageStore.ts';
import FieldComponentModel from '@/components/views/gather/gather-page/Model/FieldComponentClass.js';

const props = defineProps({
  field: {
    type: Object,
    default: () => ({})
  },
  valueObj: {
    type: Object,
    default: () => null
  }
});

// 获取store
const store = gatherPageStore();
const { gatherPageModel } = storeToRefs(store);

// 表单引用
const fieldDataFormRef = ref(null);
const richTextRef = ref(null);
const layerTreeRef = ref(null);

// 实例化业务模型（不要用 reactive() 包裹 class 实例，否则内部 ref 可能被解包，导致 .value 失效）
// AI Update: Previously the comment said "don't use reactive", but without reactive, template bindings to Refs inside plain object don't trigger updates for dialog visibility or v-for.
// We MUST use reactive to make template bindings work effortlessly. Because we use reactive, we must update watch sources to be getters.
const fieldModel = reactive(new FieldComponentModel(props.field, props.valueObj, gatherPageModel.value));

// Bind methods to the reactive proxy to ensure 'this' correctly refers to the proxy (for reactivity) even when passed as reference
const methodsToBind = [
  'showRichWin', 'showTreeWin', 'richConfirm', 'handleNodeClick',
  'handleRemove', 'handleAvatarSuccess', 'handleUploadError', 'beforeRemove',
  'beforeAvatarUpload', 'handleExceed'
];
methodsToBind.forEach(method => {
  if (fieldModel[method]) {
    fieldModel[method] = fieldModel[method].bind(fieldModel);
  }
});

// 字体样式
const fontStyle = computed(() => {
  if (props.field.show_flag == "1") {
    return "font-size:18px;color:red;font-weight: bold";
  } else {
    return "font-size:18px";
  }
});

// 监听字段值变化，更新到Model
const fieldsToWatch = [
  () => fieldModel.wordFieldValue,
  () => fieldModel.timeFieldValue,
  () => fieldModel.richFieldValue,
  () => fieldModel.selectFieldValue,
  () => fieldModel.treeFieldValue,
  () => fieldModel.photoFieldValue,
  () => fieldModel.audioFieldValue,
  () => fieldModel.videoFieldValue
];

fieldsToWatch.forEach(sourceRef => {
  watch(sourceRef, (val) => fieldModel.updateModelValue(val));
});

// 监听props.valueObj的变化，更新内部值
watch(() => props.valueObj, (newVal) => {
  if (newVal && props.field.field_name) {
    const val = newVal[props.field.field_name];
    if (val !== undefined && val !== null) {
      // 根据字段类型更新对应的值
      if (props.field.field_type == 'word') fieldModel.wordFieldValue = val;
      if (props.field.field_type == 'rich') fieldModel.richFieldValue = val;
      if (props.field.field_type == 'select') fieldModel.selectFieldValue = val;
      if (props.field.field_type == 'tree') fieldModel.treeFieldValue = val;
      if (props.field.field_type == 'time') fieldModel.timeFieldValue = val;
      if (props.field.field_type == 'photo') {
        fieldModel.photoFieldValue = val;
        if (val) fieldModel.editPhotoArr = val.split(",");
        else fieldModel.editPhotoArr = [];
      }
      if (props.field.field_type == 'audio') {
        fieldModel.audioFieldValue = val;
        if (val) fieldModel.editAudioArr = val.split(",");
        else fieldModel.editAudioArr = [];
      }
      if (props.field.field_type == 'video') {
        fieldModel.videoFieldValue = val;
        if (val) fieldModel.editVideoArr = val.split(",");
        else fieldModel.editVideoArr = [];
      }
    }
  }
}, { deep: true });


function handlePreview(file) {
  console.log(file);
}

function filedSelectChange(data) {
  console.log("选择值：", fieldModel.selectFieldValue, data);
}

// 组件挂载
onMounted(() => {
  fieldModel.initData();
});

// 暴露给父组件
defineExpose({
  fileEndFlag: fieldModel.fileEndFlag
});
</script>



<style scoped>
.field-item-wrapper {
  margin-bottom: 24px;
  width: 100%;
}

.field-label-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding-left: 4px;
}

.field-label {
  font-size: 14px;
  font-weight: 600;
  color: #34495e;
  position: relative;
}

.field-label.is-required::before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}

.coordinate-tag {
  font-size: 11px;
  background: #f0f9eb;
  color: #67c23a;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: 10px;
  border: 1px solid #e1f3d8;
}

.field-input-container {
  width: 100%;
}

.media-input-box {
  padding: 8px 12px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 6px;
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.media-preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.preview-item {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-item.photo {
  width: 80px;
  height: 80px;
}

.preview-item.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-item.audio {
  width: 250px;
  height: 45px;
}

.preview-item.audio audio {
  width: 100%;
  height: 35px;
}

.preview-item.video {
  width: 160px;
  height: 90px;
}

.preview-item.video video {
  width: 100%;
  height: 100%;
}

.remove-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  cursor: pointer;
  color: #fff;
  font-size: 20px;
}

.preview-item:hover .remove-overlay {
  opacity: 1;
}

.custom-uploader {
  width: 100%;
}

.upload-tip {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.tree-dialog-content {
  max-height: 400px;
  overflow-y: auto;
  padding: 10px;
}

.custom-tree {
  padding: 10px;
}

:deep(.el-upload-list--picture .el-progress) {
  display: none;
}
</style>
