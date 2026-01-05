<template>
  <div style="height: 100%;">
    <div class="titleClass">任务申请</div>
    <div style="margin:40px 50px">
      <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">任务类型</span>
      </el-divider>
      <el-radio-group v-model="gatherType">
        <el-radio-button label="point">点</el-radio-button>
        <el-radio-button label="polyline">线</el-radio-button>
        <el-radio-button label="polygon">面</el-radio-button>
        <el-radio-button label="absence">无坐标</el-radio-button>
      </el-radio-group>
      <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">任务信息</span>
      </el-divider>

      <el-form :model="taskForm" :rules="taskrules" ref="taskForm">
        <el-form-item prop="taskName">
          <el-input v-model="taskForm.taskName" placeholder="请输入任务名称"></el-input>
        </el-form-item>
        <el-form-item prop="taskDec">
          <el-input v-model="taskForm.taskDec" placeholder="请输入任务描述"></el-input>
        </el-form-item>
        <el-form-item prop="taskTableName">
          <el-input v-model="taskForm.taskTableName" placeholder="请输入存储表名"></el-input>
        </el-form-item>
      </el-form>
      <div style="height: 2px"></div>

      <el-divider content-position="left" style="margin-left:50px;"><span style="font-size: 18px">采集字段</span>
      </el-divider>
      <el-button type="success" @click="add('word')">文字字段</el-button>
      <el-button type="success" @click="add('select')">下拉框字段</el-button>
      <el-button type="success" @click="add('tree')">树形字段</el-button>
      <el-button type="success" @click="add('time')">时间字段</el-button>
      <el-button type="success" @click="add('rich')">富文本字段</el-button>
      <el-button type="success" @click="add('photo')">图片字段</el-button>
      <el-button type="success" @click="add('audio')">音频字段</el-button>
      <el-button type="success" @click="add('video')">视频字段</el-button>

      <div style="height: 10px"></div>

      <el-form :model="fieldDataForm" :inline="true" ref="fieldDataForm">

        <el-row v-for="(item, index) in fieldDataForm.fileds" :key="index">
          <div v-if="item.type=='word'">
            <el-form-item :rules="filedNameRule" :prop="'fileds.' + index + '.filedNameValue'">
              <el-input v-model="item.filedNameValue" :placeholder="item.filedNamePlaceholder"></el-input>
            </el-form-item>
            <el-form-item :rules="filedCommentRule" :prop="'fileds.' + index + '.filedCommentValue'">
              <el-input v-model="item.filedCommentValue" :placeholder="item.filedCommentPlaceholder"></el-input>
            </el-form-item>
            <el-form-item :rules="filedLengthRule" :prop="'fileds.' + index + '.filedLengthValue'">
              <el-input v-model="item.filedLengthValue" :placeholder="item.filedLengthPlaceholder"></el-input>
            </el-form-item>
          </div>

          <div v-if="item.type=='select'">
            <el-form-item :rules="filedNameRule" :prop="'fileds.' + index + '.filedNameValue'">
              <el-input v-model="item.filedNameValue" :placeholder="item.filedNamePlaceholder"
                        :disabled="true"></el-input>
            </el-form-item>
            <el-form-item :rules="filedCommentRule" :prop="'fileds.' + index + '.filedCommentValue'">
              <el-input v-model="item.filedCommentValue" :placeholder="item.filedCommentPlaceholder"
                        :disabled="true"></el-input>
            </el-form-item>
            <el-form-item :rules="filedLengthRule" :prop="'fileds.' + index + '.filedLengthValue'">
              <el-input v-model="item.filedLengthValue" :placeholder="item.filedLengthPlaceholder"
                        :disabled="true"></el-input>
            </el-form-item>
            <el-select v-model="item.currentDicid" @change="filedSelectChange(item)" style="width:20%"
                       placeholder="请选择">
              <el-option
                v-for="selectItem in item.arrData"
                :key="selectItem.dicid"
                :label="selectItem.dicms"
                :value="selectItem.dicid">
              </el-option>
            </el-select>
          </div>

          <div v-if="item.type=='tree'">
            <el-form-item :rules="filedNameRule" :prop="'fileds.' + index + '.filedNameValue'">
              <el-input v-model="item.filedNameValue" :placeholder="item.filedNamePlaceholder"
                        :disabled="true"></el-input>
            </el-form-item>
            <el-form-item :rules="filedCommentRule" :prop="'fileds.' + index + '.filedCommentValue'">
              <el-input v-model="item.filedCommentValue" :placeholder="item.filedCommentPlaceholder"
                        :disabled="true"></el-input>
            </el-form-item>
            <el-form-item :rules="filedLengthRule" :prop="'fileds.' + index + '.filedLengthValue'">
              <el-input v-model="item.filedLengthValue" :placeholder="item.filedLengthPlaceholder"
                        :disabled="true"></el-input>
            </el-form-item>
            <el-select v-model="item.currentTreeid" @change="filedTreeChange(item)" style="width:20%" placeholder="请选择">
              <el-option
                v-for="selectItem in item.arrData"
                :key="selectItem.treeid"
                :label="selectItem.treems"
                :value="selectItem.treeid">
              </el-option>
            </el-select>
          </div>

          <div
            v-if="item.type=='time' || item.type=='rich' || item.type=='photo' || item.type=='audio' || item.type=='video' ">
            <el-form-item :rules="filedNameRule" :prop="'fileds.' + index + '.filedNameValue'">
              <el-input v-model="item.filedNameValue" :placeholder="item.filedNamePlaceholder"></el-input>
            </el-form-item>
            <el-form-item :rules="filedCommentRule" :prop="'fileds.' + index + '.filedCommentValue'">
              <el-input v-model="item.filedCommentValue" :placeholder="item.filedCommentPlaceholder"></el-input>
            </el-form-item>
          </div>

        </el-row>


      </el-form>

      <div v-if="gatherType=='point'">
        <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">图层图片</span>
        </el-divider>

        <div>
          <div class="filediv" ref="fileRef">
            <input type="file" @change="choosePhoto" accept="image/*">
          </div>
        </div>

      </div>
      <div v-if="gatherType=='polyline' || gatherType=='polygon'">
        <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">图层颜色</span>
        </el-divider>
        <el-color-picker  v-model="layerColor"></el-color-picker>
      </div>

      <div align="center" style="padding-top: 30px">
        <el-button type="primary" @click="taskApply">任务申请</el-button>
      </div>

      <div style="height: 60px"></div>
    </div>

  </div>
