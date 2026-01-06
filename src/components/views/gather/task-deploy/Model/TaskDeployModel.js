import commonApi from '@/api/common';
import { getListData } from '@/components/views/gather/common/tree';
import { ElMessage } from 'element-plus';

export default class TaskDeployModel {
    constructor() {
        this.gatherTaskData = [];
        this.gatherTaskTreeData = [];
        this.treeDialogTitle = '树节点维护';
        this.dialogVisible = false;
        this.treeDicDataForm = {
            treems: '',
        };
        this.editFlag = 0;
        this.opTreeData = null;
        this.deleteTreeDataDialogVisible = false;
        this.currentTreeLabel = '';
        this.deleteIDS = [];
        this.currentNodeKey = 1; // 初始选中图层树菜单
        this.deleteGatherTaskDialogVisible = false;
        this.opGatherTask = {};
        this.opGatherTaskCount = 0;
        this.loading = false;
    }

    /**
     * 查找所有采集任务 (flag=1 表示已授权的任务)
     */
    async findGatherTask() {
        try {
            const param = {
                sql: "gather_task.findGatherTask",
                flag: "1"
            };
            const response = await commonApi.select(param);
            if (response[0].state === "success") {
                this.gatherTaskData = response[0].objects || [];
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 查找图层树
     */
    async findGatherTaskTree() {
        try {
            const param = {
                sql: "gather_task_tree.findGatherTaskTree"
            };
            const response = await commonApi.select(param);
            if (response[0].state === "success") {
                this.gatherTaskTreeData = getListData(response[0].objects || []);
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 调配任务到图层树
     */
    async taskDeploy(obj, currentNode) {
        if (!currentNode) {
            ElMessage.error('未选中图层树菜单！');
            return;
        }
        if (currentNode.taskid != null) {
            ElMessage.error('图层不能添加到图层！');
            return;
        }
        if (currentNode.children && currentNode.children.length > 0) {
            for (let i = 0; i < currentNode.children.length; i++) {
                if (obj.id == currentNode.children[i].taskid) {
                    ElMessage.error('同一个目录下不能存在两个相同图层！');
                    return;
                }
            }
        }

        try {
            const param = {
                name: obj.name,
                pid: currentNode.id,
                taskid: obj.id,
                table_name: obj.table_name,
                sql: "gather_task_tree.addGatherTaskTreeLayer"
            };
            const response = await commonApi.select(param);
            if (response[0].state === "success") {
                ElMessage.success('成功添加图层！');
                await this.findGatherTaskTree();
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 新增树节点
     */
    async addTreeDicData() {
        try {
            const param = {
                name: this.treeDicDataForm.treems,
                pid: this.opTreeData.id,
                sql: "gather_task_tree.addGatherTaskTree"
            };
            const response = await commonApi.excute(param);
            if (response[0].state === "success") {
                ElMessage.success('成功增加树菜单！');
                this.treeDicDataForm.treems = '';
                await this.findGatherTaskTree();
                this.dialogVisible = false;
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 修改树节点
     */
    async editTreeDicData() {
        try {
            const param = {
                name: this.treeDicDataForm.treems,
                id: this.opTreeData.id,
                sql: "gather_task_tree.updateGatherTaskTree"
            };
            const response = await commonApi.excute(param);
            if (response[0].state === "success") {
                ElMessage.success('成功修改树菜单！');
                this.treeDicDataForm.treems = '';
                await this.findGatherTaskTree();
                this.dialogVisible = false;
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 删除树节点
     */
    async deleteTreeData() {
        this.deleteIDS = [];
        this.getDeleteIDS(this.opTreeData);
        try {
            const param = {
                ids: this.deleteIDS,
                sql: "gather_task_tree.deleteGatherTaskTree"
            };
            const response = await commonApi.excute(param);
            if (response[0].state === "success") {
                this.currentNodeKey = 1;
                ElMessage.success('成功删除图层树数据！');
                await this.findGatherTaskTree();
                this.deleteTreeDataDialogVisible = false;
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 遍历获取所有子节点ID用于删除
     */
    getDeleteIDS(data) {
        this.deleteIDS.push(data.id);
        if (data.children && data.children.length > 0) {
            for (let i = 0; i < data.children.length; i++) {
                this.getDeleteIDS(data.children[i]);
            }
        }
    }

    /**
     * 获取采集任务关联的数据量
     */
    async getGatherTaskCount(row) {
        this.opGatherTask = row;
        try {
            const param = {
                sql: "gather_task.gatherTaskCount",
                table_name: this.opGatherTask.table_name
            };
            const response = await commonApi.select(param);
            if (response[0].state === "success" && response[0].objects) {
                this.opGatherTaskCount = response[0].objects[0].SUM_COUNT;
            }
            this.deleteGatherTaskDialogVisible = true;
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 删除采集任务
     */
    async deleteGatherTask() {
        if (this.opGatherTaskCount > 0) {
            ElMessage.error("该采集任务在数据库里存在数据，不可删除！请手动清空数据再进行删除！");
            this.deleteGatherTaskDialogVisible = false;
            return;
        }

        try {
            const param = {
                sql: "gather_task.deleteGatherTask",
                table_name: this.opGatherTask.table_name,
                id: this.opGatherTask.id
            };
            const response = await commonApi.excute(param);
            if (response[0].state === "success") {
                ElMessage.success('成功删除采集任务！');
                this.deleteGatherTaskDialogVisible = false;
                await this.findGatherTask();
                await this.findGatherTaskTree();
            }
        } catch (error) {
            console.error(error);
        }
    }

    // UI 控制方法
    showAddWin(data) {
        this.dialogVisible = true;
        this.treeDialogTitle = "新增树节点";
        this.editFlag = 0;
        this.opTreeData = data;
    }

    showEditWin(data) {
        if (data.id == '1') {
            ElMessage.error('该图层禁止修改');
            return;
        }
        this.treeDicDataForm.treems = data.label;
        this.dialogVisible = true;
        this.treeDialogTitle = "修改树节点";
        this.editFlag = 1;
        this.opTreeData = data;
    }

    showDeleteWin(data) {
        if (data.id == '1') {
            ElMessage.error('该图层禁止删除');
            return;
        }
        this.deleteTreeDataDialogVisible = true;
        this.opTreeData = data;
        this.currentTreeLabel = data.label;
    }
}
