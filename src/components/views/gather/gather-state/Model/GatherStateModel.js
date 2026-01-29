/**
 * MVC中的Model层,主要用来处理逻辑
 */
import commonApi from "@/api/common/index.js";
import { getListData } from '@/components/views/gather/common/tree';

class GatherStateModel {
    // 图层树数据
    layerTreeData = [];
    // 当前选中的节点
    currentNode = null;
    // 显示模式: 'map' 或 'list'
    displayMode = 'map';
    // 列表数据
    listData = [];
    // 当前页码
    currentPage = 1;
    // 每页条数
    pageSize = 5;
    // 总条数
    total = 0;

    // 地图数据
    mapData = [];

    constructor() {
    }

    /**
     * 加载图层架构树
     */
    async loadLayerTree() {
        try {
            const param = {
                sql: "gather_task_tree.findGatherTaskTree"
            };
            const res = await commonApi.select(param);

            if (res && res.length > 0 && res[0].state === "success") {
                this.layerTreeData = getListData(res[0].objects || []);
            }
        } catch (error) {
            console.error("加载图层树失败:", error);
        }
    }


    /**
     * 处理节点点击
     */
    async handleNodeClick(node) {
        if (!node.taskid) return; // 如果是分组节点，不处理

        this.currentNode = node;

        // 如果是None空间类型，强制切换到列表模式
        if (node.type && node.type.includes('none')) {
            this.displayMode = 'list';
            await this.loadMapData();
            return;
        }

        // 根据显示模式加载数据
        if (this.displayMode === 'list') {
            await this.loadMapData();
        } else {
            await this.loadMapData();
        }
    }

    /**
     * 加载地图数据 (获取所有数据)
     */
    async loadMapData() {
        if (!this.currentNode || !this.currentNode.tablename) return;

        try {
            const start = 0;
            const fieldStr = "*";
            const param = {
                sql: "gather_layer.find",
                fieldStr: fieldStr,
                layer_name: this.currentNode.tablename,
                start: start,
                pageSize: ''
            };

            const res = await commonApi.select(param);

            if (res && res.length > 0 && res[0].state === "success") {
                this.mapData = res[0].objects || [];
                this.total = this.mapData.length;
                this.updateListData();
            } else {
                this.mapData = [];
                this.listData = [];
                this.total = 0;
            }
        } catch (error) {
            console.error("加载数据失败:", error);
            this.mapData = [];
            this.listData = [];
            this.total = 0;
        }
    }

    /**
     * 更新列表数据 (前端分页)
     */
    updateListData() {
        if (!this.mapData || this.mapData.length === 0) {
            this.listData = [];
            return;
        }
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.listData = this.mapData.slice(start, end);
    }

    /**
     * 切换显示模式
     */
    toggleDisplayMode(mode) {
        this.displayMode = mode;
        if (this.currentNode) {
            // 数据已存在则刷新列表(可能页码重置?)，不存在则加载
            if (this.mapData.length === 0) {
                this.loadMapData();
            } else {
                this.updateListData();
            }
        }
    }

    /**
     * 页码改变
     */
    handlePageChange(page) {
        this.currentPage = page;
        this.updateListData();
    }

    /**
     * 每页条数改变
     */
    handleSizeChange(size) {
        this.pageSize = size;
        this.currentPage = 1;
        this.updateListData();
    }
}

export default GatherStateModel;
