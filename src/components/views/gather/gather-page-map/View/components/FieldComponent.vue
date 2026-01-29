<template>
  <div style="width: 100%;">
    <el-form style="width: 100%;padding-left: 15px" ref="fieldDataFormRef">
      <!-- 文本字段 -->
      <el-form-item style="width: 100%" v-if="field.field_type == 'word'">
        <el-divider content-position="left"><span :style="fontStyle">{{ field.field_dec }}</span></el-divider>
        <el-input size="small" style="width:300px" v-model="fieldModel.wordFieldValue" :placeholder="field.field_dec"
          :disabled="field.is_coordinate"></el-input>
      </el-form-item>

      <!-- 时间字段 -->
      <el-form-item v-if="field.field_type == 'time'">
        <el-divider content-position="left"><span :style="fontStyle">{{ field.field_dec }}</span></el-divider>
        <el-date-picker style="width:300px" size="small" v-model="fieldModel.timeFieldValue" type="datetime"
          :placeholder="field.field_dec" format="YYYY-MM-DD HH:mm:ss" value-format="YYYY-MM-DD HH:mm:ss">
        </el-date-picker>
      </el-form-item>

      <!-- 富文本字段 -->
      <el-form-item v-if="field.field_type == 'rich'">
        <el-divider content-position="left"><span :style="fontStyle">{{ field.field_dec }}</span></el-divider>
        <el-button :type="fieldModel.richButtonType" size="small" @click="fieldModel.showRichWin">富文本编辑窗口</el-button>
        <br>
        <span v-if="fieldModel.richFieldValue != ''"
          style="overflow: hidden;text-overflow: ellipsis;-o-text-overflow: ellipsis;white-space:nowrap;width:300px;display:block;">
          当前编辑内容：{{ fieldModel.richFieldValue }}
        </span>
      </el-form-item>

      <!-- 下拉框字段 -->
      <el-form-item v-if="field.field_type == 'select'">
        <el-divider content-position="left"><span :style="fontStyle">{{ field.field_dec }}</span></el-divider>
        <el-select size="small" v-model="fieldModel.selectFieldValue" @change="filedSelectChange"
          style="width:300px;padding-top: 5px" placeholder="请选择">
          <el-option v-for="selectItem in fieldModel.selectArrData" :key="selectItem.dicdataid"
            :label="selectItem.dicdataname" :value="selectItem.dicdataname">
          </el-option>
        </el-select>
      </el-form-item>

      <!-- 树形选择字段 -->
      <el-form-item v-if="field.field_type == 'tree'">
        <el-divider content-position="left"><span :style="fontStyle">{{ field.field_dec }}</span></el-divider>
        <el-button :type="fieldModel.treeButtonType" size="small" @click="fieldModel.showTreeWin">树形选择窗口</el-button>
        <br>
        <span v-if="fieldModel.treeFieldValue != ''">当前选择内容：{{ fieldModel.treeFieldValue }}</span>
      </el-form-item>

      <!-- 文件上传字段 (照片/音频/视频) -->
      <el-form-item v-if="field.field_type == 'photo' || field.field_type == 'audio' || field.field_type == 'video'">
        <el-divider content-position="left"><span :style="fontStyle">{{ field.field_dec }}</span></el-divider>

        <!-- 照片预览 -->
        <div v-if="fieldModel.editPhotoArr && fieldModel.editPhotoArr.length > 0">
          <span v-for="(uuid, i) in fieldModel.editPhotoArr" :key="i">
            <div class="img-box" v-if="uuid != null && uuid != ''">
              <img :src="commonApi.getFileUrl(uuid, 'photo')" class="cover-img"
                style="width: 50px;height: 50px;padding-right: 10px">
              <span class="image-remove" @click="fieldModel.removePhotoByUUID(uuid)">+</span>
            </div>
          </span>
        </div>


        <!-- 音频容器 -->
        <div v-if="fieldModel.editAudioArr && fieldModel.editAudioArr.length > 0">
          <span v-for="(uuid, i) in fieldModel.editAudioArr" :key="i">
            <div class="audio-box" v-if="uuid != null && uuid != ''"
              style="display: inline-block;position: relative;margin-right: 10px;">
              <audio style="width: 200px;height: 60px" controls>
                <source :src="commonApi.getFileUrl(uuid, 'audio')" type="audio/mpeg">您的浏览器不支持 audio 元素。
              </audio>
              <span class="media-remove" @click="fieldModel.removeAudioByUUID(uuid)">+</span>
            </div>
          </span>
        </div>

        <!-- 视频容器 -->
        <div v-if="fieldModel.editVideoArr && fieldModel.editVideoArr.length > 0">
          <span v-for="(uuid, i) in fieldModel.editVideoArr" :key="i">
            <div class="video-box" v-if="uuid != null && uuid != ''"
              style="display: inline-block;position: relative;margin-right: 10px;">
              <video style="width: 200px;height: 120px" controls>
                <source :src="commonApi.getFileUrl(uuid, 'video')" type="video/mp4">您的浏览器不支持 video 元素。
              </video>
              <span class="media-remove" @click="fieldModel.removeVideoByUUID(uuid)">+</span>
            </div>
          </span>
        </div>

        <el-upload style="width: 300px" :action="fieldModel.uploadUrl" :on-preview="handlePreview"
          :accept="fieldModel.acceptType" :on-remove="fieldModel.handleRemove"
          :on-success="fieldModel.handleAvatarSuccess" :on-error="fieldModel.handleUploadError"
          :data="fieldModel.paramData" :before-remove="fieldModel.beforeRemove"
          :before-upload="fieldModel.beforeAvatarUpload" multiple :limit="5" :on-exceed="fieldModel.handleExceed"
          :file-list="fieldModel.fileList" :list-type="fieldModel.listType">
          <el-button size="small" type="warning" style="margin-top: 5px;">{{ fieldModel.buttonTip }}</el-button>
          <template #tip>
            <div class="el-upload__tip">{{ fieldModel.fileTip }}</div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <!-- 富文本编辑对话框 -->
    <el-dialog title="富文本编辑框" v-model="fieldModel.richFieldDialogVisible" :modal-append-to-body="true"
      :append-to-body="true" :close-on-click-modal="false" width="60%" style="z-index: 9999">
      <quill-editor ref="richTextRef" style="height: 200px" v-model:content="fieldModel.richFieldValue"
        :options="fieldModel.editorOption" contentType="html" />
      <div style="height: 40px"></div>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="fieldModel.richConfirm">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 树形选择对话框 -->
    <el-dialog title="树形选择" v-model="fieldModel.treeFieldDialogVisible" :modal-append-to-body="true"
      :append-to-body="true" :close-on-click-modal="false" width="60%" style="z-index: 9999">
      <el-tree ref="layerTreeRef" :data="fieldModel.treeData" @node-click="fieldModel.handleNodeClick" node-key="id"
        class="down-tree" default-expand-all :highlight-current="true" :expand-on-click-node="false">
      </el-tree>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed, reactive } from 'vue';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';
