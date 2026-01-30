import { getListData, findNodeById } from "@/components/views/gather/common/tree.js";
import { ElMessage } from "element-plus";
import { objectToString, stringToObject } from "@/components/views/gather/common/objStr.js";
import commonApi from "@/api/common/index.js";

/**
 * MVC中的Model层,主要用来处理逻辑
 */
class GatherModel {
    name = "GatherModel";

    // State properties
    dataModelTreeData = [];
    currentDataModelTreeNodeData = null;
    treeCurrentKey = "";
    codeEditorFlag = true;
    tableData = [];
    headerTableData = [];
    testSelectResultDialogVisible = false;
    namespaceForm = {
        name: "",
        name_space: "",
        data_model_id: "",
    };
    addNameSpaceDialogVisible = false;
    deleteNameSpaceDialogVisible = false;

    defaultProps = {
        children: "children",
        label: "label",
    };

    // Tree Ref (handled in View, but we might need to trigger methods)
    // In MVC, View should handle UI refs. Model just holds data.

    constructor() {
    }

    // Methods
    labelInput() {
        let nodeTemp = findNodeById(
            this.dataModelTreeData,
            this.currentDataModelTreeNodeData.id
        );
        console.log("变化", nodeTemp);
        nodeTemp.label = this.currentDataModelTreeNodeData.label;
    }

    findDataModelTree(treeRef) {
        let param = {};
        param.sql = "page_data_model_tree.find";
        commonApi.select(param).then(res => {
            const result = res[0];
            this.dataModelTreeData = getListData(result.objects, [
                "name_space",
                "data_model_id",
                "data_model_type",
                "data_model_sql",
                "data_model_param",
                "is_cache",
            ]);
            console.log("dataModelTreeData", this.dataModelTreeData);
            // Handling nextTick/UI updates usually belongs to View or via reactivity
            if (this.treeCurrentKey && treeRef && treeRef.value) {
                setTimeout(() => {
                    treeRef.value.setCurrentKey(this.treeCurrentKey);
                }, 100);
            }
        });
    }

    updateSQLCodeConfig(code) {
        this.currentDataModelTreeNodeData.data_model_sql = code;
    }

    updateTestCodeConfig(code) {
        this.currentDataModelTreeNodeData.data_model_param = code;
    }

    onEditNameSpace(callback) {
        let param = {};
        param.name = this.currentDataModelTreeNodeData.label;
        param.old_name_space = this.currentDataModelTreeNodeData.old_name_space;
        param.name_space = this.currentDataModelTreeNodeData.name_space;
        param.id = this.currentDataModelTreeNodeData.id;
        commonApi.mapperRefreshByEditNameSpace(param).then(res => {
            const result = res[0];
            if ((result.state = "success")) {
                ElMessage.success("保存成功！");
                if (callback) callback();
            }
        });
    }

    onSubmit() {
        let param = { ...this.currentDataModelTreeNodeData };
        param.name = this.currentDataModelTreeNodeData.label;
        commonApi.mapperRefresh(param).then(res => {
            const result = res[0];
            if ((result.state = "success")) {
                ElMessage.success("保存成功！");
            }
        });
    }

    onTest() {
        if (this.currentDataModelTreeNodeData.data_model_type == "select") {
            let param = stringToObject(
                this.currentDataModelTreeNodeData.data_model_param
            );
            param.sql =
                this.currentDataModelTreeNodeData.name_space +
                "." +
                this.currentDataModelTreeNodeData.data_model_id;
            commonApi.select(param).then(res => {
                const result = res[0];
                console.log("onTestSelectCallBack--result", result);
                if (result.objects.length > 0) {
                    this.headerTableData = Object.keys(result.objects[0]);
                    this.tableData = result.objects;
                    this.testSelectResultDialogVisible = true;
                } else {
                    ElMessage.success("未找到数据！");
                }
            });
        }
        if (
            this.currentDataModelTreeNodeData.data_model_type == "insert" ||
            this.currentDataModelTreeNodeData.data_model_type == "update" ||
            this.currentDataModelTreeNodeData.data_model_type == "delete"
        ) {
            let param = stringToObject(
                this.currentDataModelTreeNodeData.data_model_param
            );
            param.sql =
                this.currentDataModelTreeNodeData.name_space +
                "." +
                this.currentDataModelTreeNodeData.data_model_id;
            commonApi.excuteByBatch(param).then(res => {
                const result = res[0];
                console.log("onTestExcuteCallBack--result", result);
                if (result.state == "success") {
                    ElMessage.success("测试执行成功！");
                }
            });
        }
    }

