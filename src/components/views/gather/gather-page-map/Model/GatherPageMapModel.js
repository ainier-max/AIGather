import commonApi from "@/api/common";
import { ElMessage } from "element-plus";

/**
 * GatherPageModel - 采集页面业务逻辑模型
 * 负责数据采集、编辑、查询等业务逻辑
 */
export default class GatherPageMapModel {
  constructor() {
    // 采集任务对象
    this.gatherTaskObj = {};
    // 字段数组
    this.fieldArr = [];
    // 字段值对象
    this.tableFieldValue = {};

    // 分页相关
    this.curPage = 1;
    this.pageSize = 10;
    this.loading = false;
    this.noMoreFlag = 0;
    this.loadFlag = 0; // 0为首次加载

    // 列表显示数据
    this.onePageShowData = []; // show_flag=1的数据
    this.twoPageShowData = []; // show_flag=2的数据
    this.layerPageReturnfieldStr = "";

    // 地图显示数据
    this.layerMapReturnfieldStr = "";
    this.onePopupShowData = [];
    this.twoPopupShowData = [];
    this.threePopupShowData = [];
    this.allPopupData = [];

    // 当前编辑对象
    this.currentEditObj = null;

    // 图层图片
    this.layerImg = "";

    // 界面状态
    this.gatherButtonFlag = true;
    this.gatherFieldFlag = false;
    this.editFlag = false;
    this.gatherFlag = false;
    this.popupFlag = false;

    // 激活的折叠面板
    this.activeNames = ["1"];
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
        this.fieldArr = [];
        const result = response[0].objects;
        for (let i = 0; i < result.length; i++) {
          if (result[i].field_name.indexOf("GATHER_") < 0) {
            this.fieldArr.push(result[i]);
          }
        }

        // 根据采集类型添加坐标字段
        if (this.gatherTaskObj.type === 'point') {
          // 点类型：添加坐标X和坐标Y字段
          this.fieldArr.push({
            field_name: 'GATHER_ZBX',
            field_dec: '坐标X',
            field_type: 'word',
            show_flag: '0',
            is_coordinate: true
          });
          this.fieldArr.push({
            field_name: 'GATHER_ZBY',
            field_dec: '坐标Y',
            field_type: 'word',
            show_flag: '0',
            is_coordinate: true
          });
        } else if (this.gatherTaskObj.type === 'polyline' || this.gatherTaskObj.type === 'polygon') {
          // 线和面类型：添加坐标串字段
          this.fieldArr.push({
            field_name: 'GATHER_ZBC',
            field_dec: '坐标串',
            field_type: 'word',
            show_flag: '0',
            is_coordinate: true
          });
        }

        return this.fieldArr;
      }
    } catch (error) {
      console.error("查询图层字段失败:", error);
      ElMessage.error("查询图层字段失败");
    }
  }

  /**
   * 查询点图层对应的图片
   */
  async findGatherLayerImg(taskid) {
    try {
      const response = await commonApi.select({
        sql: "gather_task.findGatherLayerImg",
        taskid: taskid
      });
      if (response[0].state === "success" && response[0].objects.length > 0) {
        this.layerImg = response[0].objects[0].layerimg;
        return this.layerImg;
      }
    } catch (error) {
      console.error("查询图层图片失败:", error);
    }
  }

  /**
   * 分页查询采集图层数据
   */
  async findGatherLayerByPage() {
    console.log("=== findGatherLayerByPage 开始 ===");
    console.log("fieldArr:", this.fieldArr);

    if (this.fieldArr.length <= 0) {
      console.log("fieldArr 为空，返回");
      return;
    }

    // 判断是否含有标识为1的字段
    let showFlagTemp = 0;
    for (let i = 0; i < this.fieldArr.length; i++) {
      if (this.fieldArr[i].show_flag == "1") {
        showFlagTemp = 1;
      }
    }
    console.log("showFlagTemp:", showFlagTemp);

    if (showFlagTemp == 0) {
      this.gatherFlag = true;
      ElMessage.error("该采集任务未设置标识为1的字段！不能进行采集");
      return;
    }

    // 构建返回字段字符串
    this.layerPageReturnfieldStr = "";
    for (let i = 0; i < this.fieldArr.length; i++) {
      if (this.fieldArr[i].show_flag == "1" || this.fieldArr[i].show_flag == "2") {
        this.layerPageReturnfieldStr += this.fieldArr[i].field_name + ",";
      }
    }
    this.layerPageReturnfieldStr = this.layerPageReturnfieldStr + "gather_id";
    console.log("layerPageReturnfieldStr:", this.layerPageReturnfieldStr);

    const start = (this.curPage - 1) * this.pageSize;
    console.log("查询参数:", {
      sql: "gather_layer.find",
      fieldStr: this.layerPageReturnfieldStr,
      layer_name: this.fieldArr[0].table_name,
      start: start,
      pageSize: this.pageSize
    });

    try {
      const response = await commonApi.select({
        sql: "gather_layer.find",
        fieldStr: this.layerPageReturnfieldStr,
        layer_name: this.fieldArr[0].table_name,
        start: start,
        pageSize: this.pageSize
      });

      console.log("查询响应:", response);

      if (response[0].state === "success") {
        const result = response[0].objects;
        console.log("查询结果数量:", result.length);

        if (result.length == 0) {
          this.noMoreFlag = 1;
          this.loading = false;
          console.log("没有更多数据");
          return;
        }

        // 处理show_flag=1的数据
        for (let i = 0; i < result.length; i++) {
          for (let j = 0; j < this.fieldArr.length; j++) {
            if (this.fieldArr[j].show_flag == "1") {
              const obj = {
                showFlag: "1",
                name: this.fieldArr[j].field_name,
                dec: this.fieldArr[j].field_dec,
                value: result[i][this.fieldArr[j].field_name],
                gatherID: result[i]["gather_id"]
              };
              this.onePageShowData.push(obj);
            }
          }
        }
        console.log("onePageShowData 数量:", this.onePageShowData.length);

        // 处理show_flag=2的数据
        for (let i = 0; i < result.length; i++) {
          const arr = [];
          for (let j = 0; j < this.fieldArr.length; j++) {
            if (this.fieldArr[j].show_flag == "2") {
              const obj = {
                showFlag: "2",
                name: this.fieldArr[j].field_name,
                dec: this.fieldArr[j].field_dec,
                field_type: this.fieldArr[j].field_type
              };

              if (["photo", "video", "audio"].includes(this.fieldArr[j].field_type)) {
                obj.arrValue = [];
                const mediaStr = result[i][obj.name];
                if (mediaStr) {
                  const mediaArr = mediaStr.split(",");
                  for (let k = 0; k < mediaArr.length; k++) {
                    if (mediaArr[k] != "") {
                      obj.arrValue.push("/cbc/getFile.cbc?uuid=" + mediaArr[k] + "&type=" + this.fieldArr[j].field_type);
                    }
                  }
                }
                console.log("obj.arrValue", obj.arrValue);
              } else {
                obj.value = result[i][obj.name];
              }
              arr.push(obj);
            }
          }
          this.twoPageShowData.push(arr);
        }

        this.loading = false;
        this.loadFlag = 1;
      }
    } catch (error) {
      console.error("查询采集数据失败:", error);
      ElMessage.error("查询采集数据失败");
      this.loading = false;
    }
  }

  /**
   * 加载更多数据（无限滚动）
   */
  async loadMore() {
    if (this.loadFlag == 0) {
      return;
    }
    this.loading = true;
    this.curPage = this.curPage + 1;
    await this.findGatherLayerByPage();
  }

  /**
   * 根据ID查询采集图层数据（用于地图定位和编辑）
   */
  async findGatherLayerById(gatherId) {
    // 构建返回字段字符串
    this.layerMapReturnfieldStr =
      "gather_id,gather_cjsj,gather_cjr,gather_cjjq,gather_gxsj,gather_gxry,gather_zxsj,gather_zxry,gather_zxyy,gather_zxzt,";
    for (let i = 0; i < this.fieldArr.length; i++) {
      this.layerMapReturnfieldStr += this.fieldArr[i].field_name + ",";
    }
    if (this.gatherTaskObj.type == "point") {
      this.layerMapReturnfieldStr += "gather_zbx,gather_zby";
    } else if (this.gatherTaskObj.type == "polyline" || this.gatherTaskObj.type == "polygon") {
      this.layerMapReturnfieldStr += "gather_zbc";
    }

    try {
      const response = await commonApi.select({
        sql: "gather_layer.find",
        fieldStr: this.layerMapReturnfieldStr,
        layer_name: this.fieldArr[0].table_name,
        gather_id: gatherId
      });

      if (response[0].state === "success" && response[0].objects.length > 0) {
        this.currentEditObj = response[0].objects[0];

        // 准备气泡框显示数据
        this.preparePopupData(response[0].objects[0]);

        return this.currentEditObj;
      }
    } catch (error) {
      console.error("查询采集数据详情失败:", error);
      ElMessage.error("查询采集数据详情失败");
    }
  }

  /**
   * 准备气泡框显示数据
   */
  preparePopupData(data) {
    console.log("preparePopupData--data:", data);
    this.allPopupData = [];
    for (let i = 0; i < this.fieldArr.length; i++) {
      const field = this.fieldArr[i];
      const obj = {
        field_dec: field.field_dec,
        field_type: field.field_type,
        value: data[field.field_name]
      };

      if (['photo', 'video', 'audio'].includes(field.field_type)) {
        obj.arrValue = [];
        const str = data[field.field_name];
        console.log("preparePopupData--field:", field.field_name, "type:", field.field_type, "str:", str);
        if (str) {
          const arr = str.split(',');
          for (let j = 0; j < arr.length; j++) {
            if (arr[j]) {
              obj.arrValue.push("/cbc/getFile.cbc?uuid=" + arr[j] + "&type=" + field.field_type);
            }
          }
        }
        console.log("preparePopupData--arrValue:", obj.arrValue);
      }
      this.allPopupData.push(obj);
    }
    console.log("preparePopupData--allPopupData:", this.allPopupData);
  }

  /**
   * 保存采集数据
   */
  async gatherData(geometryData) {
    // 验证字段
    for (let i = 0; i < this.fieldArr.length; i++) {
      // 判断标题字段内容
      if (this.fieldArr[i].show_flag == "1") {
        if (typeof this.tableFieldValue[this.fieldArr[i].field_name] == "undefined") {
          ElMessage.error("标题字段未采集！");
          return false;
        }
      }
    }

    // 判断坐标数据
    if (!geometryData) {
      ElMessage.error("未在地图进行采集！");
      return false;
    }

    // 构建参数
    const param = {
      sql: "gather_layer.insert",
      table_name: this.gatherTaskObj.table_name,
      gather_type: this.gatherTaskObj.type,
      keys: [],
      values: []
    };

    console.log("gatherData--fieldArr:", this.fieldArr);
    for (let i = 0; i < this.fieldArr.length; i++) {

      //param.keys不需要有坐标相关字段-start
      if (this.fieldArr[i].field_name == "GATHER_ZBX" || this.fieldArr[i].field_name == "GATHER_ZBY" || this.fieldArr[i].field_name == "GATHER_ZBC") {
        continue;
      }

      //param.keys不需要有坐标相关字段-end
      param.keys.push(this.fieldArr[i].field_name);
      if (typeof this.tableFieldValue[this.fieldArr[i].field_name] != "undefined") {
        param.values.push(this.tableFieldValue[this.fieldArr[i].field_name]);
      } else {
        param.values.push("");
      }

    }

    // 添加几何数据
    if (this.gatherTaskObj.type == "point") {
      param.gather_zbx = geometryData.lng;
      param.gather_zby = geometryData.lat;
    } else if (this.gatherTaskObj.type == "polyline" || this.gatherTaskObj.type == "polygon") {
      param.gather_zbc = geometryData.coordinates;
    }

    param.gather_cjr = window.localStorage.getItem("loginUserid");
    param.gather_cjjq = window.localStorage.getItem("clientIP");

    console.log("gatherData--param:", param);
    try {
      const response = await commonApi.excute(param);
      if (response[0].state === "success") {
        ElMessage.success("采集数据成功！");

        // 重置状态
        this.resetAfterSave();
        return true;
      }
    } catch (error) {
      console.error("采集数据失败:", error);
      ElMessage.error("采集数据失败");
      return false;
    }
  }

  /**
   * 更新采集数据
   */
  async editData(geometryData) {
    // 验证字段
    for (let i = 0; i < this.fieldArr.length; i++) {
      if (this.fieldArr[i].show_flag == "1") {
        if (typeof this.tableFieldValue[this.fieldArr[i].field_name] == "undefined") {
          ElMessage.error("标题字段未采集！");
          return false;
        }
      }
    }

    const param = {
      sql: "gather_layer.update",
      table_name: this.gatherTaskObj.table_name,
      gather_type: this.gatherTaskObj.type,
      key_values: []
    };

    for (let i = 0; i < this.fieldArr.length; i++) {
      if (typeof this.tableFieldValue[this.fieldArr[i].field_name] != "undefined") {
        const valueTemp = this.tableFieldValue[this.fieldArr[i].field_name].toString().replace(/\\/g, "\\\\");
        const key_value_obj = this.fieldArr[i].field_name + "='" + valueTemp + "'";
        param.key_values.push(key_value_obj);
      } else {
        const key_value_obj = this.fieldArr[i].field_name + "=''";
        param.key_values.push(key_value_obj);
      }
    }

    // 添加几何数据
    if (this.gatherTaskObj.type == "point") {
      param.gather_zbx = geometryData.lng;
      param.gather_zby = geometryData.lat;
    } else if (this.gatherTaskObj.type == "polyline" || this.gatherTaskObj.type == "polygon") {
      param.gather_zbc = geometryData.coordinates;
    }

    param.gather_cjr = window.localStorage.getItem("loginUserid");
    param.gather_cjjq = window.localStorage.getItem("clientIP");
    param.gather_id = this.currentEditObj.gather_id;

    try {
      const response = await commonApi.excute(param);
      if (response[0].state === "success") {
        ElMessage.success("修改数据成功！");

        // 重置状态
        this.resetAfterSave();
        return true;
      } else {
        ElMessage.error("修改数据失败！");
        return false;
      }
    } catch (error) {
      console.error("修改数据失败:", error);
      ElMessage.error("修改数据失败");
      return false;
    }
  }

  /**
   * 删除数据
   */
  async deleteData() {
    if (!this.currentEditObj || !this.currentEditObj.gather_id) {
      ElMessage.error("无法获取数据ID");
      return false;
    }

    const param = {
      sql: "gather_layer.delete",
      table_name: this.gatherTaskObj.table_name,
      gather_id: this.currentEditObj.gather_id
    };

    try {
      const response = await commonApi.excute(param);
      if (response[0].state === "success") {
        ElMessage.success("删除成功！");

        // 重置状态并刷新
        this.resetAfterSave();
        return true;
      } else {
        ElMessage.error(response[0].message || "删除失败");
        return false;
      }
    } catch (error) {
      console.error("删除失败:", error);
      ElMessage.error("删除失败");
      return false;
    }
  }

  /**
   * 保存后重置状态
   */
  resetAfterSave() {
    this.gatherButtonFlag = true;
    this.gatherFieldFlag = false;
    this.currentEditObj = null;
    this.tableFieldValue = {};

    // 清空页面数据
    this.curPage = 1;
    this.onePageShowData = [];
    this.twoPageShowData = [];
    this.loadFlag = 0;
    this.noMoreFlag = 0;
  }

  /**
   * 开始采集
   */
  startGather() {
    this.currentEditObj = null;
    this.tableFieldValue = {};
    this.gatherButtonFlag = false;
    this.gatherFieldFlag = true;
    this.editFlag = false;
  }

  /**
   * 开始编辑
   */
  startEdit() {
    this.gatherButtonFlag = false;
    this.gatherFieldFlag = true;
    this.editFlag = true;
  }

  /**
   * 取消采集/编辑
   */
  cancelGather() {
    this.gatherButtonFlag = true;
    this.gatherFieldFlag = false;
    this.editFlag = false;
    this.currentEditObj = null;
    this.tableFieldValue = {};
  }
}
