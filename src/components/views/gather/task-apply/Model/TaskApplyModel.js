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
        if (this.checkDuplicateFields()) {
            ElMessage.error('字段名重复');
            return false;
        }

        const tableName = this.getTableNamePrefix() + this.taskForm.taskTableName.toUpperCase();

        // 构建字段对象数组
        let field_objects = [];
        this.fieldDataForm.fileds.forEach(item => {
            let field_json = {
                "filed_name": item.filedNameValue,
                "filed_comment": item.filedCommentValue,
                "filed_type": item.type,
                "filed_length": item.length,
                "dic_id": item.dicid
            };
            field_objects.push(field_json);
        });

        const taskParam = {
            sql: "gather_task.applyTask",
            taskId: "TASK_" + Date.now(),
            taskName: this.taskForm.taskName,
            taskDec: this.taskForm.taskDec,
            tableName: tableName,
            gatherType: this.taskForm.gatherType,
            creater: loginUserid,
            field_objects: JSON.stringify(field_objects) // 通常后端接收字符串化的JSON
        };

        try {
            const res = await commonApi.excute(taskParam);
            if (res && res.length > 0) {
                const result = res[0];
                if (result.state === "success") {
                    ElMessage.success('任务申请提交成功');
                    return true;
                } else {
                    // 弹出后端返回的具体错误信息
                    ElMessage.error(result.message || '提交失败');
                    return false;
                }
            }
            return false;
        } catch (e) {
            ElMessage.error('网络请求失败: ' + e.message);
            return false;
        }
    }
}

export default TaskApplyModel;
