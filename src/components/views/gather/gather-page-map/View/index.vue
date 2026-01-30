<template>
  <div class="gather-page-map-container" v-if="gatherPageModel">
    <!-- 左侧面板：字段表单 -->
    <div class="left-panel">
      <div v-if="gatherPageModel.gatherButtonFlag" class="gather-button-container">
        <el-button type="danger" @click="handleGatherClick" :disabled="gatherPageModel.gatherFlag" class="gather-btn">
          数据采集
        </el-button>
      </div>

      <div v-if="gatherPageModel.gatherFieldFlag" class="field-form-container">
        <div v-for="(item, i) in gatherPageModel.fieldArr" :key="i">
          <field-component :ref="el => setFieldRef(item.field_name, el)" :field="item"
            :valueObj="gatherPageModel.currentEditObj">
          </field-component>
        </div>
        <div class="form-actions">
          <el-button type="primary" v-if="!gatherPageModel.editFlag" @click="handleSave">保存</el-button>
          <el-button type="primary" v-if="gatherPageModel.editFlag" @click="handleEdit">修改</el-button>
          <el-button type="primary" @click="handleCancel">取消</el-button>

        </div>
        <div style="height: 30px"></div>
      </div>
    </div>

    <!-- 中间面板：地图组件 -->
    <div class="map-panel">
      <map-component ref="mapRef" @mapLoaded="handleMapLoaded"></map-component>
    </div>

    <!-- 右侧面板：数据列表 -->
    <div class="right-panel">
      <div class="map-sidebar">
        <div class="sidebar-header">
          <span>{{ gatherPageModel.gatherTaskObj.name }}</span>
        </div>
        <div class="sidebar-list">
          <el-scrollbar>
            <div v-if="paginatedData.length === 0" class="empty-list">
              暂无数据
            </div>
            <div v-for="(item, index) in paginatedData" :key="index" class="list-card"
              @click="handleItemClick(item.original)">
              <div class="card-header">
                <div class="index-badge">{{ (currentPage - 1) * pageSize + index + 1 }}:</div>
                <div class="card-title">
                  {{ item.title }}
                </div>
              </div>
              <div class="card-content">
                <div v-for="field in item.bodyFields" :key="field.name" class="info-row">
                  <span class="label">{{ field.label }}:</span>
                  <span class="value">{{ field.value }}</span>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
        <div class="sidebar-pagination">
          <el-pagination small layout="total, sizes, prev, pager, next" :page-sizes="[5, 10, 20]" :total="totalItems"
            v-model:current-page="currentPage" v-model:page-size="pageSize" @size-change="handleSizeChange"
            @current-change="handlePageChange" />
        </div>
      </div>
    </div>

    <!-- 气泡框内容 -->
    <div v-show="gatherPageModel.popupFlag" ref="popupRef" class="popup-content">
      <span class="popup-close-btn" @click="handleClosePopup">&times;</span>
      <div class="popup-scroll">
        <div v-for="(item, i) in gatherPageModel.allPopupData" :key="i" class="popup-item"
          style="margin-bottom: 10px; border-bottom: 1px dashed #eee; padding-bottom: 5px;">
          <!-- 标题/Label -->
          <span class="popup-label" style="font-weight: bold; color: #333;">{{ item.field_dec }}:</span><br>

          <!-- 照片 -->
          <div v-if="item.field_type === 'photo'" style="margin-top: 5px;">
            <span v-for="(obj, k) in item.arrValue" :key="k"
              style="display: inline-block; margin-right: 5px; margin-bottom: 5px;">
              <img :src="obj" class="popup-img"
                style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; cursor: pointer;">
            </span>
          </div>

          <!-- 视频 -->
          <div v-else-if="item.field_type === 'video'" style="margin-top: 5px;">
            <div v-for="(obj, k) in item.arrValue" :key="k" style="margin-bottom: 5px;">

              <video class="popup-video" :src="obj" controls
                style="width: 100%; max-width: 240px; height: 135px; background: #000;">
                您的浏览器不支持 video 标签。
              </video>
            </div>
          </div>

          <!-- 音频 -->
          <div v-else-if="item.field_type === 'audio'" style="margin-top: 5px;">
            <div v-for="(obj, k) in item.arrValue" :key="k" style="margin-bottom: 5px;">
              <audio class="popup-audio" :src="obj" controls style="width: 100%; max-width: 240px; height: 40px;">
                您的浏览器不支持 audio 标签。
              </audio>
            </div>
          </div>

          <!-- 富文本 -->
          <div v-else-if="item.field_type === 'rich'" style="margin-top: 5px;">
            <span v-html="item.value"></span>
          </div>

          <!-- 普通文本 -->
          <div v-else style="margin-top: 2px;">
            <span class="popup-value">{{ item.value }}</span>
          </div>
        </div>
      </div>
      <div class="popup-btn-group">
        <el-button type="success" @click="handleShowEditWin" size="small" class="edit-btn">修改</el-button>
        <el-button type="danger" @click="handleDelete" size="small" class="delete-btn">删除</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { gatherPageStore } from '../Controller/gatherPageMapStore.ts';
