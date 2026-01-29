import { defineStore } from 'pinia';
import GatherPageModel from '../Model/GatherPageMapModel.js';
import { ref } from 'vue';

/**
 * gatherPageMapStore - 采集页面状态管理
 * 负责初始化Model和管理地图相关状态
 */
export const gatherPageStore = defineStore('gatherPageMap', () => {
    // 业务逻辑模型
    const gatherPageModel = ref<any>(null);

    // 地图实例（OpenLayers Map对象）
    const mapInstance = ref(null);

    // 当前绘制的几何对象
    const currentGeometry = ref(null);

    // 当前绘制的要素对象（用于编辑）
    const currentFeature = ref(null);

    /**
     * 初始化Model类
     */
    function initClass() {
        // 强制重新实例化，确保每次进入页面都是初始状态
        gatherPageModel.value = new GatherPageModel();
        currentGeometry.value = null;
        currentFeature.value = null;
    }

    /**
     * 设置地图实例
     */
    function setMapInstance(map) {
        mapInstance.value = map;
    }

    /**
     * 设置当前几何对象
     */
    function setCurrentGeometry(geometry) {
        currentGeometry.value = geometry;
    }

    /**
     * 设置当前要素对象
     */
    function setCurrentFeature(feature) {
        currentFeature.value = feature;
    }

    /**
     * 清空当前几何对象
     */
    function clearCurrentGeometry() {
        currentGeometry.value = null;
        currentFeature.value = null;
    }

    return {
        gatherPageModel,
        mapInstance,
        currentGeometry,
        currentFeature,
        initClass,
        setMapInstance,
        setCurrentGeometry,
        setCurrentFeature,
        clearCurrentGeometry
    };
});
