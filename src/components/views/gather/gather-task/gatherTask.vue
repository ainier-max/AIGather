<template>
  <div style="height: 100%;overflow:hidden">
    <div class="titleClass">任务采集</div>

    <div  style="margin:40px 50px;height: 98%;width: 100%">
      <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">被授权的采集任务</span>
      </el-divider>
      <el-table
        :data="gatherTaskData"
        border
        style="width: 60%;margin-left: 15%">
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
          width="180">
        </el-table-column>
        <el-table-column
          prop="type"
          label="类型"
          width="120">
        </el-table-column>

        <el-table-column
          fixed="right"
          label="操作"
          width="120">
          <template slot-scope="scope">
            <el-button size="small" type="primary" @click="gather(scope.row)">开始采集</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

  </div>
</template>

<script>
import {commonSelectRequest, commonExcuteRequest} from "../common/request"

export default {
  data() {
    return {
      gatherTaskData: [],

    };
  },
  watch: {},
  mounted: function () {
    this.findGatherTask();
  },
  methods: {
    //查找所有采集任务
    findGatherTask() {
      var param = {};
      param.sql = "gather_task_user.findTaskDistribution";
      param.userid = window.localStorage.getItem('loginUserid');
      commonSelectRequest(param, this.findGatherTaskCallBack);
    },
    findGatherTaskCallBack(result) {
      console.log("result",result);
      this.gatherTaskData = result;
    },

    gather(row){
      console.log("row:",row);
      this.$router.push({path:'/gather/gatherPage',query:{taskid:row.taskid,type:row.type}})
    }

  },
}
</script>

<style lang="scss" scoped>

</style>
