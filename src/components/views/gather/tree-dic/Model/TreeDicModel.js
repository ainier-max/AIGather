import commonApi from "@/api/common/index.js";
import { ElMessage } from 'element-plus';

class TreeDicModel {
    // Creating Tree Dic Form
    ruleForm = {
        treename: '',
        treems: '',
        treelength: ''
    };

    // Tree Dic Selection
    treedics = [];
    currentTreeDicid = '';
    currentTreeTableName = '';

    // Tree Data
    treeData = [];
    defaultProps = {
        children: 'children',
        label: 'label'
    };

    // Selected Node Info
    currentTreeid = '';
    currentTreeLabel = '';

    // Dialogs & Forms
    dialogVisible = false; // Add/Edit Node Dialog
    deleteTreeDataDialogVisible = false;
    deleteTreeDicDialogVisible = false;
    editFlag = 0; // 0: Add, 1: Edit
    treeDialogTitle = '树节点维护';

    treeDicDataForm = {
        treeid: '',
        treems: '',
    };

    constructor() {
    }

    // --- Actions ---

    async createTreeDic() {
        console.log("创建树形字典");
        const param = {
            treename: this.ruleForm.treename,
            treems: this.ruleForm.treems,
            treelength: this.ruleForm.treelength,
            tablename: "gather_tree_dic_" + this.ruleForm.treename,
            sql: "gather_tree_dic.insert_tree_dic"
        };

        try {
            const res = await commonApi.excute(param);
            if (res && res.length > 0 && res[0].state === "success") {
                ElMessage.success('成功创建树形字典！');
                this.ruleForm.treename = '';
                this.ruleForm.treems = '';
                this.ruleForm.treelength = '';
                this.findAllTreeDic();
            } else {
                ElMessage.error('服务异常请联系管理人员！');
            }
        } catch (error) {
            ElMessage.error('服务异常请联系管理人员！');
            console.error(error);
        }
    }

    async findAllTreeDic() {
        const param = { sql: "gather_tree_dic.find_tree_dic" };
        try {
            const res = await commonApi.select(param);
            if (res && res.length > 0 && res[0].state === "success") {
                this.treedics = res[0].objects;
                if (this.treedics.length > 0 && !this.currentTreeDicid) {
                    this.currentTreeDicid = this.treedics[0].treeid;
                    // Trigger selection change logic manually if needed or let watcher handle it in View
                    this.findTreeDic(this.currentTreeDicid);
                }
            } else {
                ElMessage.error('服务异常请联系管理人员！');
            }
        } catch (error) {
            ElMessage.error('服务异常请联系管理人员！');
            console.error(error);
        }
    }

    async findTreeDic(treeDicid) {
        if (!treeDicid) return;
        this.currentTreeid = "";
        this.currentTreeLabel = "";

        const param = {
            treeid: treeDicid,
            sql: "gather_tree_dic.find_tree_dic"
        };
        try {
            const res = await commonApi.select(param);
            if (res && res.length > 0 && res[0].state === "success") {
                if (res[0].objects.length > 0) {
                    this.currentTreeTableName = res[0].objects[0].tablename;
                    this.findTreeDicData(this.currentTreeTableName);
                }
            } else {
                ElMessage.error('服务异常请联系管理人员！');
            }
        } catch (error) {
            ElMessage.error('服务异常请联系管理人员！');
            console.error(error);
        }
    }

    async findTreeDicData(tablename) {
        if (!tablename) return;
        const param = {
            treetablename: tablename,
            sql: "gather_tree_dic.find_tree_dic_data"
        };
        try {
            const res = await commonApi.select(param);
            if (res && res.length > 0 && res[0].state === "success") {
                this.treeData = this.translateDataToTree(res[0].objects);
            } else {
                ElMessage.error('服务异常请联系管理人员！');
            }
        } catch (error) {
            ElMessage.error('服务异常请联系管理人员！');
            console.error(error);
        }
    }

    // --- Tree Node Operations ---

    showTreeDicDataAddWin() {
        this.editFlag = 0;
        this.treeDialogTitle = "添加树节点";
        this.treeDicDataForm.treeid = "";
        this.treeDicDataForm.treems = "";
        this.dialogVisible = true;
    }

    showTreeDicDataEditWin() {
        if (!this.currentTreeid) {
            ElMessage.error('未选择要修改的树节点！');
        } else {
            this.treeDialogTitle = "修改树节点";
            this.editFlag = 1;
            this.treeDicDataForm.treeid = this.currentTreeid;
            this.treeDicDataForm.treems = this.currentTreeLabel;
            this.dialogVisible = true;
        }
    }