import MapComponent from './components/MapComponent.vue';
import FieldComponent from './components/FieldComponent.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const route = useRoute();
const store = gatherPageStore();
const { gatherPageModel, currentGeometry, currentFeature } = storeToRefs(store);

// 地图引用
const mapRef = ref(null);
// 气泡框引用
const popupRef = ref(null);
// 字段组件引用
const fieldRefs = ref({});

// 分页相关
const currentPage = ref(1);
const pageSize = ref(5);

// 当前绘制的几何对象
let currentDrawnGeometry = null;

// 计算总数
const totalItems = computed(() => {
  return gatherPageModel.value.onePageShowData?.length || 0;
});

// 计算当前页数据
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  const pageData = gatherPageModel.value.onePageShowData?.slice(start, end) || [];

  // 转换数据格式为卡片样式
  return pageData.map((item, index) => {
    const globalIndex = start + index;
    const bodyData = gatherPageModel.value.twoPageShowData?.[globalIndex] || [];

    return {
      original: item,
      title: item.value || '无标题',
      bodyFields: bodyData.map(field => ({
        name: field.field_name || field.name,
        label: field.dec || field.label,
        value: field.value || '-'
      }))
    };
  });
});

/**
 * 设置字段组件引用
 */
function setFieldRef(fieldName, el) {
  if (el) {
    fieldRefs.value[fieldName] = el;
  }
}

/**
 * 组件挂载
 */
onMounted(async () => {
  store.initClass();

  const taskid = route.query.taskid;
  const type = route.query.type;

  if (taskid) {
    // 查询采集任务信息
    await gatherPageModel.value.findGatherTask(taskid);

    // 查询字段配置
    await gatherPageModel.value.findGatherLayerField(taskid);

    // 查询数据列表
    gatherPageModel.value.onePageShowData = [];
    gatherPageModel.value.twoPageShowData = [];
    await gatherPageModel.value.findGatherLayerByPage();

    // 如果是点类型，查询图层图片
    if (type === 'point') {
      await gatherPageModel.value.findGatherLayerImg(taskid);
    }
  }
});

/**
 * 地图加载完成
 */
async function handleMapLoaded(map) {
  store.setMapInstance(map);
  console.log('地图加载完成！');
}

/**
 * 点击数据采集按钮
 */
function handleGatherClick() {
  gatherPageModel.value.startGather();
  clearMap();

  const type = gatherPageModel.value.gatherTaskObj.type;
  if (type === 'point') {
    drawPoint();
  } else if (type === 'polyline') {
    drawPolyline();
  } else if (type === 'polygon') {
    drawPolygon();
  }
}

/**
 * 绘制点
 */
/**
 * 绘制点
 */
