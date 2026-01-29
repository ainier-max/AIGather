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
        fileds: []
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

    CheckArrayElement(array) {
        array.sort();
        var reNum = 0;
        for (var i = 0; i < array.length; i++) {
            if (i + 1 == array.length) {
                continue;
            }
            if (array[i] == array[i + 1]) {
                reNum += 1;
            }
        }
        return reNum;
    }

    async submitTask(loginUserid) {
        // 1. Validate fields existence
        if (this.fieldDataForm.fileds.length <= 0) {
            ElMessage.error('没有添加字段信息！');
            return false;
        }
        // 2. Validate layer image for points
        if (this.taskForm.gatherType == "point" && this.layerImage == '') {
            ElMessage.error('没有添加图层图片！');
            return false;
        }

        // 3. Check for duplicate field names
        var arrayTemp = [];
        for (var i = 0; i < this.fieldDataForm.fileds.length; i++) {
            arrayTemp.push(this.fieldDataForm.fileds[i].filedNameValue);
        }
        var numFlag = this.CheckArrayElement(arrayTemp);
        if (numFlag > 0) {
            ElMessage.error('字段名存在重复！');
            return false;
        }

        // 4. Check if table exists
        return await this.findTableByTableName(loginUserid);
    }

    async findTableByTableName(loginUserid) {
        var gather_table_name = "";
        if (this.taskForm.gatherType == "point") {
            gather_table_name = "PT_" + this.taskForm.taskTableName;
        } else if (this.taskForm.gatherType == "polyline") {
            gather_table_name = "PL_" + this.taskForm.taskTableName;
        } else if (this.taskForm.gatherType == "polygon") {
            gather_table_name = "PG_" + this.taskForm.taskTableName;
        } else {
            gather_table_name = "PA_" + this.taskForm.taskTableName;
        }

        const param = {
            table_name: gather_table_name,
            sql: "gather_task.findTableByTableName"
        };

        try {
            const res = await commonApi.select(param);
            if (res && res.length > 0 && res[0].state === "success") {
                var result = res[0].objects;
                if (result.length > 0) {
                    ElMessage.error('该表已存在，请修改存储表名！');
                    return false;
                } else {
                    return await this.createTaskApply(loginUserid);
                }
            } else {
                ElMessage.error('服务异常请联系管理人员！');
                return false;
            }
        } catch (error) {
            ElMessage.error('服务异常请联系管理人员！');
            console.error(error);
            return false;
        }
    }

    async createTaskApply(loginUserid) {
        var tableName = "";
        var color = "";
        var layerimg = "";
        if (this.taskForm.gatherType == "point") {
            tableName = "PT_" + this.taskForm.taskTableName;
            layerimg = this.layerImage;
        } else if (this.taskForm.gatherType == "polyline") {
            tableName = "PL_" + this.taskForm.taskTableName;
            // Assuming layerColor is managed in model, default if not
            color = this.layerColor || '#00ffff';
        } else if (this.taskForm.gatherType == "polygon") {
            tableName = "PG_" + this.taskForm.taskTableName;
            color = this.layerColor || '#00ffff';
        } else {
            tableName = "PA_" + this.taskForm.taskTableName;
        }

        var param = {};
        param.sql = 'gather_task.applyTask';
        param.type = this.taskForm.gatherType;
        param.name = this.taskForm.taskName;
        param.description = this.taskForm.taskDec;
        param.table_name = tableName;
        param.layerimg = layerimg;
        param.userid = loginUserid;
        param.color = color;
        param.objects = this.createField(tableName);

        try {
            const res = await commonApi.excute(param); // using excute for write ops
            if (res && res.length > 0) {
                if (res[0].state === "success") {
                    ElMessage.success('申请成功！');
                    // Reset form
                    this.taskForm.taskName = '';
                    this.taskForm.taskDec = '';
                    this.taskForm.taskTableName = '';
                    this.fieldDataForm.fileds = [];
                    this.layerImage = "";
                    // Reset styling if needed handled in view
                    return true;
                } else {
                    ElMessage.error(res[0].message || '服务异常请联系管理人员！');
                    return false;
                }
            } else {
                ElMessage.error('服务异常请联系管理人员！');
                return false;
            }
        } catch (error) {
            ElMessage.error('服务异常请联系管理人员！');
            console.error(error);
            return false;
        }
    }

    createField(tableName) {
        var field_objects = [];
        //默认文字字段--主键
        var field_json = {};
        field_json.table_name = tableName;
        field_json.field_name = "GATHER_ID";
        field_json.field_dec = "主键";
        field_json.field_length = "";
        field_json.field_type = 'int';
        field_json.dicid = '';
        field_json.show_flag = '0';
        field_objects.push(field_json);
        if (this.taskForm.gatherType == "point") {
            //默认文字字段--坐标X
            var field_json = {};
            field_json.table_name = tableName;
            field_json.field_name = "GATHER_ZBX";
            field_json.field_dec = "坐标X";
            field_json.field_length = "30";
            field_json.field_type = 'word';
            field_json.dicid = '';
            field_json.show_flag = '4';
            field_objects.push(field_json);
            //默认文字字段--坐标Y
            var field_json = {};
            field_json.table_name = tableName;
            field_json.field_name = "GATHER_ZBY";
            field_json.field_dec = "坐标Y";
            field_json.field_length = "30";
            field_json.field_type = 'word';
            field_json.dicid = '';
            field_json.show_flag = '4';
            field_objects.push(field_json);
        } else if (this.taskForm.gatherType == "polyline") {
            //默认文字字段--坐标串
            var field_json = {};
            field_json.table_name = tableName;
            field_json.field_name = "GATHER_ZBC";
            field_json.field_dec = "坐标串";
            field_json.field_length = "";
            field_json.field_type = 'word';
            field_json.dicid = '';
            field_json.show_flag = '4';
            field_objects.push(field_json);
        } else if (this.taskForm.gatherType == "polygon") {
            //默认文字字段--坐标串
            var field_json = {};
            field_json.table_name = tableName;
            field_json.field_name = "GATHER_ZBC";
            field_json.field_dec = "坐标串";
            field_json.field_length = "";
            field_json.field_type = 'word';
            field_json.dicid = '';
            field_json.show_flag = '4';
            field_objects.push(field_json);
        }
        //默认文字字段--采集人
        var field_json = {};
        field_json.table_name = tableName;
        field_json.field_name = "GATHER_CJR";
        field_json.field_dec = "采集人";
        field_json.field_length = "30";
        field_json.field_type = 'word';
        field_json.dicid = '';
        field_json.show_flag = '4';
        field_objects.push(field_json);
        //默认文字字段--采集时间
        var field_json = {};
        field_json.table_name = tableName;
        field_json.field_name = "GATHER_CJSJ";
        field_json.field_dec = "采集时间";
        field_json.field_length = "50";
        field_json.field_type = 'time';
        field_json.dicid = '';
        field_json.show_flag = '4';
        field_objects.push(field_json);
        //默认文字字段--采集机器
        var field_json = {};
        field_json.table_name = tableName;
        field_json.field_name = "GATHER_CJJQ";
        field_json.field_dec = "采集机器";
        field_json.field_length = "30";
        field_json.field_type = 'word';
        field_json.dicid = '';
        field_json.show_flag = '4';
        field_objects.push(field_json);
        //默认文字字段--更新人员
        var field_json = {};
        field_json.table_name = tableName;
        field_json.field_name = "GATHER_GXRY";
        field_json.field_dec = "更新人员";
        field_json.field_length = "30";
        field_json.field_type = 'word';
        field_json.dicid = '';
        field_json.show_flag = '4';
        field_objects.push(field_json);
        //默认文字字段--更新时间
        var field_json = {};
        field_json.table_name = tableName;
        field_json.field_name = "GATHER_GXSJ";
        field_json.field_dec = "更新时间";
        field_json.field_length = "50";
        field_json.field_type = 'time';
        field_json.dicid = '';
        field_json.show_flag = '4';
        field_objects.push(field_json);
        //默认文字字段--注销人员
        var field_json = {};
        field_json.table_name = tableName;
        field_json.field_name = "GATHER_ZXRY";
        field_json.field_dec = "注销人员";
        field_json.field_length = "30";
        field_json.field_type = 'word';
        field_json.dicid = '';
        field_json.show_flag = '4';
        field_objects.push(field_json);
        //默认文字字段--注销时间
        var field_json = {};
        field_json.table_name = tableName;
        field_json.field_name = "GATHER_ZXSJ";
        field_json.field_dec = "注销时间";
        field_json.field_length = "50";
        field_json.field_type = 'time';
        field_json.dicid = '';
        field_json.show_flag = '4';
        field_objects.push(field_json);
        //默认文字字段--注销状态
        var field_json = {};
        field_json.table_name = tableName;
        field_json.field_name = "GATHER_ZXZT";
        field_json.field_dec = "注销状态";
        field_json.field_length = "30";
        field_json.field_type = 'word';
        field_json.dicid = '';
        field_json.show_flag = '4';
        field_objects.push(field_json);
        //默认文字字段--注销原因
        var field_json = {};
        field_json.table_name = tableName;
        field_json.field_name = "GATHER_ZXYY";
        field_json.field_dec = "注销原因";
        field_json.field_length = "3000";
        field_json.field_type = 'word';
        field_json.dicid = '';
        field_json.show_flag = '4';
        field_objects.push(field_json);
        //创建字段
        for (var i = 0; i < this.fieldDataForm.fileds.length; i++) {
            //文字字段
            if (this.fieldDataForm.fileds[i].type == "word") {
                var field_json = {};
                field_json.table_name = tableName;
                field_json.field_name = this.fieldDataForm.fileds[i].filedNameValue;
                field_json.field_dec = this.fieldDataForm.fileds[i].filedCommentValue;
                // Use default or bound length
                field_json.field_length = this.fieldDataForm.fileds[i].length || "50";
                field_json.field_type = this.fieldDataForm.fileds[i].type
                field_json.dicid = '';
                field_json.show_flag = '3';
                field_objects.push(field_json);
            }
            //下拉框字段
            if (this.fieldDataForm.fileds[i].type == "select") {
                var field_json = {};
                field_json.table_name = tableName;
                field_json.field_name = this.fieldDataForm.fileds[i].filedNameValue;
                field_json.field_dec = this.fieldDataForm.fileds[i].filedCommentValue;
                field_json.field_length = this.fieldDataForm.fileds[i].length || "50";
                field_json.field_type = this.fieldDataForm.fileds[i].type;
                field_json.dicid = this.fieldDataForm.fileds[i].dicid; // Use dicid from model
                field_json.show_flag = '3';
                field_objects.push(field_json);
            }
            //树形字段
            if (this.fieldDataForm.fileds[i].type == "tree") {
                var field_json = {};
                field_json.table_name = tableName;
                field_json.field_name = this.fieldDataForm.fileds[i].filedNameValue;
                field_json.field_dec = this.fieldDataForm.fileds[i].filedCommentValue;
                field_json.field_length = this.fieldDataForm.fileds[i].length || "50";
                field_json.field_type = this.fieldDataForm.fileds[i].type;
                field_json.dicid = this.fieldDataForm.fileds[i].dicid; // Use dicid (treeid) from model
                field_json.show_flag = '3';
                field_objects.push(field_json);
            }
            //时间字段
            if (this.fieldDataForm.fileds[i].type == "time") {
                var field_json = {};
                field_json.table_name = tableName;
                field_json.field_name = this.fieldDataForm.fileds[i].filedNameValue;
                field_json.field_dec = this.fieldDataForm.fileds[i].filedCommentValue;
                field_json.field_length = "50";
                field_json.field_type = this.fieldDataForm.fileds[i].type;
                field_json.dicid = '';
                field_json.show_flag = '3';
                field_objects.push(field_json);
            }
            //富文本字段 etc
            if (['rich', 'photo', 'audio', 'video', 'image'].includes(this.fieldDataForm.fileds[i].type)) {
                var field_json = {};
                field_json.table_name = tableName;
                field_json.field_name = this.fieldDataForm.fileds[i].filedNameValue;
                field_json.field_dec = this.fieldDataForm.fileds[i].filedCommentValue;
                //field_json.field_length="50";
                // Map 'image' to 'photo' if backend expects 'photo', or keep as is. Reference uses 'photo'.
                // Your current model uses 'image' and 'video'. Reference uses 'photo', 'video', 'audio', 'rich'.
                // We'll map 'image' to 'photo' if needed or trust the backend handles it.
                // Assuming 'image' in your model maps to 'photo' in logic if needed, but here we just pass type.
                // Note: The reference logic checks for 'photo'. Your model adds 'image'.
                field_json.field_type = this.fieldDataForm.fileds[i].type === 'image' ? 'photo' : this.fieldDataForm.fileds[i].type;
                field_json.dicid = '';
                field_json.show_flag = '3';
                field_objects.push(field_json);
            }
        }
        return field_objects;
    }
}

export default TaskApplyModel;
