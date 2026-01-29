<!--MVC中的View层,主要用来显示界面信息-->
<template>
    <div class="gather-state-container" v-if="gatherStateModel">
        <div class="titleClass">
            <el-icon style="vertical-align: middle; margin-right: 8px;">
                <Document />
            </el-icon>
            采集状况
        </div>

        <div class="state-content">
            <!-- Left: Layer Tree Panel -->
            <div class="tree-panel">
                <el-card class="panel-card" shadow="never">
                    <template #header>
                        <div style="font-weight: 600; color: #475569;">图层架构树</div>
                    </template>
                    <el-tree ref="layerTreeRef" :data="gatherStateModel.layerTreeData" node-key="id" default-expand-all
                        highlight-current :expand-on-click-node="false" @node-click="handleNodeClick">
                        <template #default="{ node, data }">
                            <span class="custom-tree-node">
                                <el-icon v-if="data.taskid == null" color="#eab308">
                                    <FolderOpened />
                                </el-icon>
                                <template v-else>
                                    <el-icon v-if="data.type && data.type.includes('polyline')"
                                        :style="data.colorStyle">
                                        <Share />
                                    </el-icon>
                                    <el-icon v-else-if="data.type && data.type.includes('polygon')"
                                        :style="data.colorStyle">
                                        <House />
                                    </el-icon>
                                    <el-icon v-else-if="data.type && data.type.includes('none')" color="#94a3b8">
                                        <Memo />
                                    </el-icon>
                                    <el-image v-else-if="data.type && data.type.includes('point')"
                                        style="width: 14px; height: 14px; border-radius: 2px;" :src="data.layerimg" />
                                </template>
                                <span>{{ node.label }}</span>
                            </span>
                        </template>
                    </el-tree>
                </el-card>
            </div>

            <!-- Right: Display Panel -->
            <div class="display-panel">
                <!-- Mode Toggle Bar -->
                <div class="mode-toggle-bar">
                    <div class="mode-toggle-left">
                        <span v-if="gatherStateModel.currentNode">
                            {{ gatherStateModel.currentNode.label }}
                        </span>
                        <span v-else style="color: #94a3b8;">请选择图层</span>
                    </div>
                    <el-radio-group v-model="gatherStateModel.displayMode" @change="handleModeChange">
                        <el-radio-button value="map"
                            :disabled="gatherStateModel.currentNode && gatherStateModel.currentNode.type && gatherStateModel.currentNode.type.includes('none')">
                            <el-icon style="vertical-align: middle; margin-right: 4px;">
                                <Location />
                            </el-icon>
                            地图展示
                        </el-radio-button>
                        <el-radio-button value="list">
                            <el-icon style="vertical-align: middle; margin-right: 4px;">
                                <List />
                            </el-icon>
                            列表展示
                        </el-radio-button>
                    </el-radio-group>
                </div>

                <!-- Map Display -->
                <!-- Map Display -->
                <div class="map-container" v-show="gatherStateModel.displayMode === 'map'">
                    <div class="map-wrapper">
                        <div id="gatherStateMap"></div>
                        <div class="map-placeholder" v-if="!gatherStateModel.currentNode">
                            <span>请从左侧选择图层以查看地图数据</span>
                        </div>
                    </div>

                    <!-- Map Sidebar (Right Data List) -->
                    <div class="map-sidebar" v-if="gatherStateModel.currentNode">
                        <div class="sidebar-header">
                            <span>{{ gatherStateModel.currentNode.label }}</span>
                        </div>
                        <div class="sidebar-list">
                            <el-scrollbar>
                                <div v-if="gatherStateModel.listData.length === 0" class="empty-list">
                                    暂无数据
                                </div>
                                <div v-for="(item, index) in gatherStateModel.listData" :key="index" class="list-card">
                                    <div class="card-header">
                                        <div class="index-badge">{{ (gatherStateModel.currentPage - 1) *
                                            gatherStateModel.pageSize +
                                            index + 1
                                            }}:</div>
                                        <div class="card-title">
                                            {{ getTitleField ? (item[getTitleField.field_name] || '无标题') :
                                                (item.gather_cjr || '未知') }}
                                        </div>
                                    </div>
                                    <div class="card-content">
                                        <!-- Dynamic Fields (show_flag = 2) -->
                                        <div v-for="field in getBodyFields" :key="field.field_name" class="info-row">
                                            <span class="label">{{ field.field_dec }}:</span>
                                            <span class="value">{{ item[field.field_name] }}</span>
                                        </div>
                                        <!-- Fallback if no body fields -->
                                        <div v-if="getBodyFields.length === 0" class="info-row">
                                            <span class="label">采集时间:</span>
                                            <span class="value">{{ item.gather_cjsj || '-' }}</span>
                                        </div>
                                    </div>
                                </div>
                            </el-scrollbar>
                        </div>
                        <div class="sidebar-pagination">
                            <el-pagination small layout="total, sizes, prev, pager, next" :page-sizes="[5, 10, 20]"
                                :total="gatherStateModel.total" v-model:current-page="gatherStateModel.currentPage"
                                v-model:page-size="gatherStateModel.pageSize" @size-change="handleSizeChange"
                                @current-change="handlePageChange" />
                        </div>
                    </div>
                </div>

                <!-- List Display -->
                <div class="list-container" v-show="gatherStateModel.displayMode === 'list'">
                    <div class="list-table-wrapper" v-if="gatherStateModel.currentNode">
                        <el-table :data="gatherStateModel.listData" stripe style="width: 100%">
                            <el-table-column type="index" label="序号" width="60" align="center" />
                            <el-table-column prop="gather_cjsj" label="采集时间" width="180" align="center" />
                            <el-table-column prop="gather_cjr" label="采集人" width="120" align="center" />
                            <el-table-column label="详细信息" align="center">
                                <template #default="{ row }">
                                    <el-button type="primary" link size="small">查看详情</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div v-else class="map-placeholder">
                        <span>请从左侧选择图层以查看列表数据</span>
                    </div>

                    <div class="pagination-wrapper" v-if="gatherStateModel.currentNode">
                        <el-pagination v-model:current-page="gatherStateModel.currentPage"
                            v-model:page-size="gatherStateModel.pageSize" :page-sizes="[10, 20, 50, 100]"
                            layout="total, sizes, prev, pager, next, jumper" :total="gatherStateModel.total"
                            @size-change="handleSizeChange" @current-change="handlePageChange" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { storeToRefs } from "pinia";
