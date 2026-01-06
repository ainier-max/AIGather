<template>
  <div style="height: 100%;overflow:hidden">
    <div class="titleClass">任务调配</div>

    <div style="margin:40px 50px;width: 45%;float: left;height: 98%;">
      <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">采集任务</span>
      </el-divider>
      <div style="color:red;padding-bottom: 10px">
        <span>注：点击</span>
        <i class="el-icon-upload2"
           style="color:cornflowerblue;cursor:pointer;padding-left:10px;padding-right: 10px;"></i>
        <span>可将采集任务放置右边的图层树中</span>
      </div>
      <el-table
        :data="gatherTaskData"
        border
        height="70%"
        style="width: 100%;">
        <el-table-column
          prop="cjsj"
          label="创建日期"
          width="100">
        </el-table-column>
        <el-table-column
          prop="name"
          label="任务名">
        </el-table-column>
        <el-table-column
          prop="table_name"
          label="表名"
          width="150">
        </el-table-column>
        <el-table-column
          prop="type"
          label="类型"
          width="100">
        </el-table-column>

        <el-table-column
          fixed="right"
          label="操作"
          width="80">
          <template slot-scope="scope">
            <i class="el-icon-upload2" style="color:cornflowerblue;cursor:pointer;padding-left:10px;padding-right: 10px"
               @click="taskDeploy(scope.row)"></i>

            <i class="el-icon-delete" style="color:red;cursor:pointer"
               @click="showDeleteGatherTaskWin(scope.row)"></i>
          </template>
        </el-table-column>
      </el-table>
    </div>


    <div style="margin:40px 50px;width: 35%;float: right;height: 100%;">
      <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">图层树</span>
      </el-divider>

      <el-tree
        ref="layerTree"
        :data="gatherTaskTreeData"
        @node-click="handleNodeClick"
        node-key="id"
        class="down-tree"
        default-expand-all
        :highlight-current="true"
        :expand-on-click-node="false">
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span v-if="data.taskid==null"><i class="el-icon-folder"></i>{{ node.label }}</span>
        <span v-if="data.taskid!=null">
          <i v-if="data.type.includes('polyline')" :style="data.colorStyle" class="el-icon-share"></i>
          <i v-if="data.type.includes('polygon')" :style="data.colorStyle" class="el-icon-house"></i>
          <i v-if="data.type.includes('absence')" class="el-icon-tickets"></i>
          <el-image v-if="data.type.includes('point')" style="width: 14px;height: 14px" :src="data.layerimg"></el-image>
          {{ node.label }}
        </span>
        <span>
          <i v-if="data.taskid==null"
             type="text"
             size="mini"
             style="color: blueviolet"
             @click="() => append(data)" class="el-icon-circle-plus-outline"></i>
          <i v-if="data.taskid==null"
             type="text"
             size="mini"
             style="color: blueviolet"
             @click="() => edit(data)" class="el-icon-edit"></i>
          <i type="text"
             size="mini"
             style="color: blueviolet"
             @click="() => remove(node, data)" class="el-icon-delete"></i>
        </span>
      </span>
      </el-tree>

    </div>

    <el-dialog
      :title="treeDialogTitle"
      :visible.sync="dialogVisible"
      :close-on-click-modal="false"
      ref="upholdDialogRef"
      width="30%"
      :before-close="handleClose">
      <el-form :model="treeDicDataForm" :rules="treeDicrules" ref="treeDicDataForm" label-width="100px">
        <el-form-item label="树节点标签" prop="treems">
          <el-input v-model="treeDicDataForm.treems" placeholder="树节点标签"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancle">取 消</el-button>
        <el-button v-if="editFlag==0" type="primary" @click="addTreeDicData">确 定</el-button>
        <el-button v-if="editFlag==1" type="primary" @click="editTreeDicData">确 定</el-button>
      </span>
    </el-dialog>


    <el-dialog
      title="确认框"
      :visible.sync="deleteTreeDataDialogVisible"
      :close-on-click-modal="false"
      width="30%"
      :before-close="handleClose">
      <span style="color:red">将要删除( {{ currentTreeLabel }} )与其所属的所有选项？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteTreeDataCancle">取 消</el-button>
        <el-button type="primary" @click="deleteTreeData">确 定</el-button>
      </span>
    </el-dialog>


    <el-dialog
      title="确认框"
      :visible.sync="deleteGatherTaskDialogVisible"
      :close-on-click-modal="false"
      width="30%">
      将要删除<span style="color:red;font-weight: bold">({{opGatherTask.name}})</span>采集任务
      <br></br>该操作也会把图层树中的对应图层删除，数据不可恢复，请小心操作。
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteGatherTaskCancle">取 消</el-button>
        <el-button type="primary" @click="deleteGatherTask">确 定</el-button>
      </span>
    </el-dialog>


  </div>