    treeAppend(data) {
        console.log("treeAppend--data", data);
        if (data.name_space) {
            this.addNameSpaceDialogVisible = true;
        } else {
            this.addNameSpaceDialogVisible = true;
        }
    }

    addNameSpace(callback) {
        console.log("addNameSpace--namespaceForm", this.namespaceForm);
        let param = {};
        param.name = this.namespaceForm.name;
        if (this.namespaceForm.name_space) {
            param.name_space = this.namespaceForm.name_space;
        } else {
            param.name_space = this.currentDataModelTreeNodeData.name_space;
        }
        param.id = window.cbcuuid();
        param.pid = this.currentDataModelTreeNodeData.id;
        param.data_model_id = this.namespaceForm.data_model_id;

        param.sql = "page_data_model_tree.addNameSpace";
        commonApi.excute(param).then(res => {
            const result = res[0];
            if (result.state == "success") {
                ElMessage.success("保存成功！");
                this.addNameSpaceDialogVisible = false;
                if (callback) callback();
                this.namespaceForm.name = "";
                this.namespaceForm.name_space = "";
                this.namespaceForm.data_model_id = "";
            }
        });
    }

    treeRemove(data) {
        this.deleteNameSpaceDialogVisible = true;
    }

    deleteNameSpace(callback) {
        let param = {};
        param.id = this.currentDataModelTreeNodeData.id;
        param.pid = this.currentDataModelTreeNodeData.pid;
        param.name_space = this.currentDataModelTreeNodeData.name_space;
        if (!this.currentDataModelTreeNodeData.data_model_id) {
            param.deleteType = "deleteNamespace";
        } else {
            param.deleteType = "deleteSQL";
        }

        commonApi.mapperRefreshByDeleteNameSpace(param).then(res => {
            const result = res[0];
            if (result.state == "success") {
                ElMessage.success("删除成功！");
                this.deleteNameSpaceDialogVisible = false;
                if (callback) callback();
            }
        });
    }

    handleNodeClick(item, data) {
        console.log("handleNodeClick--item, data", item, data);
        this.findByID(item.id);
        this.codeEditorFlag = false;
        this.tableData = [];
    }

    findByID(id) {
        let param = {};
        param.sql = "page_data_model_tree.findByID";
        param.id = id;
        commonApi.select(param).then(res => {
            const result = res[0];
            console.log("findByIDCallBack--result", result);
            this.currentDataModelTreeNodeData = result.objects[0];
            this.currentDataModelTreeNodeData.label = this.currentDataModelTreeNodeData.name;
            this.currentDataModelTreeNodeData.old_name_space = result.objects[0].name_space;

            //如果没有值，则附加默认值
            if (!this.currentDataModelTreeNodeData.data_model_type) {
                this.currentDataModelTreeNodeData.data_model_type = "select";
            }
            if (!this.currentDataModelTreeNodeData.is_cache) {
                this.currentDataModelTreeNodeData.is_cache = "false";
            }
            if (!this.currentDataModelTreeNodeData.data_model_param) {
                this.currentDataModelTreeNodeData.data_model_param = "{}";
            }
            setTimeout(() => {
                this.codeEditorFlag = true;
            }, 0);
        });
    }
}
export default GatherModel