import commonApi from '@/api/common';
import { storeToRefs } from 'pinia';
import { gatherPageStore } from '@/components/views/gather/gather-page-map/Controller/gatherPageMapStore.ts';
import FieldComponentModel from '@/components/views/gather/gather-page-map/Model/FieldComponentClass.js';

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
:deep(.el-upload-list__item-file-name) {
  overflow: visible;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.el-divider--horizontal {
  display: block;
  height: 1px;
  width: 300px;
  margin: 24px 0;
}

:deep(.el-form-item__content) {
  line-height: 10px;
  position: relative;
  font-size: 14px;
}

:deep(.el-upload-list--picture .el-progress) {
  position: relative;
  top: -7px;
  display: none;
}

:deep(.el-upload-list__item .el-progress__text) {
  position: absolute;
  right: 0;
  top: -13px;
  display: none;
}

.img-box {
  display: inline-block;
  position: relative;
}

.image-remove {
  background-color: white;
  color: #ececec;
  font-size: 20px;
  width: 10px;
  height: 10px;
  text-align: center;
  border-radius: 100%;
  transform: rotate(45deg);
  cursor: pointer;
  opacity: 0.5;
  top: -11px;
  right: -1px;
  display: block;
  position: absolute;
}

.media-remove {
  background-color: white;
  color: #ececec;
  font-size: 20px;
  width: 10px;
  height: 10px;
  text-align: center;
  border-radius: 100%;
  transform: rotate(45deg);
  cursor: pointer;
  opacity: 0.5;
  top: -11px;
  right: -11px;
  display: block;
  position: absolute;
  z-index: 9999;
}
</style>
