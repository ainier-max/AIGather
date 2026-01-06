import commonApi from '@/api/common';
import { getListData } from '@/components/views/gather/common/tree';
import { ElMessage } from 'element-plus';

export default class TaskDetailModel {
    constructor() {
        this.gatherTaskTreeData = [];
        this.taskName = "未选中图层";
        this.taskDescription = "未选中图层";
        this.taskType = "";
        this.layerColor = "#0000ff";
        this.layerimg = "";
        this.editFlag = true;
        this.currentNode = null;
        this.currentNodeKey = 1;

        this.gatherTaskFieldData = [];
        this.fieldDialogVisible = false;

        this.fieldDataForm = {
            field_name: "",
            field_dec: "",
            field_length: "",
            show_flag: ""
        };

        this.showFlagArr = [1, 2, 3];
        this.currentField = null;

        this.deleteFieldDialogVisible = false;
        this.deleteFieldName = "";

        this.addFieldDataForm = {
            wordFieldNameValue: "",
            wordFieldCommentValue: "",
            wordFieldLengthValue: "",

            selectFieldNameValue: "",
            selectFieldCommentValue: "",
            selectFieldLengthValue: "",
            selectDicId: "",

            treeFieldNameValue: "",
            treeFieldCommentValue: "",
            treeFieldLengthValue: "",
            treeDicId: "",

            otherFieldNameValue: "",
            otherFieldCommentValue: ""
        };

        this.selectArrData = [];
        this.treeArrData = [];
        this.addFieldType = "";
        this.addFlag = false;
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
        this.addFlag = false;
        this.addFieldType = "";
        this.editFlag = true;

        if (!node.type) {
            this.taskName = "未选中图层";
            this.taskDescription = "未选中图层";
            this.taskType = "";
            this.layerColor = "#0000ff";
            this.layerimg = "";
            this.gatherTaskFieldData = [];
            return;
        }

        this.taskName = node.label;
        this.taskDescription = node.description;
        this.taskType = node.type;

        if (node.type === "point") {
            this.layerimg = node.layerimg;
            this.layerColor = "";
        } else if (node.type === "polygon" || node.type === "polyline") {
            this.layerimg = "";
            this.layerColor = node.color;
        } else {
            this.layerimg = "";
            this.layerColor = "";
        }

        await this.getLayerFieldDetail();
    }

