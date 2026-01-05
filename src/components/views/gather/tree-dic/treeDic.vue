<template>
  <div style="height: 100%;">
    <div class="titleClass">树形字典</div>
    <div style="margin:40px 50px">
      <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">创建树形字典</span>
      </el-divider>
      <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px">
        <el-form-item label="字段名" prop="treename">
          <el-input v-model="ruleForm.treename" placeholder="请输入树形字典字段名（如：ZZJG）*数据库表的字段名"></el-input>
        </el-form-item>
        <el-form-item label="字段描述" prop="treems">
          <el-input v-model="ruleForm.treems" placeholder="请输入树形字典字段名称（如：组织机构）"></el-input>
        </el-form-item>
        <el-form-item label="字段长度" prop="treelength">
          <el-input v-model="ruleForm.treelength" placeholder="请输入树形字典字段名称长度（如：30）"></el-input>
        </el-form-item>
      </el-form>
      <div align="center">
        <el-button type="primary" @click="onSubmit">创建树形字典</el-button>
      </div>

      <el-divider content-position="left" style="margin-left:50px"><span style="font-size: 18px">树形字典选项维护</span>
      </el-divider>

      <el-select v-model="currentTreeDicid" style="width:100%" placeholder="请选择">
        <el-option
          v-for="item in treedics"
          :key="item.treeid"
          :label="item.treems"
          :value="item.treeid">
        </el-option>
      </el-select>

      <div style="height: 300px;border: 1px solid gray;margin-top:30px;">
        <el-tree :data="treeData" default-expand-all :expand-on-click-node="false" :props="defaultProps" :highlight-current="true"
                 @node-click="handleNodeClick"></el-tree>
      </div>

      <div align="center" style="padding-top: 20px">
        <el-button type="primary" @click="showTreeDicDataAddWin">添加树节点</el-button>
        <el-button type="primary" @click="showTreeDicDataEditWin">修改树节点</el-button>
        <el-button type="danger" @click="deleteTreeDataWin">删除树节点</el-button>
        <el-button type="danger" @click="deleteTreeDicWin">删除树形字典</el-button>
      </div>
      <div style="height: 50px"></div>
    </div>

    <el-dialog
      :title="treeDialogTitle"
      :visible.sync="dialogVisible"
      ref="upholdDialogRef"
      width="30%"
      :before-close="handleClose">
      <el-form :model="treeDicDataForm" :rules="treeDicrules" ref="treeDicDataForm" label-width="100px">
        <el-form-item label="树节点ID" prop="treeid">
          <el-input v-if="editFlag==0" v-model="treeDicDataForm.treeid" placeholder="树节点ID"></el-input>
          <el-input v-if="editFlag==1" v-model="treeDicDataForm.treeid" disabled placeholder="树节点ID"></el-input>
        </el-form-item>
        <el-form-item label="树节点内容" prop="treems">
          <el-input v-model="treeDicDataForm.treems" placeholder="树节点内容"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="cancle">取 消</el-button>

        <el-button v-if="editFlag==0" type="primary" @click="addTreeDicData">确 定</el-button>
        <el-button v-if="editFlag==1" type="primary" @click="editTreeDicData">确 定</el-button>
      </span>
    </el-dialog>


    <el-dialog
      title="确认框"
      :visible.sync="deleteTreeDataDialogVisible"
      width="30%"
      :before-close="handleClose">
      <span style="color:red">将要删除( {{currentTreeLabel}} )与其所属的所有选项？</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteTreeDataCancle">取 消</el-button>
        <el-button type="primary" @click="deleteTreeData">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="确认框"
      :visible.sync="deleteTreeDicDialogVisible"
      width="30%"
      :before-close="handleClose">
      <span style="color:red">将要删除该树形字典,数据不可恢复！</span>

      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteTreeDicCancle">取 消</el-button>
        <el-button type="primary" @click="deleteTreeDic">确 定</el-button>
      </span>
    </el-dialog>


  </div>
</template>

