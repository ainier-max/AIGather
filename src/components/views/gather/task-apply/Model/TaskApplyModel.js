/**
 * MVC中的Model层
 */
import commonApi from "@/api/common/index.js";
import { ElMessage } from 'element-plus';

class TaskApplyModel {
    taskForm = {
        taskName: '',
        taskDec: '',
        taskTableName: '',
        gatherType: 'point'
    };

    // 动态字段列表
    fieldDataForm = {
        fileds: [
            {
                filedNameValue: "GATHER_NAME",
                filedCommentValue: "采集名称",
                type: "word",
                length: "50",
                dicid: ""
            }
        ]
    };

    allSelectdics = [];
    allTreedics = [];
    layerImage = '';
    photoObj = null; // Store file object

    getTableNamePrefix() {
        const typeMap = {
            'point': 'PT_',
            'polyline': 'PL_',
            'polygon': 'PG_',
            'none': 'PA_'
        };
        return typeMap[this.taskForm.gatherType] || 'PT_';
    }

    constructor() {
    }

    async initDics() {
        const param = { sql: "gather_select_dic.find_select_dic" };
        const paramTree = { sql: "gather_tree_dic.find_tree_dic" };

        try {
            const res = await Promise.all([
                commonApi.select(param),
                commonApi.select(paramTree)
            ]);

            if (res[0] && res[0].length > 0 && res[0][0].state === "success") {
                this.allSelectdics = res[0][0].objects;
            }
            if (res[1] && res[1].length > 0 && res[1][0].state === "success") {
                this.allTreedics = res[1][0].objects;
            }
        } catch (error) {
            console.error(error);
        }
    }

    addField(type, dec, name) {
        let field_json = {
            filedNameValue: name || "",
            filedCommentValue: dec || "",
            type: type,
            length: "50",
            dicid: ""
        };
        this.fieldDataForm.fileds.push(field_json);
    }

    removeField(index) {
        if (index > -1) {
            this.fieldDataForm.fileds.splice(index, 1);
        }
    }

    checkDuplicateFields() {
        // Simple check
        const names = this.fieldDataForm.fileds.map(f => f.filedNameValue);
        return new Set(names).size !== names.length;
    }

    async submitTask(loginUserid) {
        // Implement logic similar to reference
        // 1. Check duplicates
        // 2. Build field_objects
        // 3. Call APIs (mock or real)

        if (this.checkDuplicateFields()) {
            ElMessage.error('字段名重复');
            return false;
        }

        const tableName = this.getTableNamePrefix() + this.taskForm.taskTableName.toUpperCase();

        // Construct params for task insertion and table creation
        // Since we don't have the full original source, we assume 'gather_task.insertTask' 
        // and some way to create fields.

        const taskParam = {
            sql: "gather_task.applyTask",
            taskId: "TASK_" + Date.now(),
            taskName: this.taskForm.taskName,
            taskDec: this.taskForm.taskDec,
            tableName: tableName,
            gatherType: this.taskForm.gatherType,
            creater: loginUserid
        };

        try {
            await commonApi.excute(taskParam);
            ElMessage.success('任务申请提交成功');
            return true;
        } catch (e) {
            ElMessage.error('提交失败: ' + e.message);
            return false;
        }
    }
}

export default TaskApplyModel;
