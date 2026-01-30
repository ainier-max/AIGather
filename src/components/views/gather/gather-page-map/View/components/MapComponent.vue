<template>
  <div id="map" class="map-container"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, toRaw } from 'vue';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Draw, Modify } from 'ol/interaction';
import { Point, LineString, Polygon } from 'ol/geom';
import Feature from 'ol/Feature';
import { Style, Icon, Stroke, Fill, Circle as CircleStyle } from 'ol/style';
import Overlay from 'ol/Overlay';
import { fromLonLat, toLonLat } from 'ol/proj';
import { defaults as defaultControls } from 'ol/control';
import { ElMessage } from 'element-plus';

const props = defineProps({
  tileUrl: {
    type: String,
    default: ''
  },
  loadEnd: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['mapLoaded']);

// 地图实例
const map = ref(null);
// 矢量图层（用于绘制和显示要素）
const vectorSource = ref(null);
const vectorLayer = ref(null);
// 当前绘制交互
const drawInteraction = ref(null);
// 当前修改交互
const modifyInteraction = ref(null);
// 弹出框覆盖层
const popupOverlay = ref(null);
const popupElement = ref(null);

/**
 * 初始化地图
 */
onMounted(() => {
  // 创建矢量数据源和图层
  vectorSource.value = new VectorSource();
  vectorLayer.value = new VectorLayer({
    source: vectorSource.value,
    style: createDefaultStyle()
  });

  // 配置瓦片图层URL
  const tileLayerUrl = window.config?.mapUrl || 'https://webst04.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';
  // 创建地图
  map.value = new Map({
    target: 'map',
    layers: [
      new TileLayer({
        source: new XYZ({
          url: tileLayerUrl,
          crossOrigin: 'anonymous'
        }),
        properties: { type: 'tileLayer' }
      }),
      vectorLayer.value
    ],
    view: new View({
      center: fromLonLat([118.13822342148988, 24.497771154019716]), // 默认中心点
      zoom: 10,
      projection: 'EPSG:3857'
    }),
    controls: defaultControls({
      zoom: false,
      rotate: false
    })
  });

  // 鼠标悬停变手型
  map.value.on('pointermove', (e) => {
    if (e.dragging) {
      return;
    }
    const pixel = map.value.getEventPixel(e.originalEvent);
    const hit = map.value.hasFeatureAtPixel(pixel, { hitTolerance: 10 });
    map.value.getTargetElement().style.cursor = hit ? 'pointer' : '';
  });

  // 触发地图加载完成事件
  emit('mapLoaded', map.value);
});

/**
 * 组件卸载前清理
 */
onBeforeUnmount(() => {
  if (map.value) {
    map.value.setTarget(null);
    map.value = null;
  }
});

/**
 * 创建默认样式
 */
function createDefaultStyle() {
  return new Style({
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new Stroke({
      color: '#ffcc33',
      width: 2
    }),
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({
        color: '#ffcc33'
      })
    })
  });
}

/**
 * 移除指定要素
 * @param {Feature} feature
 */
function removeFeature(feature) {
  if (feature && vectorSource.value) {
    if (vectorSource.value.hasFeature(feature)) {
      vectorSource.value.removeFeature(feature);
    }
  }
}

/**
 * 绘制点标记
 * @param {Object} markerJSON - 标记配置 { iconUrl, iconAnchor, width, height }
 * @param {Boolean} dragFlag - 是否可拖拽
 * @param {Function} callback - 绘制完成回调
 */
function drawMarker(markerJSON, dragFlag, callback) {
  // 移除之前的绘制交互
  removeDrawInteraction();

  const draw = new Draw({
    source: vectorSource.value,
    type: 'Point'
  });

  draw.on('drawend', (event) => {
    const feature = event.feature;
    const coordinates = feature.getGeometry().getCoordinates();
    const lonLat = toLonLat(coordinates);

    // 设置自定义图标样式
    if (markerJSON && markerJSON.iconUrl) {
      feature.setStyle(new Style({
        image: new Icon({
          src: markerJSON.iconUrl,
          anchor: markerJSON.iconAnchor ? [markerJSON.iconAnchor[0] / markerJSON.width, markerJSON.iconAnchor[1] / markerJSON.height] : [0.5, 1],
          size: [markerJSON.width, markerJSON.height],
          scale: 1
        })
      }));
    }

    // 移除绘制交互 (注释掉以允许连续绘制/重绘)
    // map.value.removeInteraction(draw);
    // drawInteraction.value = null;

    // 如果可拖拽，添加修改交互
    if (dragFlag) {
      enableModify();
    }

    // 回调返回标记对象
    if (callback) {
      callback({
        feature: feature,
        xy: { lng: lonLat[0], lat: lonLat[1] },
        _latlng: { lng: lonLat[0], lat: lonLat[1] }
      });
    }
  });

  map.value.addInteraction(draw);
  drawInteraction.value = draw;
}

