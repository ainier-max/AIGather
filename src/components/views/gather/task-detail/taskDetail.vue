<template>
  <div style="height: 100%;overflow:hidden">
    <div class="titleClass">任务详情</div>
    <div style="margin:40px 50px;width: 25%;float: left;height: 100%;">
      <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">图层树</span>
      </el-divider>
      <el-tree ref="layerTree" :data="gatherTaskTreeData" @node-click="handleNodeClick" node-key="id" class="down-tree"
        default-expand-all :highlight-current="true" :expand-on-click-node="false">
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span v-if="data.taskid == null"><i class="el-icon-folder"></i>{{ node.label }}</span>
          <span v-if="data.taskid != null">
            <i v-if="data.type.includes('polyline')" :style="data.colorStyle" class="el-icon-share"></i>
            <i v-if="data.type.includes('polygon')" :style="data.colorStyle" class="el-icon-house"></i>
            <i v-if="data.type.includes('none')" class="el-icon-tickets"></i>
            <el-image v-if="data.type.includes('point')" style="width: 14px;height: 14px"
              :src="data.layerimg"></el-image>
            {{ node.label }}
          </span>
        </span>
      </el-tree>
    </div>

    <div style="margin:40px 50px;width: 58%;float: right;height: 80%;padding-right:20px;overflow-y: auto">
      <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">图层详情</span>
      </el-divider>

      <el-row>
        <el-col :span="12">
          <el-input placeholder="任务名称" v-model="taskName" style="width: 80%" :disabled="editFlag">
          </el-input>
        </el-col>

        <el-col :span="12">
          <div class="filediv" style="cursor:pointer;" v-show="taskType == 'point'" title="图层图标" ref="fileRef">
            <input type="file" disabled ref="layerImgRef" @change="choosePhoto" style="cursor:pointer;"
              accept="image/*" />
          </div>
          <div v-show="taskType == 'polyline' || taskType == 'polygon'" title="图层颜色" class="colorClass" ref="colorRef">
            <el-color-picker :disabled="editFlag" ref="layerColorRef" v-model="layerColor"></el-color-picker>
          </div>
        </el-col>
      </el-row>

      <el-row style="padding-top: 20px">
        <el-col :span="24">
          <el-input placeholder="任务描述" v-model="taskDescription" style="width: 100%" :disabled="editFlag">
          </el-input>
        </el-col>
      </el-row>

      <div align="center" style="padding-top: 20px">
        <el-button v-if="editFlag == true" size="small" type="warning" @click="editTaskDetail()">修改</el-button>
        <el-button v-if="editFlag == false" size="small" type="primary" @click="saveTaskDetail()">保存</el-button>
      </div>

      <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">图层字段</span>
      </el-divider>

      <el-table :data="gatherTaskFieldData" border style="width: 100%;">
        <el-table-column prop="table_name" label="表名" width="150">
        </el-table-column>
        <el-table-column prop="field_dec" label="字段名称"> </el-table-column>
        <el-table-column prop="field_name" label="字段名"> </el-table-column>
        <el-table-column prop="field_length" label="字段长度" width="150">
        </el-table-column>
        <el-table-column prop="field_type" label="字段类型" width="100">
        </el-table-column>
        <el-table-column prop="show_flag" label="显示级别" width="100">
        </el-table-column>

        <el-table-column fixed="right" label="操作" width="100">
          <template slot-scope="scope">
            <i class="el-icon-edit" style="color:cornflowerblue;cursor:pointer;padding-left:10px;padding-right: 10px"
              @click="showEditGatherTaskFieldWin(scope.row)"></i>

            <i class="el-icon-delete" style="color:red;cursor:pointer"
              @click="showDeleteGatherTaskFieldWin(scope.row)"></i>
          </template>
        </el-table-column>
      </el-table>

      <div style="height: 20px"></div>
      <el-divider content-position="left" style="margin-left:50px;"><span style="font-size: 18px">新增字段</span>
      </el-divider>
      <el-form align="center" :model="addFieldDataForm" :inline="true" ref="addFieldDataForm">
        <el-row>
          <el-col v-if="addFieldType == 'word'" :span="20">
            <el-form-item :rules="filedNameRule" prop="wordFieldNameValue">
              <el-input size="small" style="width: 130px" v-model="addFieldDataForm.wordFieldNameValue"
                placeholder="字段名,如NAME"></el-input>
            </el-form-item>
            <el-form-item :rules="filedCommentRule" prop="wordFieldCommentValue">
              <el-input size="small" style="width: 130px" v-model="addFieldDataForm.wordFieldCommentValue"
                placeholder="字段描述,如名称"></el-input>
            </el-form-item>
            <el-form-item :rules="filedLengthRule" prop="wordFieldLengthValue">
              <el-input size="small" style="width: 160px;font-size:12px" v-model="addFieldDataForm.wordFieldLengthValue"
                placeholder="字段存储长度,如30"></el-input>
            </el-form-item>
          </el-col>
          <el-col v-if="addFieldType == 'select'" :span="20">
            <el-form-item :rules="filedNameRule" prop="selectFieldNameValue">
              <el-input size="small" style="width: 130px;font-size:12px" v-model="addFieldDataForm.selectFieldNameValue"
                placeholder="字段名,如NAME" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item :rules="filedCommentRule" prop="selectFieldCommentValue">
              <el-input size="small" style="width: 130px;font-size:12px"
                v-model="addFieldDataForm.selectFieldCommentValue" placeholder="字段描述,如名称" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item :rules="filedLengthRule" prop="selectFieldLengthValue">
              <el-input size="small" style="width: 160px;font-size:12px"
                v-model="addFieldDataForm.selectFieldLengthValue" placeholder="字段存储长度,如30" :disabled="true"></el-input>
            </el-form-item>
            <el-select size="small" v-model="addFieldDataForm.selectDicId" @change="filedSelectChange"
              style="width:20%;padding-top: 5px" placeholder="请选择">
              <el-option v-for="selectItem in selectArrData" :key="selectItem.dicid" :label="selectItem.dicms"
                :value="selectItem.dicid">
              </el-option>
            </el-select>
          </el-col>

          <el-col v-if="addFieldType == 'tree'" :span="20">
            <el-form-item :rules="filedNameRule" prop="treeFieldNameValue">
              <el-input size="small" style="width: 130px;font-size:12px" v-model="addFieldDataForm.treeFieldNameValue"
                placeholder="字段名,如NAME" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item :rules="filedCommentRule" prop="treeFieldCommentValue">
              <el-input size="small" style="width: 130px;font-size:12px"
                v-model="addFieldDataForm.treeFieldCommentValue" placeholder="字段描述,如名称" :disabled="true"></el-input>
            </el-form-item>
            <el-form-item :rules="filedLengthRule" prop="treeFieldLengthValue">
              <el-input size="small" style="width: 160px;font-size:12px" v-model="addFieldDataForm.treeFieldLengthValue"
                placeholder="字段存储长度,如30" :disabled="true"></el-input>
            </el-form-item>
            <el-select size="small" v-model="addFieldDataForm.treeDicId" @change="filedTreeChange"
              style="width:20%;padding-top: 5px" placeholder="请选择">
              <el-option v-for="selectItem in treeArrData" :key="selectItem.treeid" :label="selectItem.treems"
                :value="selectItem.treeid">
              </el-option>
            </el-select>
          </el-col>

          <el-col v-if="
            addFieldType == 'time' ||
            addFieldType == 'photo' ||
            addFieldType == 'audio' ||
            addFieldType == 'video' ||
            addFieldType == 'rich'
          " :span="20">
            <el-form-item :rules="filedNameRule" prop="otherFieldNameValue">
              <el-input size="small" style="width: 130px;font-size:12px" v-model="addFieldDataForm.otherFieldNameValue"
                placeholder="字段名,如NAME"></el-input>
            </el-form-item>
            <el-form-item :rules="filedCommentRule" prop="otherFieldCommentValue">
              <el-input size="small" style="width: 130px;font-size:12px"
                v-model="addFieldDataForm.otherFieldCommentValue" placeholder="字段描述,如名称"></el-input>
            </el-form-item>
          </el-col>

          <el-col v-if="addFieldType != ''" :span="4" style="padding-top: 5px">
            <el-button type="primary" size="small" @click="addField()">新增</el-button>
            <el-button type="danger" size="small" @click="cancleAddField()">取消</el-button>
          </el-col>
        </el-row>
      </el-form>

      <div align="center" style="padding-top: 30px">
        <el-button type="success" size="small" :disabled="addFlag" @click="add('word')">文字字段</el-button>
        <el-button type="success" size="small" :disabled="addFlag" @click="add('select')">下拉框字段</el-button>
        <el-button type="success" size="small" :disabled="addFlag" @click="add('tree')">树形字段</el-button>
        <el-button type="success" size="small" :disabled="addFlag" @click="add('time')">时间字段</el-button>

        <el-button type="success" size="small" :disabled="addFlag" @click="add('rich')">富文本字段</el-button>
        <el-button type="success" size="small" :disabled="addFlag" @click="add('photo')">图片字段</el-button>
        <el-button type="success" size="small" :disabled="addFlag" @click="add('audio')">音频字段</el-button>
        <el-button type="success" size="small" :disabled="addFlag" @click="add('video')">视频字段</el-button>
      </div>
    </div>

    <el-dialog title="图层字段修改" :visible.sync="fieldDialogVisible" :close-on-click-modal="false"
      ref="editFieldDialogVisibleRef" width="30%">
      <el-form :model="fieldDataForm" ref="fieldDataForm" label-width="100px">
        <el-form-item :rules="filedNameRule" v-if="
          currentField != null &&
          currentField.field_type != 'select' &&
          currentField.field_type != 'tree'
        " label="字段名" prop="field_name">
          <el-input v-model="fieldDataForm.field_name" placeholder="字段名"></el-input>
        </el-form-item>
        <el-form-item :rules="filedCommentRule" v-if="
          currentField != null &&
          currentField.field_type != 'select' &&
          currentField.field_type != 'tree'
        " label="字段描述" prop="field_dec">
          <el-input v-model="fieldDataForm.field_dec" placeholder="字段描述"></el-input>
        </el-form-item>
        <el-form-item :rules="filedLengthRule" v-if="
          fieldDataForm.field_length != null &&
          fieldDataForm.field_length != '' &&
          currentField != null &&
          currentField.field_type != 'time' &&
          currentField.field_type != 'select' &&
          currentField.field_type != 'tree'
        " label="字段长度" prop="field_length">
          <el-input v-model="fieldDataForm.field_length" placeholder="字段长度"></el-input>
        </el-form-item>

        <el-form-item label="显示级别" prop="field_length" v-if="
          currentField != null &&
          currentField.field_type != 'video' &&
          currentField.field_type != 'audio'
        ">
          <el-select v-model="fieldDataForm.show_flag" style="width:100%" placeholder="请选择">
            <el-option v-for="item in showFlagArr" :key="item" :label="item" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="closeFieldDialog">取 消</el-button>
        <el-button type="primary" @click="editGatherTaskField">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="确认框" :visible.sync="deleteFieldDialogVisible" :close-on-click-modal="false" width="30%">
      <span style="color:red">将要删除字段({{ deleteFieldName }}),数据将不可恢复！</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteGatherTaskFieldCancle">取 消</el-button>
        <el-button type="primary" @click="deleteGatherTaskField">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { commonSelectRequest, commonExcuteRequest } from "../common/request";