function drawPoint() {
  const markerJSON = {
    iconUrl: gatherPageModel.value.gatherTaskObj.layerimg,
    iconAnchor: [21, 42],
    width: 42,
    height: 42
  };
  const dragFlag = true;
  mapRef.value.drawMarker(markerJSON, dragFlag, (markerObj) => {
    // 移除上一个采集点
    if (currentDrawnGeometry && currentDrawnGeometry.feature) {
      mapRef.value.removeFeature(currentDrawnGeometry.feature);
    }

    currentDrawnGeometry = markerObj;
    store.setCurrentFeature(markerObj.feature);
    console.log('采集坐标：', markerObj.xy);

    // 自动填充坐标X和坐标Y字段
    if (markerObj.xy) {
      gatherPageModel.value.tableFieldValue['GATHER_ZBX'] = markerObj.xy.lng; // lng
      gatherPageModel.value.tableFieldValue['GATHER_ZBY'] = markerObj.xy.lat; // lat

      // 更新currentEditObj以触发FieldComponent更新
      if (!gatherPageModel.value.currentEditObj) gatherPageModel.value.currentEditObj = {};
      gatherPageModel.value.currentEditObj['GATHER_ZBX'] = markerObj.xy.lng;
      gatherPageModel.value.currentEditObj['GATHER_ZBY'] = markerObj.xy.lat;
    }
  });
}

/**
 * 绘制折线
 */
function drawPolyline() {
  mapRef.value.drawPolyline((polylineObj) => {
    // 移除上一个采集线
    if (currentDrawnGeometry && currentDrawnGeometry.feature) {
      mapRef.value.removeFeature(currentDrawnGeometry.feature);
    }

    currentDrawnGeometry = polylineObj;
    store.setCurrentFeature(polylineObj.feature);
    console.log('采集折线坐标：', polylineObj.zbc);

    // 自动填充坐标串字段
    if (polylineObj.zbc && Array.isArray(polylineObj.zbc)) {
      const coordinateStr = polylineObj.zbc.map(coord => {
        // MapComponent returns {lat, lng} objects for polyline
        if (typeof coord === 'object' && coord.lng !== undefined && coord.lat !== undefined) {
          return `${coord.lng},${coord.lat}`;
        }
        // Fallback or if it changes to array
        return `${coord[0]},${coord[1]}`;
      }).join(';');
      gatherPageModel.value.tableFieldValue['GATHER_ZBC'] = coordinateStr;

      // 更新currentEditObj以触发FieldComponent更新
      if (!gatherPageModel.value.currentEditObj) gatherPageModel.value.currentEditObj = {};
      gatherPageModel.value.currentEditObj['GATHER_ZBC'] = coordinateStr;
    }
  });
}

/**
 * 绘制多边形
 */
function drawPolygon() {
  mapRef.value.drawPolygon((polygonObj) => {
    // 移除上一个采集面
    if (currentDrawnGeometry && currentDrawnGeometry.feature) {
      mapRef.value.removeFeature(currentDrawnGeometry.feature);
    }

    currentDrawnGeometry = polygonObj;
    store.setCurrentFeature(polygonObj.feature);
    console.log('采集多边形坐标：', polygonObj.zbc);

    // 自动填充坐标串字段
    if (polygonObj.zbc && Array.isArray(polygonObj.zbc)) {
      const coordinateStr = polygonObj.zbc.map(coord => `${coord[0]},${coord[1]}`).join(';');
      gatherPageModel.value.tableFieldValue['GATHER_ZBC'] = coordinateStr;

      // 更新currentEditObj以触发FieldComponent更新
      if (!gatherPageModel.value.currentEditObj) gatherPageModel.value.currentEditObj = {};
      gatherPageModel.value.currentEditObj['GATHER_ZBC'] = coordinateStr;
    }
  });
}

/**
 * 保存采集数据
 */
async function handleSave() {
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

  if (!currentDrawnGeometry) {
    ElMessage.error('未在地图进行采集！');
    return;
  }

  // 准备几何数据
  let geometryData = null;
  const type = gatherPageModel.value.gatherTaskObj.type;

  if (type === 'point') {
    // 获取最新坐标（可能被拖拽修改）
    const coords = mapRef.value.getFeatureCoordinates(currentDrawnGeometry.feature);
    geometryData = coords;
  } else if (type === 'polyline') {
    const coords = mapRef.value.getFeatureCoordinates(currentDrawnGeometry.feature);
    // 转换为字符串格式
    const xyStr = coords.map(c => `${c.lat},${c.lng}`).join(';');
    geometryData = { coordinates: xyStr };
  } else if (type === 'polygon') {
    const coords = mapRef.value.getFeatureCoordinates(currentDrawnGeometry.feature);
    // 转换为字符串格式
    const xyStr = coords.map(c => `${c[0]},${c[1]}`).join(';');
    geometryData = { coordinates: xyStr };
  }

  const success = await gatherPageModel.value.gatherData(geometryData);
  if (success) {
    currentDrawnGeometry = null;
    store.clearCurrentGeometry();
    clearMap();
    await gatherPageModel.value.findGatherLayerByPage();
  }
}