/**
 * 绘制折线
 * @param {Function} callback - 绘制完成回调
 */
function drawPolyline(callback) {
  removeDrawInteraction();

  const draw = new Draw({
    source: vectorSource.value,
    type: 'LineString'
  });

  draw.on('drawend', (event) => {
    const feature = event.feature;
    const coordinates = feature.getGeometry().getCoordinates();
    const lonLatCoords = coordinates.map(coord => toLonLat(coord));

    // 转换为 {lat, lng} 格式
    const zbc = lonLatCoords.map(coord => ({ lat: coord[1], lng: coord[0] }));

    // map.value.removeInteraction(draw);
    // drawInteraction.value = null;

    if (callback) {
      callback({
        feature: feature,
        zbc: zbc
      });
    }
  });

  map.value.addInteraction(draw);
  drawInteraction.value = draw;
}

/**
 * 绘制多边形
 * @param {Function} callback - 绘制完成回调
 */
function drawPolygon(callback) {
  removeDrawInteraction();

  const draw = new Draw({
    source: vectorSource.value,
    type: 'Polygon'
  });

  draw.on('drawend', (event) => {
    const feature = event.feature;
    const coordinates = feature.getGeometry().getCoordinates()[0]; // 获取外环坐标
    const lonLatCoords = coordinates.map(coord => toLonLat(coord));

    // 转换为 [lng, lat] 格式
    const zbc = lonLatCoords.map(coord => [coord[0], coord[1]]);

    // map.value.removeInteraction(draw);
    // drawInteraction.value = null;

    if (callback) {
      callback({
        feature: feature,
        zbc: zbc
      });
    }
  });

  map.value.addInteraction(draw);
  drawInteraction.value = draw;
}

/**
 * 添加点标记到地图
 * @param {Object} markerJSON - { xy: [lat, lng], iconUrl, iconAnchor, width, height }
 */
function addMarker(markerJSON) {
  const coordinates = fromLonLat([markerJSON.xy[1], markerJSON.xy[0]]);
  const feature = new Feature({
    geometry: new Point(coordinates)
  });

  if (markerJSON.iconUrl) {
    feature.setStyle(new Style({
      image: new Icon({
        src: markerJSON.iconUrl,
        anchor: markerJSON.iconAnchor ? [markerJSON.iconAnchor[0] / markerJSON.width, markerJSON.iconAnchor[1] / markerJSON.height] : [0.5, 1],
        size: [markerJSON.width, markerJSON.height],
        scale: 1
      })
    }));
  }

  vectorSource.value.addFeature(feature);
  return {
    feature: feature,
    _latlng: { lng: markerJSON.xy[1], lat: markerJSON.xy[0] },
    dragging: {
      enable: () => enableModify()
    }
  };
}

/**
 * 添加折线到地图
 * @param {Object} polylineJSON - { xys: [[lat, lng], ...], option: { weight, color } }
 */
function addPolyline(polylineJSON) {
  const coordinates = polylineJSON.xys.map(xy => fromLonLat([parseFloat(xy[1]), parseFloat(xy[0])]));
  const feature = new Feature({
    geometry: new LineString(coordinates)
  });

  if (polylineJSON.option) {
    feature.setStyle(new Style({
      stroke: new Stroke({
        color: polylineJSON.option.color || '#ffcc33',
        width: polylineJSON.option.weight || 2
      })
    }));
  }

  vectorSource.value.addFeature(feature);

  // 转换坐标为回调格式
  const zbc = polylineJSON.xys.map(xy => ({ lat: parseFloat(xy[0]), lng: parseFloat(xy[1]) }));

  return {
    feature: feature,
    zbc: zbc
  };
}

/**
 * 添加多边形到地图
 * @param {Object} polygonJSON - { xys: [[lat, lng], ...], option: { weight, color } }
 */
function addPolygon(polygonJSON) {
  const coordinates = polygonJSON.xys.map(xy => fromLonLat([parseFloat(xy[1]), parseFloat(xy[0])]));
  const feature = new Feature({
    geometry: new Polygon([coordinates])
  });

  if (polygonJSON.option) {
    feature.setStyle(new Style({
      stroke: new Stroke({
        color: polygonJSON.option.color || '#ffcc33',
        width: polygonJSON.option.weight || 2
      }),
      fill: new Fill({
        color: (polygonJSON.option.color || '#ffcc33') + '33' // 添加透明度
      })
    }));
  }

  vectorSource.value.addFeature(feature);

  // 转换坐标为回调格式
  const zbc = polygonJSON.xys.map(xy => [parseFloat(xy[1]), parseFloat(xy[0])]);

  return {
    feature: feature,
    zbc: zbc
  };
}

/**
 * 添加弹出框
 * @param {Object} option - 弹出框选项
 * @param {Array} point - [lat, lng]
 * @param {HTMLElement} html - 弹出框内容元素
 */