    async addTreeDicData() {
        const param = {};
        if (this.currentTreeid) {
            param.pid = this.currentTreeid;
        }
        param.dictreedataid = this.treeDicDataForm.treeid;
        param.dictreedataname = this.treeDicDataForm.treems;
        param.treetablename = this.currentTreeTableName;
        param.sql = "gather_tree_dic.insert_tree_dic_data";

        try {
            const res = await commonApi.excute(param);
            if (res && res.length > 0 && res[0].state === "success") {
                this.dialogVisible = false;
                this.findTreeDicData(this.currentTreeTableName);
            }
        } catch (error) {
            ElMessage.error('服务异常请联系管理人员！');
            console.error(error);
        }
    }

    async editTreeDicData() {
        const param = {
            dictreedataid: this.treeDicDataForm.treeid,
            dictreedataname: this.treeDicDataForm.treems,
            treetablename: this.currentTreeTableName,
            sql: "gather_tree_dic.update_tree_dic_data"
        };

        try {
            const res = await commonApi.excute(param);
            if (res && res.length > 0 && res[0].state === "success") {
                this.dialogVisible = false;
                this.currentTreeid = "";
                this.currentTreeLabel = "";
                this.findTreeDicData(this.currentTreeTableName);
            }
        } catch (error) {
            ElMessage.error('服务异常请联系管理人员！');
            console.error(error);
        }
    }

    deleteTreeDataWin() {
        if (!this.currentTreeid) {
            ElMessage.error('未选择要删除的树节点！');
            return;
        }
        this.deleteTreeDataDialogVisible = true;
    }

    async deleteTreeData() {
        const param = {
            dictreedataid: this.currentTreeid,
            treetablename: this.currentTreeTableName,
            sql: "gather_tree_dic.delete_tree_dic_data"
        };

        try {
            const res = await commonApi.excute(param);
            if (res && res.length > 0 && res[0].state === "success") {
                this.currentTreeid = "";
                this.currentTreeLabel = "";
                ElMessage.success('成功删除树节点！');
                this.deleteTreeDataDialogVisible = false;
                this.findTreeDicData(this.currentTreeTableName);
            }
        } catch (error) {
            ElMessage.error('服务异常请联系管理人员！');
            console.error(error);
        }
    }

    deleteTreeDicWin() {
        if (!this.currentTreeDicid) {
            ElMessage.error('没有可删除的树形字典！');
            return;
        }
        this.deleteTreeDicDialogVisible = true;
    }

    async deleteTreeDic() {
        const param = {
            treeid: this.currentTreeDicid,
            tablename: this.currentTreeTableName,
            sql: "gather_tree_dic.delete_tree_dic"
        };

        try {
            const res = await commonApi.excute(param);
            if (res && res.length > 0 && res[0].state === "success") {
                this.currentTreeid = "";
                this.currentTreeLabel = "";
                this.deleteTreeDicDialogVisible = false;
                ElMessage.success('成功删除树形字典！');
                this.currentTreeDicid = ''; // Reset selection
                this.findAllTreeDic();
            }
        } catch (error) {
            ElMessage.error('服务异常请联系管理人员！');
            console.error(error);
        }
    }

    handleNodeClick(data) {
        // Node data structure from backend usually has id and label (mapped from translateDataToTree)
        console.log("点击树节点：", data);
        this.currentTreeid = data.id;
        this.currentTreeLabel = data.label;
    }

    // --- Helpers ---

    translateDataToTree(data) {
        // Updated to handle 'undefined' string or null, same as original logic
        let parents = data.filter(value => value.pid == 'undefined' || value.pid == null || value.pid == '');
        let childrens = data.filter(value => value.pid !== 'undefined' && value.pid != null && value.pid != '');

        let translator = (parents, childrens) => {
            parents.forEach((parent) => {
                childrens.forEach((current, index) => {
                    if (current.pid === parent.id) {
                        let temp = JSON.parse(JSON.stringify(childrens));
                        temp.splice(index, 1);
                        translator([current], temp);
                        typeof parent.children !== 'undefined' ? parent.children.push(current) : parent.children = [current];
                    }
                });
            });
        };
        translator(parents, childrens);
        return parents;
    }
}

export default TreeDicModel;