    /**
     * 获取图层字段
     */
    async getLayerFieldDetail() {
        if (!this.currentNode || !this.currentNode.taskid) return;
        try {
            const response = await commonApi.select({
                sql: "gather_task.findGatherLayerField",
                taskid: this.currentNode.taskid,
                filter: "GATHER_"
            });
            if (response[0].state === "success") {
                this.gatherTaskFieldData = response[0].objects || [];
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 保存图层详情
     */
    async saveTaskDetail() {
        try {
            const param = {
                name: this.taskName,
                description: this.taskDescription,
                layerimg: this.layerimg,
                color: this.layerColor,
                id: this.currentNode.taskid,
                sql: "gather_task.updateGatherTask"
            };
            const response = await commonApi.excute(param);
            if (response[0].state === "success") {
                ElMessage.success("图层详情修改成功！");
                this.editFlag = true;
                await this.findGatherTaskTree();
            }
        } catch (error) {
            console.error(error);
            ElMessage.error("保存失败");
        }
    }

    /**
     * 图层字段修改
     */
    async editGatherTaskField() {
        try {
            const param = {
                sql: "gather_task.updateGatherTaskField",
                id: this.currentField.id,
                table_name: this.currentField.table_name,
                old_field_name: this.currentField.field_name,
                field_name: this.fieldDataForm.field_name,
                field_dec: this.fieldDataForm.field_dec,
                show_flag: this.fieldDataForm.show_flag,
                field_type: this.currentField.field_type
            };

            if (!["rich", "photo", "audio", "video"].includes(param.field_type)) {
                param.field_length = this.fieldDataForm.field_length;
            }

            const response = await commonApi.excute(param);
            if (response[0].state === "success") {
                ElMessage.success("图层字段修改成功！");
                this.fieldDialogVisible = false;
                await this.getLayerFieldDetail();
            } else {
                ElMessage.error("修改失败：" + (response[0].message || ""));
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 删除字段
     */
    async deleteGatherTaskField() {
        try {
            const param = {
                sql: "gather_task.deleteField",
                id: this.currentField.id,
                table_name: this.currentField.table_name,
                field_name: this.currentField.field_name
            };
            const response = await commonApi.excute(param);
            if (response[0].state === "success") {
                ElMessage.success("图层字段删除成功！");
                this.deleteFieldDialogVisible = false;
                await this.getLayerFieldDetail();
            }
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 新增字段
     */
    async addField() {
        const param = {
            sql: "gather_task.insertField",
            table_name: this.currentNode.tablename,
            field_type: this.addFieldType,
            show_flag: "3",
            taskid: this.currentNode.taskid,
            dicid: ""
        };

        if (this.addFieldType === "word") {
            param.field_name = this.addFieldDataForm.wordFieldNameValue;
            param.field_dec = this.addFieldDataForm.wordFieldCommentValue;
            param.field_length = this.addFieldDataForm.wordFieldLengthValue;
        } else if (this.addFieldType === "select") {
            param.field_name = this.addFieldDataForm.selectFieldNameValue;
            param.field_dec = this.addFieldDataForm.selectFieldCommentValue;
            param.field_length = this.addFieldDataForm.selectFieldLengthValue;
            param.dicid = this.addFieldDataForm.selectDicId;
        } else if (this.addFieldType === "tree") {
            param.field_name = this.addFieldDataForm.treeFieldNameValue;
            param.field_dec = this.addFieldDataForm.treeFieldCommentValue;
            param.field_length = this.addFieldDataForm.treeFieldLengthValue;
            param.dicid = this.addFieldDataForm.treeDicId;
        } else if (this.addFieldType === "time") {
            param.field_name = this.addFieldDataForm.otherFieldNameValue;
            param.field_dec = this.addFieldDataForm.otherFieldCommentValue;
            param.field_length = 50;
        } else {
            param.field_name = this.addFieldDataForm.otherFieldNameValue;
            param.field_dec = this.addFieldDataForm.otherFieldCommentValue;
            param.field_length = "";
        }

        try {
            const response = await commonApi.excute(param);
            if (response[0].state === "success") {
                ElMessage.success("新增图层字段成功！");
                this.addFlag = false;
                this.addFieldType = "";
                await this.getLayerFieldDetail();
            } else {
                ElMessage.error("新增失败：" + (response[0].message || ""));
            }
        } catch (error) {
            console.error(error);
        }
    }

    async findAllTreeDic() {
        const response = await commonApi.select({ sql: "gather_tree_dic.find_tree_dic" });
        if (response[0].state === "success") {
            this.treeArrData = response[0].objects || [];
        }
    }

    async findAllSelectDic() {
        const response = await commonApi.select({ sql: "gather_select_dic.find_select_dic" });
        if (response[0].state === "success") {
            this.selectArrData = response[0].objects || [];
        }
    }

    // UI helper methods
    choosePhoto(src) {
        this.layerimg = src;
    }

    showEditFieldWin(row) {
        this.showFlagArr = [1, 2, 3];
        const hasLevel1 = this.gatherTaskFieldData.some(f => f.show_flag == "1" && f.id !== row.id);
        if (hasLevel1) {
            this.showFlagArr = [2, 3];
        }

        this.currentField = row;
        this.fieldDataForm.field_name = row.field_name;
        this.fieldDataForm.field_dec = row.field_dec;
        this.fieldDataForm.show_flag = row.show_flag;
        this.fieldDataForm.field_length = ["rich", "photo", "audio", "video"].includes(row.field_type) ? null : row.field_length;
        this.fieldDialogVisible = true;
    }

    showDeleteFieldWin(row) {
        this.currentField = row;
        this.deleteFieldName = row.field_name;
        this.deleteFieldDialogVisible = true;
    }

    async startAddField(type) {
        if (!this.currentNode || !this.currentNode.type) {
            ElMessage.error("当前选中并不是图层，不可新增字段！");
            return;
        }

        Object.keys(this.addFieldDataForm).forEach(k => this.addFieldDataForm[k] = "");
        this.addFieldType = type;
        this.addFlag = true;

        if (type === "select") await this.findAllSelectDic();
        if (type === "tree") await this.findAllTreeDic();
    }
}