function addPopup(option, point, html) {
  if (!popupOverlay.value) {
    popupOverlay.value = new Overlay({
      element: html,
      positioning: 'bottom-center',
      stopEvent: true,
      offset: option.offset || [0, -10]
    });
    map.value.addOverlay(popupOverlay.value);
  } else {
    popupOverlay.value.setElement(html);
  }

  const coordinates = fromLonLat([point[1], point[0]]);
  popupOverlay.value.setPosition(coordinates);
}

/**
 * 关闭所有弹出框
 */
function closeAllPopup() {
  if (popupOverlay.value) {
    popupOverlay.value.setPosition(undefined);
  }
}

/**
 * 清空地图（保留底图）
 */
function clearMap() {
  vectorSource.value.clear();
  removeDrawInteraction();
  removeModifyInteraction();
  closeAllPopup();
}

/**
 * 定位到指定坐标
 * @param {Array} xy - [lat, lng]
 */
function panTo(xy) {
  const coordinates = fromLonLat([xy[1], xy[0]]);
  map.value.getView().animate({
    center: coordinates,
    duration: 1000
  });
}

/**
 * 绑定图层事件
 * @param {String} eventType - 事件类型 'click'
 * @param {Object} layerObj - 图层对象（包含feature）
 * @param {Function} callback - 回调函数
 * @param {String} action - 动作类型 'showPopup'
 */
function onLayerEvent(eventType, layerObj, callback, action) {
  if (eventType === 'click') {
    map.value.on('singleclick', (event) => {
      console.log("onLayerEvent--singleclick:", event);
      const features = map.value.getFeaturesAtPixel(event.pixel, { hitTolerance: 20 });
      console.log("onLayerEvent--features count:", features ? features.length : 0);

      const targetFeature = toRaw(layerObj.feature);
      const isHit = features && features.some(f => toRaw(f) === targetFeature);

      if (isHit) {
        console.log("onLayerEvent--Hit Target Feature!");
        const coordinates = event.coordinate;
        const lonLat = toLonLat(coordinates);
        callback({
          latlng: { lat: lonLat[1], lng: lonLat[0] }
        });
      }
    });
  }
}

/**
 * 启用编辑折线/多边形
 * @param {Object} polylineObj - 折线对象
 */
function startEditPolyline(polylineObj) {
  enableModify();
}

/**
 * 启用修改交互
 */
function enableModify() {
  if (!modifyInteraction.value) {
    modifyInteraction.value = new Modify({
      source: vectorSource.value
    });
    map.value.addInteraction(modifyInteraction.value);
  }
}

/**
 * 移除绘制交互
 */
function removeDrawInteraction() {
  if (drawInteraction.value) {
    map.value.removeInteraction(drawInteraction.value);
    drawInteraction.value = null;
  }
}

/**
 * 移除修改交互
 */
function removeModifyInteraction() {
  if (modifyInteraction.value) {
    map.value.removeInteraction(modifyInteraction.value);
    modifyInteraction.value = null;
  }
}

/**
 * 获取要素的当前坐标（用于编辑后获取）
 */
function getFeatureCoordinates(feature) {
  const geometry = feature.getGeometry();
  const type = geometry.getType();

  if (type === 'Point') {
    const coordinates = geometry.getCoordinates();
    const lonLat = toLonLat(coordinates);
    return { lng: lonLat[0], lat: lonLat[1] };
  } else if (type === 'LineString') {
    const coordinates = geometry.getCoordinates();
    const lonLatCoords = coordinates.map(coord => toLonLat(coord));
    return lonLatCoords.map(coord => ({ lat: coord[1], lng: coord[0] }));
  } else if (type === 'Polygon') {
    const coordinates = geometry.getCoordinates()[0];
    const lonLatCoords = coordinates.map(coord => toLonLat(coord));
    return lonLatCoords.map(coord => [coord[0], coord[1]]);
  }
}

/**
 * 缩放到要素范围
 * @param {Feature} feature
 */
function fitFeature(feature) {
  if (feature) {
    const geometry = feature.getGeometry();
    if (geometry) {
      const extent = geometry.getExtent();

      try {
        map.value.getView().fit(extent, {
          duration: 1000,
          padding: [1000, 1000, 1000, 1000] // Padding to ensure feature is not at the very edge
        });
      } catch (error) {
        console.error("定位异常", error);
        ElMessage.warning("坐标异常，无法定位！");
      }

    }
  }
}

// 暴露方法给父组件
defineExpose({
  map,
  drawMarker,
  drawPolyline,
  drawPolygon,
  addMarker,
  addPolyline,
  addPolygon,
  addPopup,
  closeAllPopup,
  clearMap,
  panTo,
  onLayerEvent,
  startEditPolyline,
  getFeatureCoordinates,
  removeFeature,
  fitFeature
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}

/* OpenLayers 默认样式 */
:deep(.ol-viewport) {
  position: relative;
}

:deep(.ol-overlaycontainer-stopevent) {
  position: absolute;
}
</style>
