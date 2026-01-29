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
    pageSize = 10;
    // 总条数
    total = 0;

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

        // 根据显示模式加载数据
        if (this.displayMode === 'list') {
            await this.loadListData();
        } else {
            // 地图模式 - 待实现
            console.log("加载地图数据:", node);
        }
    }

    /**
     * 加载列表数据
     */
    async loadListData() {
        if (!this.currentNode || !this.currentNode.tablename) return;

        try {
            const param = {
                tableName: this.currentNode.tablename,
                currentPage: this.currentPage,
                pageSize: this.pageSize
            };

            const res = await commonApi.findByPage(param);

            if (res && res.length > 0 && res[0].state === "success") {
                this.listData = res[0].objects || [];
                this.total = res[0].total || 0;
            }
        } catch (error) {
            console.error("加载列表数据失败:", error);
        }
    }

    /**
     * 切换显示模式
     */
    toggleDisplayMode(mode) {
        this.displayMode = mode;
        if (mode === 'list' && this.currentNode) {
            this.loadListData();
        }
    }

    /**
     * 页码改变
     */
    handlePageChange(page) {
        this.currentPage = page;
        this.loadListData();
    }

    /**
     * 每页条数改变
     */
    handleSizeChange(size) {
        this.pageSize = size;
        this.currentPage = 1;
        this.loadListData();
    }
}

export default GatherStateModel;
