import commonApi from '@/api/common';
import { ElMessage } from 'element-plus';
import router from '@/router';

export default class GatherTaskModel {
    constructor() {
        this.gatherTaskData = [];
        this.loading = false;
    }

    /**
     * 查找当前用户的授权采集任务
     */
    async findGatherTask() {
        this.loading = true;
        try {
            const userid = window.localStorage.getItem('loginUserid');
            const response = await commonApi.select({
                sql: "gather_task_user.findTaskDistribution",
                userid: userid
            });
            if (response[0].state === "success") {
                this.gatherTaskData = response[0].objects || [];
            }
        } catch (error) {
            console.error(error);
            ElMessage.error("获取任务列表失败");
        } finally {
            this.loading = false;
        }
    }

    /**
     * 开始采集，跳转到采集页面
     */
    gather(row) {
        router.push({
            path: '/gather-page',
            query: {
                taskid: row.taskid,
                type: row.type
            }
        });
    }
}
