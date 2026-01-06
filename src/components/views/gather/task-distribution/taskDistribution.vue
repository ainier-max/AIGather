<template>
  <div style="height: 100%;overflow:hidden">
    <div class="titleClass">任务分配</div>
    <div style="margin:40px 50px;width: 25%;float: left;height: 100%;">
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
      </span>
      </el-tree>

    </div>

    <div style="margin:40px 50px;width: 58%;float: right;height: 80%;padding-right:20px;overflow-y: auto">
      <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">授权人员</span>
      </el-divider>

      <el-table
        :data="distributionUserData"
        stripe
        style="width: 100%">
        <el-table-column
          prop="USERID"
          label="用户ID">
        </el-table-column>

        <el-table-column
          prop="USERNAME"
          label="用户名"
          width="180">
        </el-table-column>

        <el-table-column
          prop="PHONE"
          label="电话">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="150">
          <template slot-scope="scope">
            <i class="el-icon-delete" style="color:red;cursor:pointer"
               @click="deleteTaskDistribution(scope.row)"></i>
          </template>
        </el-table-column>
      </el-table>

      <div align="center" style="padding-top: 20px">
        <el-button type="warning" @click="showAddTaskDistributionWin()">新增授权人员</el-button>
      </div>

    </div>

    <el-dialog
      title="未被授权用户"
      :visible.sync="allUserDialogVisible"
      :close-on-click-modal="false"
      ref="allUserDialogVisibleRef"
      width="30%">

      <el-table
        :data="allUserData"
        stripe
        style="width: 100%">
        <el-table-column
          prop="USERID"
          label="用户ID">
        </el-table-column>
        <el-table-column
          prop="USERNAME"
          label="用户名"
          width="250">
        </el-table-column>
        <el-table-column
          fixed="right"
          label="操作"
          width="100">
          <template slot-scope="scope">
            <i class="el-icon-plus" style="color:blue;cursor:pointer"
               @click="gatherTaskDistribution(scope.row)"></i>
          </template>
        </el-table-column>

      </el-table>
    </el-dialog>


  </div>
</template>

<script>
import {commonSelectRequest, commonExcuteRequest} from "../common/request"
import {getListData} from "../common/tree"

export default {
  data() {
    return {
      distributionUserData:[],
      allUserData:[],
      gatherTaskTreeData: [],
      currentNode: null,
      currentNodeKey: 1,//初始选中图层树菜单

      allUserDialogVisible:false,

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
        if (typeof (this.$refs.layerTree) != "undefined") {
          this.$refs.layerTree.setCurrentKey(this.currentNodeKey);
        }
      })
    },
    handleNodeClick(node, data) {
      console.log("node", node);
      this.currentNode=node;
      this.findGatherTaskUser();
    },
    findGatherTaskUser(){
      var param = {};
      param.sql = "gather_task_user.find";
      param.taskid = this.currentNode.taskid;
      commonSelectRequest(param, this.findGatherTaskUserCallBack);
    },


    findGatherTaskUserCallBack(result){
      this.distributionUserData=result;
    },

    //删除任务授权
    deleteTaskDistribution(row){
      console.log("row",row);
      var param={};
      param.sql="gather_task_user.delete";
      param.userid=row.USERID;
      param.taskid=this.currentNode.taskid;
      console.log("param:",param);
      commonExcuteRequest(param, this.deleteTaskDistributionCallBack);
    },
    deleteTaskDistributionCallBack(result){
      this.$message({message: '授权删除成功！', type: 'success'});
      this.findGatherTaskUser();
    },

    //新增任务授权
    showAddTaskDistributionWin(){
      if (this.currentNode == null || this.currentNode.type == null) {
        this.$message.error('当前选中并不是图层，不可进行授权！');
        return;
      }
      this.findNotExistUser();
    },
    findNotExistUser() {
      var param = {};
      param.sql = "gather_task_user.findNotExist";
      param.taskid = this.currentNode.taskid;
      commonSelectRequest(param, this.findNotExistUserCallBack);
    },
    findNotExistUserCallBack(result){
      this.allUserData=result;
      this.allUserDialogVisible=true;
    },
    gatherTaskDistribution(row){
      console.log("row",row);
      var param={};
      param.sql="gather_task_user.insert";
      param.userid=row.USERID;
      param.taskid=this.currentNode.taskid;
      console.log("param:",param);
      commonExcuteRequest(param, this.gatherTaskDistributionCallBack);
    },

    gatherTaskDistributionCallBack(result){
      this.$message({message: '授权成功！', type: 'success'});
      this.allUserDialogVisible=false;
      this.findGatherTaskUser();
    },


  },
}
</script>

<style scoped>
.titleClass {
  padding: 8px 16px;
  background-color: #fff6f7;
  border-radius: 4px;
  border-left: 5px solid #fe6c6f;
  margin: 10px 0;
  line-height: 40px;
}
</style>
