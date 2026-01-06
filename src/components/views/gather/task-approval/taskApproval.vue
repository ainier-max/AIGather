<template>
  <div style="height: 100%;">
    <div class="titleClass">任务审批</div>
    <div style="margin:40px 50px">
      <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">待审批任务</span>
      </el-divider>
      <el-collapse v-if="gatherTasks.length>0" v-model="activeNames" @change="handleChange">
        <el-collapse-item v-for="(item,index) in gatherTasks" :key="index" :title="item.name" :name="index"
                          style="background-color: #fff6f7;">
          <el-form label-width="80px"
                   style="padding-top:10px;border-left: 1px solid #EBEEF5;border-right: 1px solid #EBEEF5;">
            <el-form-item label="任务描述">
              <el-input v-model="item.description" :disabled="true"></el-input>
            </el-form-item>
            <el-row>
              <el-col :span="6">
                <el-form-item label="任务表名">
                  <el-input v-model="item.table_name" :disabled="true"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="采集类型">
                  <el-input v-model="item.type" :disabled="true"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="申请用户">
                  <el-input v-model="item.username" :disabled="true"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item v-if="item.type=='point'" label="图层图标">
                  <img style="width: 50px;height: 50px" :src="item.layerimg">
                </el-form-item>
                <el-form-item v-if="item.type=='polyline' || item.type=='polygon'" label="图层颜色">
                  <input type="color" :disabled="true" style="width:80px;height:40px" v-model="item.color">
                </el-form-item>
              </el-col>
            </el-row>

            <div align="center">
              <el-button type="primary" @click="taskApproval(item)">授权</el-button>
              <el-button type="danger" @click="taskRefuse(item.id)">否决</el-button>
            </div>
            <div align="center">
              <span style="color:red">*授权后，数据库将会创建含以下字段的数据表</span>
            </div>

            <el-table
              :data="item.minGatherTaskFields"
              height="250"
              border
              style="width: 100%">
              <el-table-column
                prop="table_name"
                label="表名">
              </el-table-column>
              <el-table-column
                prop="field_name"
                label="字段名">
              </el-table-column>
              <el-table-column
                prop="field_dec"
                label="字段描述">
              </el-table-column>
              <el-table-column
                prop="field_length"
                label="字段长度">
              </el-table-column>
              <el-table-column
                prop="field_type"
                label="字段类型">
              </el-table-column>
            </el-table>
          </el-form>

        </el-collapse-item>
      </el-collapse>

      <div v-if="gatherTasks.length==0" style="color:green">没有要审批的任务</div>
    </div>
  </div>
</template>

<script>

import {commonSelectRequest, commonExcuteRequest} from "../common/request"

export default {
  data() {
    return {
      gatherTasks: [],
      activeNames: []
    };
  },
  watch: {},
  mounted: function () {
    this.findGatherTask();
  },
  methods: {
    handleChange(val) {
      //console.log(val);
    },
    findGatherTask() {
      var param = {};
      param.sql = "gather_task.findGatherTask";
      param.flag = "0";
      commonSelectRequest(param, this.findGatherTaskCallBack);
    },
    findGatherTaskCallBack(result){
      this.gatherTasks = result;
      if (this.gatherTasks.length > 0) {
        this.findGatherLayerFieldNotApproval();
      }
    },
    //查询申请采集任务未被授权中的所有字段
    findGatherLayerFieldNotApproval() {
      var param = {};
      param.sql = "gather_task.findGatherLayerField";
      param.approvalFlag = false;
      commonSelectRequest(param, this.findGatherLayerFieldNotApprovalCallBack);
    },
    findGatherLayerFieldNotApprovalCallBack(result) {
      var gatherTaskFields = result;
      for (var i = 0; i < this.gatherTasks.length; i++) {
        this.gatherTasks[i].gatherTaskFields = [];
        this.gatherTasks[i].minGatherTaskFields = [];
        for (var j = 0; j < gatherTaskFields.length; j++) {
          if (this.gatherTasks[i].id == gatherTaskFields[j].taskid) {
            this.gatherTasks[i].gatherTaskFields.push(gatherTaskFields[j]);
            if (gatherTaskFields[j].field_name.indexOf("GATHER_") < 0) {
              this.gatherTasks[i].minGatherTaskFields.push(gatherTaskFields[j]);
            }
          }
        }
        console.log("the.gatherTasks:", this.gatherTasks);
        //重新绑定，刷新页面
        var temp = JSON.parse(JSON.stringify(this.gatherTasks));
        cbcVue.set(this, 'gatherTasks', temp);
      }
    },
    //任务授权
    taskApproval(obj) {
      var fields = [];
      for (var i = 0; i < obj.gatherTaskFields.length; i++) {
        var field_json = {};
        field_json.field_name = obj.gatherTaskFields[i].field_name;
        field_json.field_dec = obj.gatherTaskFields[i].field_dec;
        field_json.field_length = obj.gatherTaskFields[i].field_length;
        field_json.field_type = obj.gatherTaskFields[i].field_type;
        fields.push(field_json);
      }
      var param = {};
      param.sql = "gather_task.createTable";
      param.table_name = obj.table_name;
      param.fields = fields;
      commonExcuteRequest(param, this.taskApprovalCallBack);
    },
    taskApprovalCallBack(result){
      console.log("result:",result);
      this.$message.success('任务授权成功！');
      this.findGatherTask();
      this.activeNames = [];

    },
    //任务否决
    taskRefuse(id) {
      var param = {};
      param.sql = "gather_task.refuseGatherTask";
      param.id = id;
      commonExcuteRequest(param, this.taskRefuseCallBack);
    },
    taskRefuseCallBack(result){
      this.$message.success('任务否决成功！');
      this.findGatherTask();
      this.activeNames = [];
    }

  },
}
</script>

<style>
.titleClass {
  padding: 8px 16px;
  background-color: #fff6f7;
  border-radius: 4px;
  border-left: 5px solid #fe6c6f;
  margin: 10px 0;
  line-height: 40px;
}

.el-collapse-item__header {
  background-color: #E6E6FA;
  border-left: 1px solid #EBEEF5;
  padding-left: 10px;
}


</style>