import { gatherStateStore } from "@/components/views/gather/gather-state/Controller/gatherStateStore.ts";
import { Document, FolderOpened, Share, House, Memo, Location, List } from '@element-plus/icons-vue';

// OpenLayers imports
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import WKT from 'ol/format/WKT';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import Feature from 'ol/Feature';
import { Point } from 'ol/geom';

const store = gatherStateStore();
const { gatherStateModel } = storeToRefs(store);

// Map related refs
const map = ref(null);
const vectorSource = ref(null);
const wktFormat = new WKT();

onMounted(async () => {
    store.initClass();
    if (gatherStateModel.value) {
        await gatherStateModel.value.loadLayerTree();
    }
    initMap();
});

// Initialize Map
const initMap = () => {
    vectorSource.value = new VectorSource();
    const vectorLayer = new VectorLayer({
        source: vectorSource.value,
        style: new Style({
            fill: new Fill({ color: 'rgba(255, 255, 255, 0.2)' }),
            stroke: new Stroke({ color: '#ffcc33', width: 2 }),
            image: new CircleStyle({
                radius: 7,
                fill: new Fill({ color: '#ffcc33' })
            })
        })
    });

    const tileLayerUrl = window.config?.mapUrl || 'https://webst04.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';

    map.value = new Map({
        target: 'gatherStateMap',
        layers: [
            new TileLayer({
                source: new XYZ({
                    url: tileLayerUrl,
                    crossOrigin: 'anonymous'
                })
            }),
            vectorLayer
        ],
        view: new View({
            center: [118.1382, 24.4977], // Default center (Xiamen)
            zoom: 10,
            projection: 'EPSG:4326' // Use 4326 for easier WKT handling if data is in lat/lon
        })
    });
};

