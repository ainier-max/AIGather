<template>
  <div style="height: 100%;">
    <div class="titleClass">下拉框字典</div>
    <div style="margin:40px 50px">
      <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">创建下拉框字典</span>
      </el-divider>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px">
        <el-form-item label="字段名" prop="dicname">
          <el-input v-model="ruleForm.dicname" placeholder="请输入下拉框字典字段名（如：COLOR）*数据库表的字段名"></el-input>
        </el-form-item>
        <el-form-item label="字段描述" prop="dicms">
          <el-input v-model="ruleForm.dicms" placeholder="请输入下拉框字典字段名称（如：颜色）"></el-input>
        </el-form-item>
        <el-form-item label="字段长度" prop="diclength">
          <el-input v-model="ruleForm.diclength" placeholder="请输入下拉框字典字段名称长度（如：30）"></el-input>
        </el-form-item>
      </el-form>
      <div align="center">
        <el-button type="primary" @click="onSubmit">创建下拉框字典</el-button>
      </div>

      <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">下拉框字典选项维护</span>
      </el-divider>

      <el-select v-model="currentDicid" style="width:100%" placeholder="请选择">
        <el-option
          v-for="item in dics"
          :key="item.dicid"
          :label="item.dicms"
          :value="item.dicid">
        </el-option>
      </el-select>

      <select multiple="multiple" v-model="currentDicDataids" size="5"
              style="margin-top:30px;text-align:center;font-size:16px;width:100%;">
        <option :value="item.dicdataid" v-for="item in dicdatas">{{item.dicdataname}}</option>
      </select>

      <div align="center" style="padding-top: 20px">
        <el-button type="primary" @click="showSelectDicDataWin">添加选项</el-button>
        <el-button type="danger" @click="deleteDicData">删除选项</el-button>
        <el-button type="danger" @click="deleteDicWin">删除下拉框字典</el-button>
      </div>
    </div>

    <el-dialog
      title="添加选项"
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose">
      <el-form :model="selectDicDataForm" :rules="selectDicrules" ref="selectDicDataForm" label-width="100px">
        <el-form-item label="选项内容" prop="dicdataname">
          <el-input v-model="selectDicDataForm.dicdataname" placeholder="请输入选项内容"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="cancle">取 消</el-button>
        <el-button type="primary" @click="addSelectDicData">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="确认框"
      :visible.sync="deleteDicDialogVisible"
      width="30%"
      :before-close="handleClose">
      <span style="color:red">将要删除该字典与其所属的所有选项？</span>

      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteDicCancle">取 消</el-button>
        <el-button type="primary" @click="deleteDic">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>

    export default {
        data() {
            return {
                ruleForm: {
                    dicname: '',
                    dicms: '',
                    diclength: ''
                },
                // 表单验证，需要在 el-form-item 元素中增加 prop 属性
                rules: {
                    dicname: [
                        {required: true, message: '字段名称不能为空', trigger: 'blur'},
                        {validator: window.validateA_Z, trigger: 'blur'}
                    ],
                    dicms: [
                        {required: true, message: '字段描述不能为空', trigger: 'blur'}
                    ],
                    diclength: [
                        {required: true, message: '字段长度不能为空', trigger: 'blur'},
                        {validator: window.validateInteger, trigger: 'blur'}
                    ],
                },
                //当前下拉框id值
                currentDicid: '',
                //所有字典
                dics: [],

                dialogVisible: false,
                selectDicDataForm: {
                    dicdataname: ''
                },
                selectDicrules: {
                    dicdataname: [
                        {required: true, message: '选项名称不能为空', trigger: 'blur'}
                    ],
                },
                //某字典下的所有选项数据
                dicdatas: [],
                //当前选择的字典选项 id
                currentDicDataids: [],

                deleteDicDialogVisible:false,
            };
        },
        watch: {
            currentDicid: {
                handler(newVal, oldVal) {
                    console.log('深度监听-新数据', newVal);
                    this.findSelectDicData(newVal);
                },
                deep: true
            }
        },
        mounted: function () {
            this.findAllSelectDic();
        },
        methods: {
            //提交
            onSubmit() {
                //使用this.$refs.ruleForm.validate(); 成功。
                this.$refs.ruleForm.validate((valid) => {
                    if (valid) {
                        //表单验证后执行
                        this.createSelectDic();
                    } else {
                        return false;
                    }
                });
            },
            //创建下拉框字典
            createSelectDic() {
                var the = this;
                console.log("创建下拉框字典");
                var param = {};
                param.dicname = this.ruleForm.dicname;
                param.dicms = this.ruleForm.dicms;
                param.diclength = this.ruleForm.diclength;
                param.sql = "gather_select_dic.insert_select_dic";
                axios.post(window.gisConfig.serverUrl + '/cbc/excute.cbc', param, my_headers_config)
                    .then(response => {
                        console.log("创建下拉框字典：", response);
                        if (response.data[0].state == "success") {
                            the.$message({message: '成功创建下拉框字典！', type: 'success'});
                            the.ruleForm.dicname = '';
                            the.ruleForm.dicms = '';
                            the.ruleForm.diclength = '';
                            the.findAllSelectDic();
                        } else {
                            this.$message.error('服务异常请联系管理人员！');
                        }
                    }).catch(error => {
                    this.$message.error('服务异常请联系管理人员！');
                    console.log(error);
                });
            },
            //查询所有下拉框字典
            findAllSelectDic() {
                var the = this;
                var param = {};
                param.sql = "gather_select_dic.find_select_dic";
                axios.post(window.gisConfig.serverUrl + '/cbc/select.cbc', param, my_headers_config)
                    .then(response => {
                        console.log("查询所有下拉框字典结果集：", response);
                        if (response.data[0].state == "success") {
                            the.dics = response.data[0].objects;
                            if (the.dics.length > 0) {
                                the.currentDicid = the.dics[0].dicid;
                            }
                        } else {
                            this.$message.error('服务异常请联系管理人员！');
                        }
                    }).catch(error => {
                    this.$message.error('服务异常请联系管理人员！');
                    console.log(error);
                });
            },
            //显示字典添加选项窗口
            showSelectDicDataWin() {
                this.dialogVisible = true;
            },
            cancle() {
                this.dialogVisible = false;
                this.selectDicDataForm.dicdataname = '';
            },
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(_ => {
                        done();
                    })
                    .catch(_ => {
                    });
            },
            //字典添加选项
            addSelectDicData() {
                var the = this;
                this.$refs.selectDicDataForm.validate((valid) => {
                    if (valid) {
                        //表单验证后执行
                        var param = {};
                        param.dicid = the.currentDicid;
                        param.dicdataname = the.selectDicDataForm.dicdataname;
                        param.sql = "gather_select_dic.insert_select_dic_data";
                        axios.post(window.gisConfig.serverUrl + '/cbc/excute.cbc', param, my_headers_config)
                            .then(response => {
                                console.log("字典添加选项：", response);
                                if (response.data[0].state == "success") {
                                    the.dialogVisible = false;
                                    the.selectDicDataForm.dicdataname = '';
                                    the.findSelectDicData(this.currentDicid);
                                }
                            }).catch(error => {
                            this.$message.error('服务异常请联系管理人员！');
                            console.log(error);
                        });
                    } else {
                        return false;
                    }
                });
            },
            //根据dicid查询所有的选项数据
            findSelectDicData(dicid) {
                var the = this;
                var param = {};
                param.dicid = dicid;
                param.sql = "gather_select_dic.find_select_dic_data";
                axios.post(window.gisConfig.serverUrl + '/cbc/select.cbc', param, my_headers_config)
                    .then(response => {
                        console.log("根据dicid查询所有的选项数据结果集：", response);
                        the.dicdatas = response.data[0].objects;
                    }).catch(error => {
                    this.$message.error('服务异常请联系管理人员！');
                    console.log(error);
                });
            },
            //删除当前选择字典选项
            deleteDicData() {
                console.log("this.currentDicDataid:", this.currentDicDataids);
                var the = this;
                var param = {};
                param.dicdataids = this.currentDicDataids;
                param.sql = "gather_select_dic.delete_select_dic_data";
                axios.post(window.gisConfig.serverUrl + '/cbc/excute.cbc', param, my_headers_config)
                    .then(response => {
                        console.log("删除当前选择字典选项：", response);
                        if (response.data[0].state == "success") {
                            the.findSelectDicData(this.currentDicid);
                        }
                    }).catch(error => {
                    this.$message.error('服务异常请联系管理人员！');
                    console.log(error);
                });
            },
            //删除下拉框确认框
            deleteDicWin(){
                this.deleteDicDialogVisible=true;
            },
            deleteDicCancle(){
                this.deleteDicDialogVisible=false;
            },
            deleteDic(){
                var the = this;
                var param = {};
                param.dicid = this.currentDicid;
                param.sql = "gather_select_dic.deleteDicAndDicData";
                axios.post(window.gisConfig.serverUrl + '/cbc/excute.cbc', param, my_headers_config)
                    .then(response => {
                        console.log("删除当前选择字典：", response);
                        if (response.data[0].state == "success") {
                            the.findAllSelectDic();
                            the.deleteDicDialogVisible=false;
                            this.currentDicid='';
                        }
                    }).catch(error => {
                    this.$message.error('服务异常请联系管理人员！');
                    console.log(error);
                });
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
</style>