/**
 * 修改采集数据
 */
async function handleEdit() {
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

  // 准备几何数据
  let geometryData = null;
  const type = gatherPageModel.value.gatherTaskObj.type;

  if (type === 'point') {
    const coords = mapRef.value.getFeatureCoordinates(currentDrawnGeometry.feature);
    geometryData = coords;
  } else if (type === 'polyline') {
    const coords = mapRef.value.getFeatureCoordinates(currentDrawnGeometry.feature);
    const xyStr = coords.map(c => `${c.lat},${c.lng}`).join(';');
    geometryData = { coordinates: xyStr };
  } else if (type === 'polygon') {
    const coords = mapRef.value.getFeatureCoordinates(currentDrawnGeometry.feature);
    const xyStr = coords.map(c => `${c[0]},${c[1]}`).join(';');
    geometryData = { coordinates: xyStr };
  }

  const success = await gatherPageModel.value.editData(geometryData);
  if (success) {
    currentDrawnGeometry = null;
    store.clearCurrentGeometry();
    clearMap();
    await gatherPageModel.value.findGatherLayerByPage();
  }
}

/**
 * 取消操作
 */
function handleCancel() {
  gatherPageModel.value.cancelGather();

  // 清理
  currentDrawnGeometry = null;
  store.clearCurrentGeometry();
  clearMap();
}

/**
 * 分页页码改变
 */
function handlePageChange(page) {
  currentPage.value = page;
}

/**
 * 分页大小改变
 */
function handleSizeChange(size) {
  pageSize.value = size;
  currentPage.value = 1; // 重置到第一页
}

/**
 * 点击列表项
 */
async function handleItemClick(item) {
  gatherPageModel.value.gatherButtonFlag = true;
  gatherPageModel.value.gatherFieldFlag = false;
  gatherPageModel.value.editFlag = false;
  mapRef.value.closeAllPopup();

  // 查询详细数据
  const data = await gatherPageModel.value.findGatherLayerById(item.gatherID);
  if (!data) return;

  // 清空地图
  clearMap();

  const type = gatherPageModel.value.gatherTaskObj.type;

  // 在地图上显示要素
  if (type === 'point') {
    const markerJSON = {
      xy: [data.gather_zby, data.gather_zbx],
      iconUrl: gatherPageModel.value.layerImg,
      iconAnchor: [21, 42],
      width: 42,
      height: 42
    };
    mapRef.value.panTo([data.gather_zby, data.gather_zbx]);
    const marker = mapRef.value.addMarker(markerJSON);
    currentDrawnGeometry = marker;

    // 绑定点击事件
    mapRef.value.onLayerEvent('click', marker, layerClickEventCallBack, 'showPopup');
  } else if (type === 'polyline') {
    const zbcTemp = [];
    const xyArrTemp = data.gather_zbc.split(';');
    for (let i = 0; i < xyArrTemp.length; i++) {
      const xyTemp = xyArrTemp[i].split(',');
      zbcTemp.push([xyTemp[0], xyTemp[1]]);
    }
    const polylineJSON = {
      xys: zbcTemp,
      option: {
        weight: 5,
        color: gatherPageModel.value.gatherTaskObj.color
      }
    };
    const polyline = mapRef.value.addPolyline(polylineJSON);
    currentDrawnGeometry = polyline;

    // 定位到折线
    mapRef.value.fitFeature(polyline.feature);

    // 绑定点击事件
    mapRef.value.onLayerEvent('click', polyline, layerClickEventCallBack, 'showPopup');
  } else if (type === 'polygon') {
    const zbcTemp = [];
    const xyArrTemp = data.gather_zbc.split(';');
    for (let i = 0; i < xyArrTemp.length; i++) {
      const xyTemp = xyArrTemp[i].split(',');
      zbcTemp.push([xyTemp[0], xyTemp[1]]);
    }
    const polygonJSON = {
      xys: zbcTemp,
      option: {
        weight: 5,
        color: gatherPageModel.value.gatherTaskObj.color
      }
    };
    const polygon = mapRef.value.addPolygon(polygonJSON);
    currentDrawnGeometry = polygon;

    // 定位到多边形
    mapRef.value.fitFeature(polygon.feature);

    // 绑定点击事件
    mapRef.value.onLayerEvent('click', polygon, layerClickEventCallBack, 'showPopup');
  }
}

