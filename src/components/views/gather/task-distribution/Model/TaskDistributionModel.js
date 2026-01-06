import commonApi from '@/api/common';
import { getListData } from '@/components/views/gather/common/tree';
import { ElMessage } from 'element-plus';

export default class TaskDistributionModel {
    constructor() {
        this.distributionUserData = [];
        this.allUserData = [];
        this.gatherTaskTreeData = [];
        this.currentNode = null;
        this.currentNodeKey = 1;
        this.allUserDialogVisible = false;
        this.loading = false;
    }

    /**
     * 查找图层树
     */
    async findGatherTaskTree() {
        try {
            const response = await commonApi.select({
                sql: "gather_task_tree.findGatherTaskTree"
            });
            if (response[0].state === "success") {
                this.gatherTaskTreeData = getListData(response[0].objects || []);
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 处理节点点击
     */
    async handleNodeClick(node) {
        this.currentNode = node;
        this.currentNodeKey = node.id;
        if (node.taskid) {
            await this.findGatherTaskUser();
        } else {
            this.distributionUserData = [];
        }
    }

    /**
     * 查询已授权人员
     */
    async findGatherTaskUser() {
        if (!this.currentNode || !this.currentNode.taskid) return;
        try {
            const response = await commonApi.select({
                sql: "gather_task_user.find",
                taskid: this.currentNode.taskid
            });
            if (response[0].state === "success") {
                this.distributionUserData = response[0].objects || [];
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 删除任务授权
     */
    async deleteTaskDistribution(row) {
        try {
            const param = {
                sql: "gather_task_user.delete",
                userid: row.USERID,
                taskid: this.currentNode.taskid
            };
            const response = await commonApi.excute(param);
            if (response[0].state === "success") {
                ElMessage.success('授权删除成功！');
                await this.findGatherTaskUser();
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 显示新增授权窗口
     */
    async showAddTaskDistributionWin() {
        if (!this.currentNode || !this.currentNode.taskid) {
            ElMessage.error('当前选中并不是图层，不可进行授权！');
            return;
        }
        await this.findNotExistUser();
    }

    /**
     * 查询未授权用户
     */
    async findNotExistUser() {
        try {
            const response = await commonApi.select({
                sql: "gather_task_user.findNotExist",
                taskid: this.currentNode.taskid
            });
            if (response[0].state === "success") {
                this.allUserData = response[0].objects || [];
                this.allUserDialogVisible = true;
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 执行任务授权
     */
    async gatherTaskDistribution(row) {
        try {
            const param = {
                sql: "gather_task_user.insert",
                userid: row.USERID,
                taskid: this.currentNode.taskid
            };
            const response = await commonApi.excute(param);
            if (response[0].state === "success") {
                ElMessage.success('授权成功！');
                this.allUserDialogVisible = false;
                await this.findGatherTaskUser();
            }
        } catch (error) {
            console.error(error);
        }
    }
}
