/**
 * MVC中的Model层,主要用来处理逻辑
 * 专门用于处理空间类型为 None 的采集任务 (表格展现)
 */
import commonApi from "@/api/common/index.js";
import { ElMessage } from "element-plus";

class GatherPageModel {
    // 采集任务对象
    gatherTaskObj = {};
    // 字段数组
    fieldArr = [];

    // 分页相关
    curPage = 1;
    pageSize = 10;
    total = 0;
    loading = false;

    // 表格数据
    tableData = [];

    // 当前编辑内容
    tableFieldValue = {};
    currentEditObj = null;

    // 界面状态
    showTableFlag = true;
    showFormFlag = false;
    editFlag = false;

    constructor() {
    }

    /**
     * 查询采集任务信息
     */
    async findGatherTask(taskid) {
        try {
            const response = await commonApi.select({
                sql: "gather_task.findGatherTask",
                id: taskid,
                flag: "1"
            });
            if (response[0].state === "success" && response[0].objects.length > 0) {
                this.gatherTaskObj = response[0].objects[0];
                return this.gatherTaskObj;
            }
        } catch (error) {
            console.error("查询采集任务失败:", error);
            ElMessage.error("查询采集任务失败");
        }
    }

    /**
     * 查询图层字段配置
     */
    async findGatherLayerField(taskid) {
        try {
            const response = await commonApi.select({
                sql: "gather_task.findGatherLayerField",
                taskid: taskid
            });
            if (response[0].state === "success") {
                // 排除系统内部字段
                this.fieldArr = (response[0].objects || []).filter(f => f.field_name.indexOf("GATHER_") < 0);
                return this.fieldArr;
            }
        } catch (error) {
            console.error("查询图层字段失败:", error);
            ElMessage.error("查询图层字段失败");
        }
    }

    /**
     * 获取数据列表
     */
    async findDataList() {
        if (!this.gatherTaskObj.table_name) return;
        this.loading = true;

        try {
            // 构建查询字段串
            const fieldStr = this.fieldArr.map(f => f.field_name).join(",") + ",gather_id,gather_cjsj,gather_cjr";

            const start = (this.curPage - 1) * this.pageSize;

            const response = await commonApi.select({
                sql: "gather_layer.find",
                fieldStr: fieldStr,
                layer_name: this.gatherTaskObj.table_name,
                start: start,
                pageSize: this.pageSize
            });

            if (response[0].state === "success") {
                this.tableData = response[0].objects || [];
                // 如果有返回总数的需求，通常需要另一个接口或在response中包含。
                // 这里的 mock 或简单处理：如果返回数量等于 pageSize，则假定有下一页。
                // 实际项目中通常会有 count 接口。
                await this.getDataCount();
            }
        } catch (error) {
            console.error("查询采集数据失败:", error);
            ElMessage.error("查询采集数据失败");
        } finally {
            this.loading = false;
        }
    }

    async getDataCount() {
        try {
            const response = await commonApi.select({
                sql: "gather_layer.count", // 假定有这个 count sql
                layer_name: this.gatherTaskObj.table_name
            });
            if (response[0].state === "success" && response[0].objects.length > 0) {
                this.total = response[0].objects[0].count || 0;
            }
        } catch (error) {
            // Count fail often happens if sql missing, fallback to current table len
            this.total = this.tableData.length + (this.curPage > 1 ? start : 0);
        }
    }

    /**
     * 准备新增
     */
    prepareAdd() {
        this.tableFieldValue = {};
        this.currentEditObj = null;
        this.editFlag = false;
        this.showTableFlag = false;
        this.showFormFlag = true;
    }

    /**
     * 准备修改
     */
    prepareEdit(row) {
        this.currentEditObj = row;
        // 深度拷贝到 tableFieldValue 以供编辑
        this.tableFieldValue = JSON.parse(JSON.stringify(row));
        this.editFlag = true;
        this.showTableFlag = false;
        this.showFormFlag = true;
    }

    /**
     * 取消编辑
     */
    cancel() {
        this.showTableFlag = true;
        this.showFormFlag = false;
        this.tableFieldValue = {};
    }

    /**
     * 保存数据
     */
    async saveData() {
        const param = {
            sql: this.editFlag ? "gather_layer.update" : "gather_layer.insert",
            table_name: this.gatherTaskObj.table_name,
            gather_type: 'none',
            keys: [],
            values: [],
            key_values: []
        };

        if (this.editFlag) {
            for (let i = 0; i < this.fieldArr.length; i++) {
                const key = this.fieldArr[i].field_name;
                const val = this.tableFieldValue[key] || "";
                param.key_values.push(`${key}='${val}'`);
            }
            param.gather_id = this.currentEditObj.gather_id;
        } else {
            for (let i = 0; i < this.fieldArr.length; i++) {
                const key = this.fieldArr[i].field_name;
                param.keys.push(key);
                param.values.push(this.tableFieldValue[key] || "");
            }
            param.gather_cjr = localStorage.getItem("loginUserid");
        }

        try {
            const res = await commonApi.excute(param);
            if (res[0].state === "success") {
                ElMessage.success(this.editFlag ? "更新成功" : "添加成功");
                this.cancel();
                await this.findDataList();
            }
        } catch (error) {
            console.error("保存失败:", error);
            ElMessage.error("保存失败");
        }
    }

    /**
     * 删除数据
     */
    async deleteData(gather_id) {
        try {
            const res = await commonApi.excute({
                sql: "gather_layer.delete",
                table_name: this.gatherTaskObj.table_name,
                gather_id: gather_id
            });
            if (res[0].state === "success") {
                ElMessage.success("删除成功");
                await this.findDataList();
            }
        } catch (error) {
            console.error("删除失败:", error);
            ElMessage.error("删除失败");
        }
    }
}

export default GatherPageModel;