/**
 * 图层点击事件回调
 */
function layerClickEventCallBack(e) {
  console.log('气泡框显示', e);
  console.log('气泡框内容', gatherPageModel.value.allPopupData);

  gatherPageModel.value.popupFlag = true;

  nextTick(() => {
    const option = {
      closeOnClick: false,
      closeButton: true,
      offset: gatherPageModel.value.gatherTaskObj.type === 'point' ? [0, -21] : [0, 0],
      minWidth: 200
    };
    const point = [e.latlng.lat, e.latlng.lng];
    const html = popupRef.value;
    mapRef.value.addPopup(option, point, html);
  });
}

/**
 * 关闭弹窗
 */
function handleClosePopup() {
  if (mapRef.value) {
    mapRef.value.closeAllPopup();
  }
  gatherPageModel.value.popupFlag = false;
}



/**
 * 删除数据
 */
function handleDelete() {
  ElMessageBox.confirm('确定要删除这条数据吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const success = await gatherPageModel.value.deleteData();
    if (success) {
      clearMap();
      await gatherPageModel.value.findGatherLayerByPage();
    }
  }).catch(() => {
    // 
  });
}

/**
 * 显示编辑窗口
 */
function handleShowEditWin() {
  gatherPageModel.value.startEdit();
  mapRef.value.closeAllPopup();

  const type = gatherPageModel.value.gatherTaskObj.type;
  if (type === 'point') {
    if (currentDrawnGeometry && currentDrawnGeometry.dragging) {
      currentDrawnGeometry.dragging.enable();

      // 监听拖拽结束事件，更新坐标字段
      currentDrawnGeometry.on('dragend', (e) => {
        const coords = mapRef.value.getFeatureCoordinates(currentDrawnGeometry.feature);
        if (coords) {
          gatherPageModel.value.tableFieldValue['GATHER_ZBX'] = coords.lng;
          gatherPageModel.value.tableFieldValue['GATHER_ZBY'] = coords.lat;
          // 强制更新字段组件显示
          gatherPageModel.value.currentEditObj.gather_zbx = coords.lng;
          gatherPageModel.value.currentEditObj.gather_zby = coords.lat;
        }
      });
    }
  } else if (type === 'polyline' || type === 'polygon') {
    mapRef.value.startEditPolyline(currentDrawnGeometry);

    // 监听编辑结束事件，更新坐标串字段
    currentDrawnGeometry.on('edit', (e) => {
      const coords = mapRef.value.getFeatureCoordinates(currentDrawnGeometry.feature);
      if (coords && Array.isArray(coords)) {
        const coordinateStr = coords.map(coord => {
          if (Array.isArray(coord)) {
            return `${coord[0]},${coord[1]}`;
          } else if (coord.lat && coord.lng) {
            return `${coord.lat},${coord.lng}`;
          }
          return '';
        }).filter(s => s).join(';');
        gatherPageModel.value.tableFieldValue['GATHER_ZBC'] = coordinateStr;
        // 强制更新字段组件显示
        gatherPageModel.value.currentEditObj.gather_zbc = coordinateStr;
      }
    });
  }
}

/**
 * 清空地图
 */
function clearMap() {
  if (mapRef.value) {
    mapRef.value.clearMap();
  }
}
</script>

<style scoped>
@import "./style/index.css";
</style>