</template>

<script>
import {commonSelectRequest, commonExcuteRequest} from "../common/request"
import {getListData} from "../common/tree"

export default {
  data() {
    return {
      gatherTaskData: [],
      gatherTaskTreeData: [],
      treeDialogTitle: '树节点维护',
      dialogVisible: false,
      treeDicDataForm: {
        treems: '',
      },
      treeDicrules: {
        treems: [
          {required: true, message: '树节点标签不能为空', trigger: 'blur'}
        ],
      },
      editFlag: 0,
      opTreeData: null,
      deleteTreeDataDialogVisible: false,
      currentTreeLabel: '',
      deleteIDS: [],
      currentNodeKey: 1,//初始选中图层树菜单
      deleteGatherTaskDialogVisible: false,
      opGatherTask:{},
      opGatherTaskCount:0
    };
  },
  watch: {},
  mounted: function () {
    this.findGatherTask();
    this.findGatherTaskTree();
  },
  methods: {
    //查找所有采集任务
    findGatherTask() {
      var param = {};
      param.sql = "gather_task.findGatherTask";
      param.flag = "1";
      commonSelectRequest(param, this.findGatherTaskCallBack);
    },
    findGatherTaskCallBack(result) {
      this.gatherTaskData = result;
    },
    //查找图层树
    findGatherTaskTree() {
      this.gatherTaskTreeData = [];
      var param = {};
      param.sql = "gather_task_tree.findGatherTaskTree";
      commonSelectRequest(param, this.findGatherTaskTreeCallBack);
    },
    findGatherTaskTreeCallBack(result) {
      this.gatherTaskTreeData = getListData(result);
      this.$nextTick(() => {
        if (typeof (this.$refs.layerTree) != "undefined") {
          this.$refs.layerTree.setCurrentKey(this.currentNodeKey);
        }
      })
    },
    //调配
    taskDeploy(obj) {
      console.log("obj", obj);
      //获取当前选中树菜单
      var node = this.$refs.layerTree.getCurrentNode();
      console.log("node", node);
      if (node == null) {
        this.$message.error('未选中图层树菜单！');
        return;
      }
      if (node.taskid != null) {
        this.$message.error('图层不能添加到图层！');
        return;
      }
      if (node.children.length > 0) {
        for (var i = 0; i < node.children.length; i++) {
          if (obj.id == node.children[i].taskid) {
            this.$message.error('同一个目录下不能存在两个相同图层！');
            return;
          }
        }
      }
      var param = {};
      param.name = obj.name;
      param.pid = node.id;
      param.taskid = obj.id;
      param.table_name = obj.table_name;
      param.sql = "gather_task_tree.addGatherTaskTreeLayer";
      commonSelectRequest(param, this.taskDeployCallBack);
    },
    taskDeployCallBack(result) {
      this.$message({message: '成功添加图层！', type: 'success'});
      this.findGatherTaskTree(this.currentNodeKey);
    },
    append(data) {
      this.dialogVisible = true;
      this.treeDialogTitle = "新增树节点";
      this.editFlag = 0;
      this.opTreeData = data;
    },
    addTreeDicData() {
      this.$refs.treeDicDataForm.validate((valid) => {
        if (valid) {
          //表单验证后执行
          var param = {};
          param.name = this.treeDicDataForm.treems;
          param.pid = this.opTreeData.id;
          param.sql = "gather_task_tree.addGatherTaskTree";
          commonExcuteRequest(param, this.addTreeDicDataCallBack);
        } else {
          return false;
        }
      });
    },
    addTreeDicDataCallBack(result) {
      this.$message({message: '成功增加树菜单！', type: 'success'});
      this.treeDicDataForm.treems = '';
      this.findGatherTaskTree();
      this.dialogVisible = false;
    },
    edit(data) {
      if (data.id == '1') {
        this.$message.error('该图层禁止修改');
        return;
      }
      this.treeDicDataForm.treems = data.label;
      this.dialogVisible = true;
      this.treeDialogTitle = "修改树节点";
      this.editFlag = 1;
      this.opTreeData = data;
    },
    editTreeDicData() {
      this.$refs.treeDicDataForm.validate((valid) => {
        if (valid) {
          //表单验证后执行
          var param = {};
          param.name = this.treeDicDataForm.treems;
          param.id = this.opTreeData.id;
          param.sql = "gather_task_tree.updateGatherTaskTree";
          commonExcuteRequest(param, this.editTreeDicDataCallBack);
        } else {
          return false;
        }
      });
    },
    editTreeDicDataCallBack(result) {
      this.$message({message: '成功修改树菜单！', type: 'success'});
      this.treeDicDataForm.treems = '';
      this.findGatherTaskTree();
      this.dialogVisible = false;
    },
    remove(node, data) {
      if (data.id == '1') {
        this.$message.error('该图层禁止删除');
        return;
      }
      this.deleteIDS = [];
      this.deleteTreeDataDialogVisible = true;
      this.opTreeData = data;
      this.currentTreeLabel = data.label;
    },
    deleteTreeData() {
      var the = this;
      this.getDeleteIDS(this.opTreeData);
      //表单验证后执行
      var param = {};
      param.ids = this.deleteIDS;
      param.sql = "gather_task_tree.deleteGatherTaskTree";
      commonExcuteRequest(param, this.deleteTreeDataCallBack);
    },
    deleteTreeDataCallBack(result) {
      this.currentNodeKey = 1;
      this.$message({message: '成功删除图层树数据！', type: 'success'});
      this.findGatherTaskTree();
      this.deleteTreeDataDialogVisible = false;
    },
    //遍历获取ids
    getDeleteIDS(data) {
      this.deleteIDS.push(data.id);
      if (data.children.length != 0) {
        for (var i = 0; i < data.children.length; i++) {
          this.getDeleteIDS(data.children[i]);
        }
      }
    },
    deleteTreeDataCancle() {
      this.deleteTreeDataDialogVisible = false;
    },
    handleClose(done) {
      var the = this;
      this.$confirm('确认关闭？')
        .then(_ => {
          the.treeDicDataForm.treems = '';
          done();
        })
        .catch(_ => {
        });
    },
    handleCancle() {
      this.dialogVisible = false;
      this.treeDicDataForm.treems = "";
    },

    handleNodeClick(node, data) {
      console.log("node", node);
      this.currentNodeKey = node.id;
      console.log("当前选中树节点", this.currentNodeKey);
    },

    showDeleteGatherTaskWin(row) {
      console.log("row",row);
      this.opGatherTask=row;
      var param = {};
      param.sql = "gather_task.gatherTaskCount";
      param.table_name=this.opGatherTask.table_name;
      commonSelectRequest(param, this.gatherTaskCountCallBack);
    },
    gatherTaskCountCallBack(result){
      this.opGatherTaskCount=result[0].SUM_COUNT;
      //console.log("this.opGatherTaskCount:",this.opGatherTaskCount);
      this.deleteGatherTaskDialogVisible = true;
    },
    deleteGatherTaskCancle() {
      this.deleteGatherTaskDialogVisible = false;
    },
    deleteGatherTask() {
      if(this.opGatherTaskCount>0){
        this.$message.error("该采集任务在数据里存在数据，不可删除！请手动清空数据在进行删除！");
        this.deleteGatherTaskDialogVisible = false;
        return;
      }else{
        var param = {};
        param.sql = "gather_task.deleteGatherTask";
        param.table_name=this.opGatherTask.table_name;
        param.id=this.opGatherTask.id;
        console.log("param:",param);
        commonExcuteRequest(param, this.deleteGatherTaskCallBack);
      }
    },
    deleteGatherTaskCallBack(result){
      this.$message({message: '成功删除采集任务！', type: 'success'});
      this.deleteGatherTaskDialogVisible = false;
      this.findGatherTask();
      this.findGatherTaskTree();
    }

  },
}
</script>

<style lang="scss" scoped>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.down-tree {
  padding-right: 20px;
  height: 70%;
  display: block;
  overflow-y: auto;
}
</style>