</template>

<script>

export default {
  data() {
    return {
      fieldDataForm: {
        fileds: []
      },
      //字段名称验证
      filedNameRule: [
        {required: true, message: '字段名称不能为空', trigger: 'blur'},
        {validator: window.validateA_Z, trigger: 'blur'}
      ],
      //字段描述验证
      filedCommentRule: [
        {required: true, message: '字段描述不能为空', trigger: 'blur'}
      ],
      //字段长度验证
      filedLengthRule: [
        {required: true, message: '字段长度不能为空', trigger: 'blur'},
        {validator: window.validateInteger, trigger: 'blur'}
      ],
      gatherType: 'point',
      taskForm: {
        taskName: '',
        taskDec: '',
        taskTableName: ''
      },
      taskrules: {
        taskName: [
          {required: true, message: '任务名称不能为空', trigger: 'blur'}
        ],
        taskDec: [
          {required: true, message: '任务描述不能为空', trigger: 'blur'}
        ],
        taskTableName: [
          {required: true, message: '存储表名不能为空', trigger: 'blur'},
          {validator: window.validateA_Z, trigger: 'blur'}
        ],
      },
      //添加字段个数标签
      filedId: 0,
      //查询到的所有下拉框字典结果集
      allSelectDic: [],
      //查询到的所有树形字典结果集
      allTreedics: [],
      //图层照片（base64）
      layerImage: '',
      //图层颜色
      layerColor: '#00ffff',
      //照片选择器对象
      photoObj: null,
    };
  },
  mounted: function () {
    this.findAllSelectDic();
    this.findAllTreeDic();
  },
  methods: {
    add(type) {
      console.log("字段类型：", type);
      this.filedId = this.filedId + 1;
      if (type == "word") {
        var obj = {};
        obj.type = type;
        obj.id = this.filedId;
        obj.filedNameValue = "";
        obj.filedNamePlaceholder = "文字字段,如NAME";
        obj.filedCommentValue = "";
        obj.filedCommentPlaceholder = "文字字段描述,如名称";
        obj.filedLengthValue = "";
        obj.filedLengthPlaceholder = "文字字段存储长度,如30";
        this.fieldDataForm.fileds.push(obj);
      }
      if (type == "select") {
        var obj = {};
        this.filedId = this.filedId + 1;
        obj.type = type;
        obj.id = this.filedId;
        obj.arrData = this.allSelectDic;
        if (obj.arrData.length > 0) {
          obj.currentDicid = obj.arrData[0].dicid;
          obj.filedNameValue = obj.arrData[0].dicname;
          obj.filedCommentValue = obj.arrData[0].dicms;
          obj.filedLengthValue = obj.arrData[0].diclength;
        } else {
          this.$message.error('没有下拉框字典数据！');
          return;
        }
        this.fieldDataForm.fileds.push(obj);
      }
      if (type == "tree") {
        var obj = {};
        this.filedId = this.filedId + 1;
        obj.type = type;
        obj.id = this.filedId;
        obj.arrData = this.allTreedics;
        if (obj.arrData.length > 0) {
          obj.currentTreeid = obj.arrData[0].treeid;
          obj.filedNameValue = obj.arrData[0].treename;
          obj.filedCommentValue = obj.arrData[0].treems;
          obj.filedLengthValue = obj.arrData[0].treelength;
        } else {
          this.$message.error('没有树形字典数据！');
          return;
        }
        this.fieldDataForm.fileds.push(obj);
      }
      if (type == "time" || type == "rich" || type == "photo" || type == "audio" || type == "video") {
        var obj = {};
        obj.type = type;
        obj.id = this.filedId;
        obj.filedNameValue = "";
        obj.filedCommentValue = "";
        if (type == "time") {
          obj.filedNamePlaceholder = "时间字段,如STARTTIME";
          obj.filedCommentPlaceholder = "时间字段描述,如开始时间";
        } else if (type == "rich") {
          obj.filedNamePlaceholder = "富文本字段,如RICHCONTENT";
          obj.filedCommentPlaceholder = "富文本字段描述,如富文本内容";
        } else if (type == "photo") {
          obj.filedNamePlaceholder = "照片字段,如PHOTO";
          obj.filedCommentPlaceholder = "照片字段描述,如相关照片";
        } else if (type == "audio") {
          obj.filedNamePlaceholder = "音频字段,如AUDIO";
          obj.filedCommentPlaceholder = "音频字段描述,如相关音频";
        } else if (type == "video") {
          obj.filedNamePlaceholder = "视频字段,如VIDEO";
          obj.filedCommentPlaceholder = "视频字段描述,如相关视频";
        }
        this.fieldDataForm.fileds.push(obj);
      }
    },
    //下拉框改变方法
    filedSelectChange(obj) {
      console.log("改变的下拉框所属字段：", obj);
      for (var i = 0; i < obj.arrData.length; i++) {
        if (obj.arrData[i].dicid == obj.currentDicid) {
          obj.filedNameValue = obj.arrData[i].dicname;
          obj.filedCommentValue = obj.arrData[i].dicms;
          obj.filedLengthValue = obj.arrData[i].diclength;
        }
      }
    },
    filedTreeChange(obj) {
      console.log("改变的下拉框所属字段：", obj);
      for (var i = 0; i < obj.arrData.length; i++) {
        if (obj.arrData[i].treeid == obj.currentTreeid) {
          obj.filedNameValue = obj.arrData[i].treename;
          obj.filedCommentValue = obj.arrData[i].treems;
          obj.filedLengthValue = obj.arrData[i].treelength;
        }
      }
    },
    taskApply() {
      var fieldFlag = false;
      this.$refs.fieldDataForm.validate((valid) => {
        fieldFlag = valid;
      });
      var taskFlag = false;
      this.$refs.taskForm.validate((valid) => {
        taskFlag = valid
      });
      console.log("Flag", fieldFlag, taskFlag);
      if (fieldFlag == true && taskFlag == true) {
        console.log("输入验证通过");
      } else {
        this.$message.error('输入验证不通过，请检查！');
        return;
      }
      console.log("字段集：", this.fieldDataForm.fileds);
      if (this.fieldDataForm.fileds.length <= 0) {
        this.$message.error('没有添加字段信息！');
        return;
      }
      if (this.gatherType == "point" && this.layerImage == '') {
        this.$message.error('没有添加图层图片！');
        return;
      }

      //判断输入的字段名是否重复
      var arrayTemp=[];
      for(var i=0;i<this.fieldDataForm.fileds.length;i++){
        arrayTemp.push(this.fieldDataForm.fileds[i].filedNameValue);
      }
      var numFlag=this.CheckArrayElement(arrayTemp);
      if(numFlag>0){
        this.$message.error('字段名存在重复！');
        return;
      }

      this.findTableByTableName();
    },
    //判断当前输入表名是否存在
    findTableByTableName() {
      var the = this;
      var param = {};
      var gather_table_name = "";
      if (this.gatherType == "point") {
        gather_table_name = "PT_" + this.taskForm.taskTableName;
      } else if (this.gatherType == "polyline") {
        gather_table_name = "PL_" + this.taskForm.taskTableName;
      } else if (this.gatherType == "polygon") {
        gather_table_name = "PG_" + this.taskForm.taskTableName;
      } else {
        gather_table_name = "PA_" + this.taskForm.taskTableName;
      }
      param.table_name = gather_table_name;
      param.sql = "gather_task.findTableByTableName";
      axios.post(window.gisConfig.serverUrl + '/cbc/select.cbc', param, my_headers_config)
        .then(response => {
          console.log("判断当前输入表名是否存在结果集：", response);
          if (response.data[0].state == "success") {
            var result = response.data[0].objects;
            if (result.length > 0) {
              this.$message.error('该表已存在，请修改存储表名！');
            } else {
              //创建表
              console.log("开始创建表");
              this.createTaskApply();
            }
          } else {
            this.$message.error('服务异常请联系管理人员！');
          }
        }).catch(error => {
        this.$message.error('服务异常请联系管理人员！');
        console.log(error);
      });
    },
    //创建表
    createTaskApply() {
      var the = this;
      var tableName = "";
      var color = "";
      var layerimg = "";
      if (this.gatherType == "point") {
        tableName = "PT_" + this.taskForm.taskTableName;
        layerimg = this.layerImage;
      } else if (this.gatherType == "polyline") {
        tableName = "PL_" + this.taskForm.taskTableName;
        color = this.layerColor;
      } else if (this.gatherType == "polygon") {
        tableName = "PG_" + this.taskForm.taskTableName;
        color = this.layerColor;
      } else {
        tableName = "PA_" + this.taskForm.taskTableName;
      }
      var param = {};
      param.sql = 'gather_task.applyTask';
      param.type = this.gatherType;
      param.name = this.taskForm.taskName;
      param.description = this.taskForm.taskDec;
      param.table_name = tableName;
      param.layerimg = layerimg;
      param.userid = window.localStorage.getItem('loginUserid');
      param.color = color;
      param.objects = this.createField(tableName);
      console.log("createTaskApply传入参数：", param);
      axios.post(window.gisConfig.serverUrl + '/cbc/excute.cbc', param, my_headers_config)
        .then(response => {
          console.log("判断当前输入表名是否存在结果集：", response);
          if (response.data[0].state == "success") {
            this.$message.success('申请成功！');
            this.taskForm.taskName = '';
            this.taskForm.taskDec = '';
            this.taskForm.taskTableName = '';
            this.fieldDataForm.fileds = [];
            this.layerImage = "";
            this.layerColor = '#00ffff';
            if (this.gatherType == "point" && this.photoObj != null) {
              this.$refs.fileRef.style.background = '';
            }
          } else {
            this.$message.error('服务异常请联系管理人员！');
          }
        }).catch(error => {
        this.$message.error('服务异常请联系管理人员！');
        console.log(error);
      });

    },
    createField(tableName) {
      var field_objects = [];
      //默认文字字段--主键
      var field_json = {};
      field_json.table_name = tableName;
      field_json.field_name = "GATHER_ID";
      field_json.field_dec = "主键";
      field_json.field_length = "";
      field_json.field_type = 'int';
      field_json.dicid = '';
      field_json.show_flag = '0';
      field_objects.push(field_json);
      if (this.gatherType == "point") {
        //默认文字字段--坐标X
        var field_json = {};
        field_json.table_name = tableName;
        field_json.field_name = "GATHER_ZBX";
        field_json.field_dec = "坐标X";
        field_json.field_length = "30";
        field_json.field_type = 'word';
        field_json.dicid = '';
        field_json.show_flag = '4';
        field_objects.push(field_json);
        //默认文字字段--坐标Y
        var field_json = {};
        field_json.table_name = tableName;
        field_json.field_name = "GATHER_ZBY";
        field_json.field_dec = "坐标Y";
        field_json.field_length = "30";
        field_json.field_type = 'word';
        field_json.dicid = '';
        field_json.show_flag = '4';
        field_objects.push(field_json);
      } else if (this.gatherType == "polyline") {
        //默认文字字段--坐标串
        var field_json = {};
        field_json.table_name = tableName;
        field_json.field_name = "GATHER_ZBC";
        field_json.field_dec = "坐标串";
        field_json.field_length = "";
        field_json.field_type = 'word';
        field_json.dicid = '';
        field_json.show_flag = '4';
        field_objects.push(field_json);
      } else if (this.gatherType == "polygon") {
        //默认文字字段--坐标串
        var field_json = {};
        field_json.table_name = tableName;
        field_json.field_name = "GATHER_ZBC";
        field_json.field_dec = "坐标串";
        field_json.field_length = "";
        field_json.field_type = 'word';
        field_json.dicid = '';
        field_json.show_flag = '4';
        field_objects.push(field_json);
      }
      //默认文字字段--采集人
      var field_json = {};
      field_json.table_name = tableName;
      field_json.field_name = "GATHER_CJR";
      field_json.field_dec = "采集人";
      field_json.field_length = "30";
      field_json.field_type = 'word';
      field_json.dicid = '';
      field_json.show_flag = '4';
      field_objects.push(field_json);
      //默认文字字段--采集时间
      var field_json = {};
      field_json.table_name = tableName;
      field_json.field_name = "GATHER_CJSJ";
      field_json.field_dec = "采集时间";
      field_json.field_length = "50";
      field_json.field_type = 'time';
      field_json.dicid = '';
      field_json.show_flag = '4';
      field_objects.push(field_json);
      //默认文字字段--采集机器
      var field_json = {};
      field_json.table_name = tableName;
      field_json.field_name = "GATHER_CJJQ";
      field_json.field_dec = "采集机器";
      field_json.field_length = "30";
      field_json.field_type = 'word';
      field_json.dicid = '';
      field_json.show_flag = '4';
      field_objects.push(field_json);
      //默认文字字段--更新人员
      var field_json = {};
      field_json.table_name = tableName;
      field_json.field_name = "GATHER_GXRY";
      field_json.field_dec = "更新人员";
      field_json.field_length = "30";
      field_json.field_type = 'word';
      field_json.dicid = '';
      field_json.show_flag = '4';
      field_objects.push(field_json);
      //默认文字字段--更新时间
      var field_json = {};
      field_json.table_name = tableName;
      field_json.field_name = "GATHER_GXSJ";
      field_json.field_dec = "更新时间";
      field_json.field_length = "50";
      field_json.field_type = 'time';
      field_json.dicid = '';
      field_json.show_flag = '4';
      field_objects.push(field_json);
      //默认文字字段--注销人员
      var field_json = {};
      field_json.table_name = tableName;
      field_json.field_name = "GATHER_ZXRY";
      field_json.field_dec = "注销人员";
      field_json.field_length = "30";
      field_json.field_type = 'word';
      field_json.dicid = '';
      field_json.show_flag = '4';
      field_objects.push(field_json);
      //默认文字字段--注销时间
      var field_json = {};
      field_json.table_name = tableName;
      field_json.field_name = "GATHER_ZXSJ";
      field_json.field_dec = "注销时间";
      field_json.field_length = "50";
      field_json.field_type = 'time';
      field_json.dicid = '';
      field_json.show_flag = '4';
      field_objects.push(field_json);
      //默认文字字段--注销状态
      var field_json = {};
      field_json.table_name = tableName;
      field_json.field_name = "GATHER_ZXZT";
      field_json.field_dec = "注销状态";
      field_json.field_length = "30";
      field_json.field_type = 'word';
      field_json.dicid = '';
      field_json.show_flag = '4';
      field_objects.push(field_json);
      //默认文字字段--注销原因
      var field_json = {};
      field_json.table_name = tableName;
      field_json.field_name = "GATHER_ZXYY";
      field_json.field_dec = "注销原因";
      field_json.field_length = "3000";
      field_json.field_type = 'word';
      field_json.dicid = '';
      field_json.show_flag = '4';
      field_objects.push(field_json);
      //创建字段
      for (var i = 0; i < this.fieldDataForm.fileds.length; i++) {
        //文字字段
        if (this.fieldDataForm.fileds[i].type == "word") {
          var field_json = {};
          field_json.table_name = tableName;
          field_json.field_name = this.fieldDataForm.fileds[i].filedNameValue;
          field_json.field_dec = this.fieldDataForm.fileds[i].filedCommentValue;
          field_json.field_length = this.fieldDataForm.fileds[i].filedLengthValue;
          field_json.field_type = this.fieldDataForm.fileds[i].type
          field_json.dicid = '';
          field_json.show_flag = '3';
          field_objects.push(field_json);
        }
        //下拉框字段
        if (this.fieldDataForm.fileds[i].type == "select") {
          var field_json = {};
          field_json.table_name = tableName;
          field_json.field_name = this.fieldDataForm.fileds[i].filedNameValue;
          field_json.field_dec = this.fieldDataForm.fileds[i].filedCommentValue;
          field_json.field_length = this.fieldDataForm.fileds[i].filedLengthValue;
          field_json.field_type = this.fieldDataForm.fileds[i].type;
          field_json.dicid = this.fieldDataForm.fileds[i].currentDicid;
          field_json.show_flag = '3';
          field_objects.push(field_json);
        }
        //树形字段
        if (this.fieldDataForm.fileds[i].type == "tree") {
          var field_json = {};
          field_json.table_name = tableName;
          field_json.field_name = this.fieldDataForm.fileds[i].filedNameValue;
          field_json.field_dec = this.fieldDataForm.fileds[i].filedCommentValue;
          field_json.field_length = this.fieldDataForm.fileds[i].filedLengthValue;
          field_json.field_type = this.fieldDataForm.fileds[i].type;
          field_json.dicid = this.fieldDataForm.fileds[i].currentTreeid;
          field_json.show_flag = '3';
          field_objects.push(field_json);
        }
        //时间字段
        if (this.fieldDataForm.fileds[i].type == "time") {
          var field_json = {};
          field_json.table_name = tableName;
          field_json.field_name = this.fieldDataForm.fileds[i].filedNameValue;
          field_json.field_dec = this.fieldDataForm.fileds[i].filedCommentValue;
          field_json.field_length = "50";
          field_json.field_type = this.fieldDataForm.fileds[i].type;
          field_json.dicid = '';
          field_json.show_flag = '3';
          field_objects.push(field_json);
        }
        //富文本字段
        if (this.fieldDataForm.fileds[i].type == "rich" || this.fieldDataForm.fileds[i].type == 'photo' || this.fieldDataForm.fileds[i].type == 'audio' || this.fieldDataForm.fileds[i].type == 'video') {
          var field_json = {};
          field_json.table_name = tableName;
          field_json.field_name = this.fieldDataForm.fileds[i].filedNameValue;
          field_json.field_dec = this.fieldDataForm.fileds[i].filedCommentValue;
          //field_json.field_length="50";
          field_json.field_type = this.fieldDataForm.fileds[i].type;
          field_json.dicid = '';
          field_json.show_flag = '3';
          field_objects.push(field_json);
        }
      }
      return field_objects;
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
            the.allSelectDic = response.data[0].objects;
          } else {
            this.$message.error('服务异常请联系管理人员！');
          }
        }).catch(error => {
        this.$message.error('服务异常请联系管理人员！');
        console.log(error);
      });
    },
    //查询所有的树形字典
    findAllTreeDic() {
      var the = this;
      var param = {};
      param.sql = "gather_tree_dic.find_tree_dic";
      axios.post(window.gisConfig.serverUrl + '/cbc/select.cbc', param, my_headers_config)
        .then(response => {
          console.log("查询所有树形字典结果集：", response);
          if (response.data[0].state == "success") {
            the.allTreedics = response.data[0].objects;
          } else {
            this.$message.error('服务异常请联系管理人员！');
          }
        }).catch(error => {
        this.$message.error('服务异常请联系管理人员！');
        console.log(error);
      });
    },
    choosePhoto(photoObj) {

      console.log("choosePhoto--photoObj",photoObj);
      this.photoObj = photoObj;
      var the = this;
      
      var oFReader = new FileReader();
      var file = photoObj.target.files[0];
      oFReader.readAsDataURL(file);
      oFReader.onloadend = function (oFRevent) {
        var src = oFRevent.target.result;
        the.layerImage = src;
        console.log("src1", src);
        
        the.$refs.fileRef.style.background = 'url(' + src + ') no-repeat center center';
        the.$refs.fileRef.style.backgroundSize = '40px 40px'
      }
      console.log(file);
    },
    CheckArrayElement(array){
      array.sort();  //数组排序
      var reNum = 0;  //返回结果
      //遍历整个数组对象
      for(var i=0;i<array.length;i++){
        //跳过最后一个元素的比较
        if (i + 1 == array.length) {
          continue;
        }
        //判断相邻的元素是否相同
        if (array[i] == array[i + 1]) {
          reNum += 1;
        }
      }
      return reNum;
    },
  }
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

.filediv {
  width: 40px;
  height: 40px;
  background: url('../images/add.jpg') no-repeat;
  background-size: 40px 40px;
  display: inline-block;
  cursor: pointer;
  border: 2px solid #fff6f7;
}

.filediv input {
  width: 100%;
  height: 100%;
  opacity: 0;
}

</style>