import { getListData } from "../common/tree";

export default {
  data() {
    return {
      //字段名称验证
      filedNameRule: [
        { required: true, message: "字段名称不能为空", trigger: "blur" },
        { validator: window.validateA_Z, trigger: "blur" }
      ],
      //字段描述验证
      filedCommentRule: [
        { required: true, message: "字段描述不能为空", trigger: "blur" }
      ],
      //字段长度验证
      filedLengthRule: [
        { required: true, message: "字段长度不能为空", trigger: "blur" },
        { validator: window.validateInteger, trigger: "blur" }
      ],

      gatherTaskTreeData: [],
      taskName: "未选中图层",
      taskDescription: "未选中图层",
      taskType: "",
      layerColor: "#0000ff",
      layerImg: "",
      editFlag: true,
      currentNode: null,
      currentNodeKey: 1, //初始选中图层树菜单

      gatherTaskFieldData: [],
      fieldDialogVisible: false,

      fieldDataForm: {
        field_name: "",
        field_dec: "",
        field_length: "",
        show_flag: ""
      },

      showFlagArr: [1, 2, 3],
      currentField: null,

      //删除字段弹窗
      deleteFieldDialogVisible: false,
      deleteFieldName: "",
      //添加字段
      addFieldDataForm: {
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
      },
      selectArrData: [], //新增下拉框字段的下拉框数据
      treeArrData: [], //新增树形字段的数据
      addFieldType: "",
      addFlag: false
    };
  },
  watch: {},
  mounted: function () {
    this.findGatherTaskTree();
  },
  methods: {
    //查找图层树
    findGatherTaskTree() {
      this.gatherTaskTreeData = [];
      var param = {};
      param.sql = "gather_task_tree.findGatherTaskTree";
      commonSelectRequest(param, this.findGatherTaskTreeCallBack);
    },
    findGatherTaskTreeCallBack(result) {
      this.gatherTaskTreeData = getListData(result);
      console.log("this.gatherTaskTreeData ", this.gatherTaskTreeData);
      this.$nextTick(() => {
        if (typeof this.$refs.layerTree != "undefined") {
          this.$refs.layerTree.setCurrentKey(this.currentNodeKey);
        }
      });
    },
    handleNodeClick(node, data) {
      console.log("node", node);
      this.addFlag = false;
      this.addFieldType = "";
      //图层详情
      this.currentNode = node;
      this.setDisabled();
      if (node.type == null) {
        this.taskName = "未选中图层";
        this.gatherTaskFieldData = [];
        this.taskDescription = "未选中图层";
        this.taskType = "";
        this.layerColor = "#0000ff";
        return;
      }
      this.taskName = node.label;
      this.taskDescription = node.description;
      this.taskType = node.type;
      if (node.type == "point") {
        this.layerimg = node.layerimg;
        this.layerColor = "";
        this.$refs.fileRef.style.background =
          "url(" + node.layerimg + ") no-repeat center center";
        this.$refs.fileRef.style.backgroundSize = "40px 40px";
      } else if (node.type == "polygon" || node.type == "polyline") {
        console.log("颜色图层");
        this.layerimg = "";
        this.layerColor = node.color;
      } else if (node.type == "none") {
        this.layerimg = "";
        this.layerColor = "";
      }
      //图层字段
      this.getLayerFieldDetail(node);
    },
    getLayerFieldDetail(node) {
      this.gatherTaskFieldData = [];
      var param = {};
      param.sql = "gather_task.findGatherLayerField";
      param.taskid = node.taskid;
      param.filter = "GATHER_";
      commonSelectRequest(param, this.getLayerFieldDetailCallBack);
    },
    getLayerFieldDetailCallBack(result) {
      //console.log("result",result);
      this.gatherTaskFieldData = result;
    },
    showEditGatherTaskFieldWin(row) {
      console.log(
        "showEditGatherTaskFieldWin--row:",
        row,
        this.gatherTaskFieldData
      );

      this.showFlagArr = [1, 2, 3];
      //如果已经存在标识为1，则选择框不能选1
      for (var i = 0; i < this.gatherTaskFieldData.length; i++) {
        if (this.gatherTaskFieldData[i].show_flag == "1") {
          this.showFlagArr = [2, 3];
        }
      }

      if (
        row.field_type == "rich" ||
        row.field_type == "photo" ||
        row.field_type == "audio" ||
        row.field_type == "video"
      ) {
        this.fieldDataForm.field_length = null;
      } else {
        this.fieldDataForm.field_length = row.field_length;
      }

      this.currentField = row;
      this.fieldDialogVisible = true;
      this.fieldDataForm.field_name = row.field_name;
      this.fieldDataForm.field_dec = row.field_dec;
      this.fieldDataForm.show_flag = row.show_flag;
    },
    editGatherTaskField() {
      var param = {};
      param.sql = "gather_task.updateGatherTaskField";
      param.id = this.currentField.id;
      param.table_name = this.currentField.table_name;
      param.old_field_name = this.currentField.field_name;
      param.field_name = this.fieldDataForm.field_name;
      param.field_dec = this.fieldDataForm.field_dec;
      param.show_flag = this.fieldDataForm.show_flag;
      param.field_type = this.currentField.field_type;
      if (
        param.field_type != "rich" &&
        param.field_type != "photo" &&
        param.field_type != "audio" &&
        param.field_type != "video"
      ) {
        param.field_length = this.fieldDataForm.field_length;
      }
      console.log("param:", param);
      this.$refs.fieldDataForm.validate(valid => {
        if (valid == true) {
          commonExcuteRequest(param, this.editGatherTaskFieldCallBack);
        }
      });
    },
    editGatherTaskFieldCallBack(result) {
      if (typeof result == "string") {
        if (result.indexOf("Duplicate column name") > 0) {
          this.$message.error("存在相同的字段名");
          return;
        }
      }
      this.$message({ message: "图层字段修改成功！", type: "success" });
      this.fieldDialogVisible = false;
      this.getLayerFieldDetail(this.currentNode);
    },

    closeFieldDialog() {
      this.fieldDialogVisible = false;
    },
    //删除图层字段字段-start
    showDeleteGatherTaskFieldWin(row) {
      this.currentField = row;
      this.deleteFieldDialogVisible = true;
      this.deleteFieldName = row.field_name;
    },
    deleteGatherTaskFieldCancle() {
      this.deleteFieldDialogVisible = false;
    },
    deleteGatherTaskField() {
      var param = {};
      param.sql = "gather_task.deleteField";
      param.id = this.currentField.id;
      param.table_name = this.currentField.table_name;
      param.field_name = this.currentField.field_name;
      commonExcuteRequest(param, this.deleteGatherTaskFieldCallBack);
    },
    deleteGatherTaskFieldCallBack(result) {
      this.$message({ message: "图层字段删除成功！", type: "success" });
      this.deleteFieldDialogVisible = false;
      this.getLayerFieldDetail(this.currentNode);
    },
    //删除图层字段字段-end

    //新增图层字段-start
    add(type) {
      if (this.currentNode == null || this.currentNode.type == null) {
        this.$message.error("当前选中并不是图层，不可新增字段！");
        return;
      }

      //属性置空
      var addFieldDataFormKeys = Object.keys(this.addFieldDataForm);
      for (var i = 0; i < addFieldDataFormKeys.length; i++) {
        this.addFieldDataForm[addFieldDataFormKeys[i]] = "";
      }

      this.addFlag = true;
      if (type == "word") {
        this.addFieldType = type;
      } else if (type == "select") {
        this.findAllSelectDic();
        this.addFieldType = type;
      } else if (type == "tree") {
        this.findAllTreeDic();
        this.addFieldType = type;
      } else if (type == "time") {
        this.addFieldType = type;
      } else {
        this.addFieldType = type;
      }
    },
    addField() {
      //console.log("新增字段：",this.currentNode);
      var param = {};
      param.sql = "gather_task.insertField";
      param.table_name = this.currentNode.tablename;
      param.field_type = this.addFieldType;
      param.show_flag = "3";
      param.taskid = this.currentNode.taskid;
      if (this.addFieldType == "word") {
        param.field_name = this.addFieldDataForm.wordFieldNameValue;
        param.field_dec = this.addFieldDataForm.wordFieldCommentValue;
        param.field_length = this.addFieldDataForm.wordFieldLengthValue;
        param.dicid = "";
      } else if (this.addFieldType == "select") {
        param.field_name = this.addFieldDataForm.selectFieldNameValue;
        param.field_dec = this.addFieldDataForm.selectFieldCommentValue;
        param.field_length = this.addFieldDataForm.selectFieldLengthValue;
        param.dicid = this.addFieldDataForm.selectDicId;
      } else if (this.addFieldType == "tree") {
        param.field_name = this.addFieldDataForm.treeFieldNameValue;
        param.field_dec = this.addFieldDataForm.treeFieldCommentValue;
        param.field_length = this.addFieldDataForm.treeFieldLengthValue;
        param.dicid = this.addFieldDataForm.treeDicId;
      } else if (this.addFieldType == "time") {
        param.field_name = this.addFieldDataForm.otherFieldNameValue;
        param.field_dec = this.addFieldDataForm.otherFieldCommentValue;
        param.field_length = 50;
        param.dicid = "";
      } else if (
        this.addFieldType == "photo" ||
        this.addFieldType == "audio" ||
        this.addFieldType == "video" ||
        this.addFieldType == "rich"
      ) {
        param.field_name = this.addFieldDataForm.otherFieldNameValue;
        param.field_dec = this.addFieldDataForm.otherFieldCommentValue;
        param.field_length = "";
        param.dicid = "";
      }
      console.log("param", param);
      this.$refs.addFieldDataForm.validate(valid => {
        if (valid == true) {
          commonExcuteRequest(param, this.addFieldCallBack);
        }
      });
    },
    addFieldCallBack(result) {
      console.log("类型：", typeof result);
      if (typeof result == "string") {
        if (result.indexOf("Duplicate column name") > 0) {
          this.$message.error("存在相同的字段名");
          return;
        }
      }

      this.$message({ message: "新增图层字段成功！", type: "success" });
      //新增字段按钮可点击
      this.addFlag = false;
      //隐藏新增字段的输入框
      this.addFieldType = "";
      this.getLayerFieldDetail(this.currentNode);
    },
    cancleAddField() {
      //新增字段按钮可点击
      this.addFlag = false;
      //隐藏新增字段的输入框
      this.addFieldType = "";
    },
    //查询所有树形字典
    findAllTreeDic() {
      var param = {};
      param.sql = "gather_tree_dic.find_tree_dic";
      commonSelectRequest(param, this.findAllTreeDicCallBack);
    },
    findAllTreeDicCallBack(result) {
      this.treeArrData = result;
    },
    filedTreeChange(data) {
      console.log("选择值：", this.treeArrData, data);
      for (var i = 0; i < this.treeArrData.length; i++) {
        if (this.treeArrData[i].treeid == data) {
          this.addFieldDataForm.treeFieldNameValue = this.treeArrData[
            i
          ].treename;
          this.addFieldDataForm.treeFieldCommentValue = this.treeArrData[
            i
          ].treems;
          this.addFieldDataForm.treeFieldLengthValue = this.treeArrData[
            i
          ].treelength;
          this.addFieldDataForm.treeDicId = this.treeArrData[i].treeid;
        }
      }
    },

    //查询所有下拉框字典
    findAllSelectDic() {
      var param = {};
      param.sql = "gather_select_dic.find_select_dic";
      commonSelectRequest(param, this.findAllSelectDicCallBack);
    },
    findAllSelectDicCallBack(result) {
      console.log("所有字段：", result);
      this.selectArrData = result;
    },
    filedSelectChange(data) {
      console.log("选择值：", this.selectArrData, data);
      for (var i = 0; i < this.selectArrData.length; i++) {
        if (this.selectArrData[i].dicid == data) {
          this.addFieldDataForm.selectFieldNameValue = this.selectArrData[
            i
          ].dicname;
          this.addFieldDataForm.selectFieldCommentValue = this.selectArrData[
            i
          ].dicms;
          this.addFieldDataForm.selectFieldLengthValue = this.selectArrData[
            i
          ].diclength;
          this.addFieldDataForm.selectDicId = this.selectArrData[i].dicid;
        }
      }
    },
    //新增图层字段-end

    editTaskDetail() {
      if (this.currentNode == null || this.currentNode.type == null) {
        this.$message.error("当前选中并不是图层，不可进入编辑状态！");
        return;
      }
      this.setAbled();
    },
    saveTaskDetail() {
      var param = {};
      param.name = this.taskName;
      param.description = this.taskDescription;
      param.layerimg = this.layerimg;
      param.color = this.layerColor;
      param.id = this.currentNode.taskid;
      param.sql = "gather_task.updateGatherTask";
      console.log("param", param);
      commonExcuteRequest(param, this.saveTaskDetailCallBack);
    },
    saveTaskDetailCallBack(result) {
      this.$message({ message: "图层详情修改成功！", type: "success" });
      this.setDisabled();
      this.findGatherTaskTree();
    },
    choosePhoto(photoObj) {
      var the = this;
      var oFReader = new FileReader();
      var file = photoObj.path[0].files[0];
      oFReader.readAsDataURL(file);
      oFReader.onloadend = function (oFRevent) {
        var src = oFRevent.target.result;
        the.layerimg = src;
        photoObj.path[1].style.background =
          "url(" + src + ") no-repeat center center";
        photoObj.path[1].style.backgroundSize = "40px 40px";
      };
      console.log(file);
    },
    //设置输入框可编辑
    setAbled() {
      this.$refs.layerImgRef.removeAttribute("disabled");
      this.editFlag = false;
    },
    //设置输入框不可编辑
    setDisabled() {
      this.$refs.layerImgRef.setAttribute("disabled", "disabled");
      this.editFlag = true;
    }
  }
};
</script>

<style scoped>
.filediv {
  width: 40px;
  height: 40px;
  background-size: 40px 40px;
  display: inline-block;
  cursor: pointer;
  border: 1px solid #fff6f7;
}

.filediv input {
  cursor: pointer;
  width: 100%;
  height: 100%;
  opacity: 0;
}

/**
在vue3.0之前可使用，例如(复写样式前加/deep/)，vue3.0及后使用就会报错
/deep/ .el-input {
    width: 60px;
}
在vue3.0及后使用::v-deep，替代/deep/
::v-deep .el-input {
    width: 60px;
}
 */
/deep/ .el-color-picker__mask {
  background-color: rgba(255, 255, 255, 0);
}
</style>
