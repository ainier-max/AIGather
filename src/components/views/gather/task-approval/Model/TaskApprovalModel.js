import commonApi from '@/api/common';
import { ElMessage } from 'element-plus';

export default class TaskApprovalModel {
    constructor() {
        this.gatherTasks = [];
        this.activeNames = [];
        this.loading = false;
    }

    /**
     * 查询报审任务集
     */
    async findGatherTask() {
        this.loading = true;
        try {
            const param = {
                sql: "gather_task.findGatherTask",
                flag: "0"
            };
            const response = await commonApi.select(param);
            if (response[0].state === "success") {
                this.gatherTasks = response[0].objects || [];
                if (this.gatherTasks.length > 0) {
                    await this.findGatherLayerFieldNotApproval();
                }
            } else {
                ElMessage.error('获取任务列表失败');
            }
        } catch (error) {
            console.error(error);
            ElMessage.error('服务异常');
        } finally {
            this.loading = false;
        }
    }

    /**
     * 查询申请采集任务未被授权中的所有字段
     */
    async findGatherLayerFieldNotApproval() {
        try {
            const param = {
                sql: "gather_task.findGatherLayerField",
                approvalFlag: false
            };
            const response = await commonApi.select(param);
            if (response[0].state === "success") {
                const gatherTaskFields = response[0].objects || [];

                // Match fields to tasks
                this.gatherTasks.forEach(task => {
                    task.gatherTaskFields = [];
                    task.minGatherTaskFields = [];
                    gatherTaskFields.forEach(field => {
                        if (task.id === field.taskid) {
                            task.gatherTaskFields.push(field);
                            // Hide system fields from the summary table
                            if (field.field_name.indexOf("GATHER_") < 0) {
                                task.minGatherTaskFields.push(field);
                            }
                        }
                    });
                });
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 任务授权 (创建表)
     */
    async taskApproval(task) {
        try {
            const fields = task.gatherTaskFields.map(f => ({
                field_name: f.field_name,
                field_dec: f.field_dec,
                field_length: f.field_length,
                field_type: f.field_type
            }));

            const param = {
                sql: "gather_task.createTable",
                table_name: task.table_name,
                fields: fields
            };

            const response = await commonApi.excute(param);
            if (response[0].state === "success") {
                ElMessage.success('任务授权成功！');
                await this.findGatherTask();
                this.activeNames = [];
            } else {
                ElMessage.error('授权失败：' + (response[0].message || '服务异常'));
            }
        } catch (error) {
            console.error(error);
            ElMessage.error('授权执行异常');
        }
    }

    /**
     * 任务否决
     */
    async taskRefuse(id) {
        try {
            const param = {
                sql: "gather_task.refuseGatherTask",
                id: id
            };
            const response = await commonApi.excute(param);
            if (response[0].state === "success") {
                ElMessage.success('任务否决成功！');
                await this.findGatherTask();
                this.activeNames = [];
            } else {
                ElMessage.error('否决操作失败');
            }
        } catch (error) {
            console.error(error);
            ElMessage.error('否决执行异常');
        }
    }
}
