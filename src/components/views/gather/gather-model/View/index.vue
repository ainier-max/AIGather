<!--MVC中的View层,主要用来显示界面信息-->
<template>
    <div style="height: calc(100% - 60px); margin: 20px" v-if="modelClass">
        <div class="titleClass">数据模型</div>

        <div class="contentClass">
            <div style="flex-basis: 25%">
                <el-divider content-position="left"><span style="font-size: 18px">数据模型树</span>
                </el-divider>

                <el-tree ref="dataModelTreeRef" :data="modelClass.dataModelTreeData" node-key="id"
                    :default-expand-all="false" :expand-on-click-node="false" :props="modelClass.defaultProps"
                    :highlight-current="true" :default-expanded-keys="modelClass.defaultExpandedKeys"
                    @node-click="(item, data) => modelClass.handleNodeClick(item, data)"
                    style="margin-left: 50px; height: 100%; overflow-y: auto">
                    <template #default="{ node, data }">
                        <span class="custom-tree-node">
                            <span class="node-content">
                                <el-icon v-if="!data.data_model_id" class="node-icon">
                                    <Folder />
                                </el-icon>

                                <span class="node-label" :title="node.label">{{ node.label }}</span>

                                <span v-if="data.name_space && !data.data_model_id" class="node-info">({{
                                    data.name_space }})</span>
                                <span v-if="data.data_model_id" class="node-info">({{ data.data_model_id }})</span>
                            </span>

                            <span class="node-actions">
                                <el-icon v-if="!data.data_model_id" class="action-icon add-icon"
                                    @click.stop="() => modelClass.treeAppend(data)">
                                    <Plus />
                                </el-icon>
                                <el-icon v-if="data.id != 1" class="action-icon delete-icon"
                                    @click.stop="() => modelClass.treeRemove(data)">
                                    <Delete />
                                </el-icon>
                            </span>
                        </span>
                    </template>
                </el-tree>
            </div>

            <div style="flex-basis: 5%"></div>

            <div style="flex-basis: 70%; overflow: auto">
                <el-form v-if="
                    modelClass.currentDataModelTreeNodeData &&
                    modelClass.currentDataModelTreeNodeData.name_space &&
                    !modelClass.currentDataModelTreeNodeData.data_model_id
                " :inline="true" style="width: 100%; height: 100%" label-width="120px"
                    :model="modelClass.currentDataModelTreeNodeData" class="demo-form-inline">
                    <el-form-item label="名称：">
                        <el-input @input="modelClass.labelInput()"
                            v-model="modelClass.currentDataModelTreeNodeData.label" placeholder="label" />
                    </el-form-item>
                    <el-form-item label="命名空间：">
                        <el-input v-model="modelClass.currentDataModelTreeNodeData.name_space"
                            placeholder="name_space" />
                    </el-form-item>

                    <div align="center" style="padding-top: 10px">
                        <el-button type="primary" @click="modelClass.onEditNameSpace()">保存</el-button>
                    </div>
                </el-form>

                <el-form v-if="
                    modelClass.currentDataModelTreeNodeData &&
                    modelClass.currentDataModelTreeNodeData.data_model_id
                " :inline="true" style="width: 100%; height: 100%" label-width="120px"
                    :model="modelClass.currentDataModelTreeNodeData" class="demo-form-inline">
                    <el-form-item label="命名空间：">
                        <el-input v-model="modelClass.currentDataModelTreeNodeData.name_space" placeholder="label"
                            disabled />
                    </el-form-item>
                    <el-form-item label="名称：">
                        <el-input @input="modelClass.labelInput()"
                            v-model="modelClass.currentDataModelTreeNodeData.label" placeholder="label" />
                    </el-form-item>
                    <el-form-item label="模型类型： " style="width: 300px">
                        <el-select v-model="modelClass.currentDataModelTreeNodeData.data_model_type"
                            placeholder="data_model_type">
                            <el-option label="select" value="select" />
                            <el-option label="insert" value="insert" />
                            <el-option label="update" value="update" />
                            <el-option label="delete" value="delete" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="模型ID：">
                        <el-input v-model="modelClass.currentDataModelTreeNodeData.data_model_id" placeholder="label" />
                    </el-form-item>
                    <el-form-item label="开启缓存： "
                        v-if="modelClass.currentDataModelTreeNodeData.data_model_type == 'select'" style="width: 200px">
                        <el-select v-model="modelClass.currentDataModelTreeNodeData.is_cache"
                            placeholder="data_model_type">
                            <el-option label="true" value="true" />
                            <el-option label="false" value="false" />
                        </el-select>
                    </el-form-item>

                    <div>
                        <div class="leftTitle" style="padding-bottom: 10px">
                            模型SQL（参考：<a
                                href="javascript:window.open('https://mybatis.net.cn/dynamic-sql.html')">MyBatis用法</a>）<br />
                        </div>
                        <MyMonacoEditor v-if="modelClass.codeEditorFlag"
                            style="padding-left: 40px; width: 90%; height: 250px" id="SQLCodeID"
                            :code="modelClass.currentDataModelTreeNodeData.data_model_sql"
                            @update="(code) => modelClass.updateSQLCodeConfig(code)"></MyMonacoEditor>

                        <div class="leftTitle" style="padding-top: 10px; padding-bottom: 10px">
                            测试参数：
                        </div>
                        <MyMonacoEditor v-if="modelClass.codeEditorFlag"
                            style="padding-left: 40px; width: 90%; height: 200px" id="TestCodeID"
                            :code="modelClass.currentDataModelTreeNodeData.data_model_param"
                            @update="(code) => modelClass.updateTestCodeConfig(code)"></MyMonacoEditor>
                    </div>

                    <div align="center" style="padding-top: 10px">
                        <el-button type="primary" @click="modelClass.onSubmit()">保存</el-button>
                        <el-button type="success" @click="modelClass.onTest()">测试</el-button>
                    </div>

                    <div style="height: 30px"></div>
                </el-form>
            </div>
        </div>
    </div>

    <el-dialog v-if="modelClass" title="返回结果" v-model="modelClass.testSelectResultDialogVisible"
        :close-on-click-modal="false" width="60%">
        <el-table :data="modelClass.tableData" stripe
            style="width: 100%; height: 500px; padding-top: 20px; padding-left: 40px">
            <el-table-column v-for="(item, i) in modelClass.headerTableData" :prop="item" :label="item" />
        </el-table>
    </el-dialog>

    <el-dialog v-if="modelClass" title="添加节点" v-model="modelClass.addNameSpaceDialogVisible"
        :close-on-click-modal="false" width="30%">
        <el-form :model="modelClass.namespaceForm" label-width="120px" style="padding-right: 50px">
            <el-form-item label="名称">
                <el-input v-model="modelClass.namespaceForm.name" placeholder="name" />
            </el-form-item>
            <el-form-item label="命名空间" v-if="!modelClass.currentDataModelTreeNodeData?.name_space">
                <el-input v-model="modelClass.namespaceForm.name_space" placeholder="name_space" />
            </el-form-item>
            <el-form-item label="模型ID" v-if="modelClass.currentDataModelTreeNodeData?.name_space">
                <el-input v-model="modelClass.namespaceForm.data_model_id" placeholder="data_model_id" />
            </el-form-item>
        </el-form>
        <div align="center" style="padding-top: 10px">
            <el-button type="primary" @click="modelClass.addNameSpace()">保存</el-button>
        </div>
    </el-dialog>

    <el-dialog v-if="modelClass" title="确认框" v-model="modelClass.deleteNameSpaceDialogVisible"
        :close-on-click-modal="false" width="60%">
        <div v-if="!modelClass.currentDataModelTreeNodeData?.data_model_id">
            将要删除1<span style="color: red; font-weight: bold">({{ modelClass.currentDataModelTreeNodeData?.name
            }})</span>
            <br />该操作也会把对应的整个命名空间中的SQL进行删除，数据不可恢复，请小心操作。
        </div>

        <div v-if="modelClass.currentDataModelTreeNodeData?.data_model_id">
            将要删除<span style="color: red; font-weight: bold">({{ modelClass.currentDataModelTreeNodeData?.name }})</span>
            <br />数据不可恢复，请小心操作。
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button type="primary" @click="modelClass.deleteNameSpace()">确 定</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { gatherModelStore } from "@/components/views/gather/gather-model/Controller/gatherModelStore.ts";
import MyMonacoEditor from "@/components/views/gather/gather-model/View/components/MyMonacoEditor/index.vue";
import { Folder, Plus, Delete } from '@element-plus/icons-vue';

const controllerStoreObj = gatherModelStore();
const { modelClass } = storeToRefs(controllerStoreObj);

const dataModelTreeRef = ref(null);

onMounted(async () => {
    controllerStoreObj.initClass();
    if (modelClass.value) {
        // Pass the ref to the model method so it can control selection
        modelClass.value.findDataModelTree(dataModelTreeRef);
    }
});
</script>

<style scoped>
@import "./style/index.css";
</style>