// Render Map Data
const renderMapData = () => {
    if (!vectorSource.value || !gatherStateModel.value.mapData) return;

    vectorSource.value.clear();

    const features = [];
    gatherStateModel.value.mapData.forEach(item => {
        let feature = null;
        // Try WKT first (handle case sensitivity)
        const wkt = item.GATHER_THE_GEOM || item.gather_the_geom || item.GATHER_THE_GEOM_TEXT;
        if (wkt) {
            try {
                feature = wktFormat.readFeature(wkt, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:4326'
                });
            } catch (e) {
                // console.warn('WKT Parse Error:', e);
            }
        }

        // If no feature yet, try ZBX/ZBY for points
        if (!feature) {
            const x = item.GATHER_ZBX || item.gather_zbx;
            const y = item.GATHER_ZBY || item.gather_zby;
            if (x && y) {
                const lng = parseFloat(x);
                const lat = parseFloat(y);
                if (!isNaN(lng) && !isNaN(lat)) {
                    feature = new Feature({
                        geometry: new Point([lng, lat])
                    });
                }
            }
        }

        if (feature) {
            features.push(feature);
        }
    });

    if (features.length > 0) {
        vectorSource.value.addFeatures(features);
        const extent = vectorSource.value.getExtent();
        // Check if extent is valid (not infinite)
        if (extent && !extent.some(val => !isFinite(val))) {
            try {
                map.value.getView().fit(extent, {
                    padding: [50, 50, 50, 50],
                    duration: 1000,
                    maxZoom: 18
                });
            } catch (e) {
                console.warn("Map Fit Error:", e);
            }
        }
    }
};

// Watchers
watch(() => gatherStateModel.value?.mapData, () => {
    if (gatherStateModel.value?.displayMode === 'map') {
        renderMapData();
    }
}, { deep: true });

watch(() => gatherStateModel.value?.displayMode, (newMode) => {
    if (newMode === 'map') {
        setTimeout(() => {
            map.value.updateSize();
            if (gatherStateModel.value.mapData.length > 0) {
                // Re-render if switching back to map and data exists
                renderMapData();
            }
        }, 100);
    }
});

// 获取标题字段 (show_flag = 1)
const getTitleField = computed(() => {
    if (!gatherStateModel.value || !gatherStateModel.value.fieldArr) return null;
    return gatherStateModel.value.fieldArr.find(field => field.show_flag == 1);
});

// 获取内容字段 (show_flag = 2)
const getBodyFields = computed(() => {
    if (!gatherStateModel.value || !gatherStateModel.value.fieldArr) return [];
    return gatherStateModel.value.fieldArr.filter(field => field.show_flag == 2);
});

// 处理节点点击
const handleNodeClick = (data) => {
    if (gatherStateModel.value) {
        gatherStateModel.value.handleNodeClick(data);
    }
};

// 处理模式切换
const handleModeChange = (mode) => {
    if (gatherStateModel.value) {
        gatherStateModel.value.toggleDisplayMode(mode);
    }
};

// 处理页码改变
const handlePageChange = (page) => {
    if (gatherStateModel.value) {
        gatherStateModel.value.handlePageChange(page);
    }
};

// 处理每页条数改变
const handleSizeChange = (size) => {
    if (gatherStateModel.value) {
        gatherStateModel.value.handleSizeChange(size);
    }
};
</script>

<style scoped>
@import "./style/index.css";
</style>