<script>

    export default {
        data() {
            return {
                ruleForm: {
                    treename: '',
                    treems: '',
                    treelength: ''
                },
                // 表单验证，需要在 el-form-item 元素中增加 prop 属性
                rules: {
                    treename: [
                        {required: true, message: '字段名称不能为空', trigger: 'blur'},
                        {validator: window.validateA_Z, trigger: 'blur'}
                    ],
                    treems: [
                        {required: true, message: '字段描述不能为空', trigger: 'blur'}
                    ],
                    treelength: [
                        {required: true, message: '字段长度不能为空', trigger: 'blur'},
                        {validator: window.validateInteger, trigger: 'blur'}
                    ],
                },

                //当前选择treeid值
                currentTreeDicid: '',
                currentTreeTableName: '',
                treedics: [],

                dialogVisible: false,
                treeDicDataForm: {
                    treeid: '',
                    treems: '',
                },
                treeDicrules: {
                    treeid: [
                        {required: true, message: '树节点ID不能为空', trigger: 'blur'}
                    ],
                    treems: [
                        {required: true, message: '树节点内容不能为空', trigger: 'blur'}
                    ],
                },
                currentTreeid: '',
                currentTreeLabel: '',
                editFlag: 0,

                defaultProps: {
                    children: 'children',
                    label: 'label'
                },
                treeData: [],

                treeDialogTitle: '树节点维护',

                deleteTreeDataDialogVisible: false,
                deleteTreeDicDialogVisible: false,

            };
        },
        watch: {
            currentTreeDicid: {
                handler(newVal, oldVal) {
                    this.currentTreeid = "";
                    this.currentTreeLabel = "";
                    console.log('深度监听-新数据-currentTreeDicid', newVal);
                    this.findTreeDic(newVal);
                },
                deep: true
            },
            currentTreeTableName: {
                handler(newVal, oldVal) {
                    console.log('深度监听-新数据-currentTreeTableName', newVal);
                    if (newVal != "" && newVal != "") {
                        this.findTreeDicData(newVal);
                    }
                },
                deep: true
            }
        },
        mounted: function () {
            this.findAllTreeDic();
        },
        methods: {
            //提交
            onSubmit() {
                //使用this.$refs.ruleForm.validate(); 成功。
                this.$refs.ruleForm.validate((valid) => {
                    if (valid) {
                        //表单验证后执行
                        this.createTreeDic();
                    } else {
                        return false;
                    }
                });
            },
            createTreeDic() {
                var the = this;
                console.log("创建树形字典");
                var param = {};
                param.treename = this.ruleForm.treename;
                param.treems = this.ruleForm.treems;
                param.treelength = this.ruleForm.treelength;
                param.tablename = "gather_tree_dic_" + this.ruleForm.treename;
                param.sql = "gather_tree_dic.insert_tree_dic";
                axios.post(window.gisConfig.serverUrl + '/cbc/excute.cbc', param, my_headers_config)
                    .then(response => {
                        console.log("创建树形字典：", response);
                        if (response.data[0].state == "success") {
                            the.$message({message: '成功创建树形字典！', type: 'success'});
                            the.ruleForm.treename = '';
                            the.ruleForm.treems = '';
                            the.ruleForm.treelength = '';
                            the.findAllTreeDic();
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
                            the.treedics = response.data[0].objects;
                            if (the.treedics.length > 0) {
                                the.currentTreeDicid = the.treedics[0].treeid;
                            }
                        } else {
                            this.$message.error('服务异常请联系管理人员！');
                        }
                    }).catch(error => {
                    this.$message.error('服务异常请联系管理人员！');
                    console.log(error);
                });
            },
            cancle() {
                this.dialogVisible = false;
                this.treeDicDataForm.treeid = "";
                this.treeDicDataForm.treems = "";
                // this.currentTreeid = "";
                // this.currentTreeLabel = "";
            },
            handleClose(done) {
                var the = this;
                this.$confirm('确认关闭？')
                    .then(_ => {
                        the.currentTreeid = "";
                        this.currentTreeLabel = "";
                        done();
                    })
                    .catch(_ => {
                    });
            },
            //显示树形添加节点窗口
            showTreeDicDataAddWin() {
                this.editFlag = 0;
                this.treeDialogTitle = "添加树节点";
                this.dialogVisible = true;
            },
            //添加树节点字典数据
            addTreeDicData() {
                var the = this;
                this.$refs.treeDicDataForm.validate((valid) => {
                    if (valid) {
                        //表单验证后执行
                        var param = {};
                        if (this.currentTreeid != '' && this.currentTreeid != null) {
                            param.pid = this.currentTreeid;
                        }
                        param.dictreedataid = the.treeDicDataForm.treeid;
                        param.dictreedataname = the.treeDicDataForm.treems;
                        param.treetablename = the.currentTreeTableName;
                        param.sql = "gather_tree_dic.insert_tree_dic_data";
                        axios.post(window.gisConfig.serverUrl + '/cbc/excute.cbc', param, my_headers_config)
                            .then(response => {
                                console.log("树形字典添加数据结果：", response);
                                if (response.data[0].state == "success") {
                                    the.dialogVisible = false;
                                    the.treeDicDataForm.treeid = "";
                                    the.treeDicDataForm.treems = "";
                                    the.findTreeDicData(the.currentTreeTableName);
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
            //树节点修改窗口
            showTreeDicDataEditWin() {
                if (this.currentTreeid == null || this.currentTreeid == "") {
                    this.$message.error('未选择要修改的树节点！');
                } else {
                    this.treeDialogTitle = "修改树节点";
                    this.dialogVisible = true;
                    this.editFlag = 1;
                    this.treeDicDataForm.treeid = this.currentTreeid;
                    this.treeDicDataForm.treems = this.currentTreeLabel;
                }
            },
            //树节点修改
            editTreeDicData() {
                var the = this;
                this.$refs.treeDicDataForm.validate((valid) => {
                    if (valid) {
                        //表单验证后执行
                        var param = {};
                        param.dictreedataid = the.treeDicDataForm.treeid;
                        param.dictreedataname = the.treeDicDataForm.treems;
                        param.treetablename = the.currentTreeTableName;
                        param.sql = "gather_tree_dic.update_tree_dic_data";
                        axios.post(window.gisConfig.serverUrl + '/cbc/excute.cbc', param, my_headers_config)
                            .then(response => {
                                console.log("树形字典添加数据结果：", response);
                                if (response.data[0].state == "success") {
                                    the.dialogVisible = false;
                                    the.treeDicDataForm.treeid = "";
                                    the.treeDicDataForm.treems = "";
                                    the.currentTreeid = "";
                                    the.currentTreeLabel = "";
                                    the.findTreeDicData(the.currentTreeTableName);
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
            //删除树节点确认框
            deleteTreeDataWin() {
                if (this.currentTreeid == null || this.currentTreeid == "") {
                    this.$message.error('未选择要删除的树节点！');
                    return;
                }
                this.deleteTreeDataDialogVisible = true;
            },
            //取消删除树节点
            deleteTreeDataCancle() {
                this.deleteTreeDataDialogVisible = false;
                this.currentTreeid = "";
                this.currentTreeLabel = "";
            },
            //删除树节点
            deleteTreeData() {
                console.log("this.currentTreeid:", this.currentTreeid);
                var the = this;
                var param = {};
                param.dictreedataid = the.currentTreeid;
                param.treetablename = the.currentTreeTableName;
                param.sql = "gather_tree_dic.delete_tree_dic_data";
                axios.post(window.gisConfig.serverUrl + '/cbc/excute.cbc', param, my_headers_config)
                    .then(response => {
                        if (response.data[0].state == "success") {
                            this.currentTreeid = "";
                            this.currentTreeLabel = "";
                            this.$message.success('成功删除树节点！');
                            this.deleteTreeDataDialogVisible = false;
                            the.findTreeDicData(the.currentTreeTableName);
                        }
                    }).catch(error => {
                    this.$message.error('服务异常请联系管理人员！');
                    console.log(error);
                });
            },
            //删除树形字典确认框
            deleteTreeDicWin() {
                if (this.currentTreeDicid == null || this.currentTreeDicid == "") {
                    this.$message.error('没有可删除的树形字典！');
                    return;
                }
                this.deleteTreeDicDialogVisible = true;
            },
            //取消删除树形字典
            deleteTreeDicCancle() {
                this.deleteTreeDicDialogVisible = false;
                this.currentTreeid = "";
                this.currentTreeLabel = "";
            },
            //删除树形菜单
            deleteTreeDic() {
                console.log("this.currentTreeDicid:", this.currentTreeDicid);
                var the = this;
                var param = {};
                param.treeid = this.currentTreeDicid;
                param.tablename = this.currentTreeTableName;
                param.sql = "gather_tree_dic.delete_tree_dic";
                axios.post(window.gisConfig.serverUrl + '/cbc/excute.cbc', param, my_headers_config)
                    .then(response => {
                        if (response.data[0].state == "success") {
                            the.currentTreeid = "";
                            the.currentTreeLabel = "";
                            the.deleteTreeDicDialogVisible = false;
                            the.$message.success('成功删除树形字典！');
                            the.findAllTreeDic();
                        }
                    }).catch(error => {
                    this.$message.error('服务异常请联系管理人员！');
                    console.log(error);
                });
            },
            //根据treedicid找到其所属信息，比如获取表名
            findTreeDic(treeDicid) {
                var the = this;
                var param = {};
                param.treeid = treeDicid;
                param.sql = "gather_tree_dic.find_tree_dic";
                axios.post(window.gisConfig.serverUrl + '/cbc/select.cbc', param, my_headers_config)
                    .then(response => {
                        console.log("根据treeDicid找到的树形字典结果集：", response);
                        if (response.data[0].state == "success") {
                            if (response.data[0].objects.length > 0) {
                                the.currentTreeTableName = response.data[0].objects[0].tablename;
                                console.log("当前操作树形表：" + the.currentTreeTableName);
                            }
                        } else {
                            this.$message.error('服务异常请联系管理人员！');
                        }
                    }).catch(error => {
                    this.$message.error('服务异常请联系管理人员！');
                    console.log(error);
                });
            },
            //根据表明找到树节点数据
            findTreeDicData(tablename) {
                var the = this;
                var param = {};
                param.treetablename = tablename;
                param.sql = "gather_tree_dic.find_tree_dic_data";
                axios.post(window.gisConfig.serverUrl + '/cbc/select.cbc', param, my_headers_config)
                    .then(response => {
                        console.log("找到的树形下所有节点内容结果集：", response);
                        if (response.data[0].state == "success") {
                            this.treeData = this.translateDataToTree(response.data[0].objects);
                        } else {
                            this.$message.error('服务异常请联系管理人员！');
                        }
                    }).catch(error => {
                    this.$message.error('服务异常请联系管理人员！');
                    console.log(error);
                });
            },
            //数组和树结构数据相互转换
            translateDataToTree(data) {
                //没有父节点的数据
                let parents = data.filter(value => value.pid == 'undefined' || value.pid == null)
                //有父节点的数据
                let childrens = data.filter(value => value.pid !== 'undefined' && value.pid != null)
                //定义转换方法的具体实现
                let translator = (parents, childrens) => {
                    //遍历父节点数据
                    parents.forEach((parent) => {
                            //遍历子节点数据
                            childrens.forEach((current, index) => {
                                    //此时找到父节点对应的一个子节点
                                    if (current.pid === parent.id) {
                                        //对子节点数据进行深复制，这里只支持部分类型的数据深复制，对深复制不了解的童靴可以先去了解下深复制
                                        let temp = JSON.parse(JSON.stringify(childrens))
                                        //让当前子节点从temp中移除，temp作为新的子节点数据，这里是为了让递归时，子节点的遍历次数更少，如果父子关系的层级越多，越有利
                                        temp.splice(index, 1)
                                        //让当前子节点作为唯一的父节点，去递归查找其对应的子节点
                                        translator([current], temp)
                                        //把找到子节点放入父节点的childrens属性中
                                        typeof parent.children !== 'undefined' ? parent.children.push(current) : parent.children = [current]
                                    }
                                }
                            )
                        }
                    )
                }
                //调用转换方法
                translator(parents, childrens)
                //返回最终的结果
                return parents
            },
            //树点击事件
            handleNodeClick(data) {
                console.log("点击树节点：", data);
                this.currentTreeid = data.id;
                this.currentTreeLabel = data.label;
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
