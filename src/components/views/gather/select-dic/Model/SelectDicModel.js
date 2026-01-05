import commonApi from '@/api/common';
import { ElMessage, ElMessageBox } from 'element-plus';

export default class SelectDicModel {
    constructor() {
        this.ruleForm = {
            dicname: '',
            dicms: '',
            diclength: ''
        };

        this.dics = [];
        this.currentDicid = '';

        this.dialogVisible = false;
        this.selectDicDataForm = {
            dicdataname: ''
        };

        this.dicdatas = [];
        this.currentDicDataids = [];

        this.deleteDicDialogVisible = false;
    }

    /**
     * 查询所有下拉框字典
     */
    async findAllSelectDic() {
        try {
            const response = await commonApi.select({
                sql: "gather_select_dic.find_select_dic"
            });

            if (response[0].state === "success") {
                this.dics = response[0].objects;
                if (this.dics.length > 0 && !this.currentDicid) {
                    this.currentDicid = this.dics[0].dicid;
                }
            } else {
                ElMessage.error('获取字典列表失败');
            }
        } catch (error) {
            console.error(error);
            ElMessage.error('服务异常');
        }
    }

    /**
     * 创建下拉框字典
     */
    async createSelectDic() {
        try {
            const param = {
                dicname: this.ruleForm.dicname,
                dicms: this.ruleForm.dicms,
                diclength: this.ruleForm.diclength,
                sql: "gather_select_dic.insert_select_dic"
            };

            const response = await commonApi.excute(param);

            if (response[0].state === "success") {
                ElMessage.success('成功创建下拉框字典！');
                this.ruleForm.dicname = '';
                this.ruleForm.dicms = '';
                this.ruleForm.diclength = '';
                await this.findAllSelectDic();
            } else {
                ElMessage.error('创建失败：' + (response[0].message || '服务异常'));
            }
        } catch (error) {
            console.error(error);
            ElMessage.error('服务异常');
        }
    }

    /**
     * 根据dicid查询所有的选项数据
     */
    async findSelectDicData(dicid) {
        if (!dicid) return;
        try {
            const response = await commonApi.select({
                dicid: dicid,
                sql: "gather_select_dic.find_select_dic_data"
            });

            if (response[0].state === "success") {
                this.dicdatas = response[0].objects;
            } else {
                ElMessage.error('获取字典选项失败');
            }
        } catch (error) {
            console.error(error);
            ElMessage.error('服务异常');
        }
    }

    /**
     * 字典添加选项
     */
    async addSelectDicData() {
        try {
            const param = {
                dicid: this.currentDicid,
                dicdataname: this.selectDicDataForm.dicdataname,
                sql: "gather_select_dic.insert_select_dic_data"
            };

            const response = await commonApi.excute(param);

            if (response[0].state === "success") {
                this.dialogVisible = false;
                this.selectDicDataForm.dicdataname = '';
                await this.findSelectDicData(this.currentDicid);
                ElMessage.success('添加成功');
            } else {
                ElMessage.error('添加失败');
            }
        } catch (error) {
            console.error(error);
            ElMessage.error('服务异常');
        }
    }

    /**
     * 删除当前选择字典选项
     */
    async deleteDicData() {
        if (this.currentDicDataids.length === 0) {
            ElMessage.warning('请选择要删除的选项');
            return;
        }

        try {
            const param = {
                dicdataids: this.currentDicDataids,
                sql: "gather_select_dic.delete_select_dic_data"
            };

            const response = await commonApi.excute(param);

            if (response[0].state === "success") {
                this.currentDicDataids = [];
                await this.findSelectDicData(this.currentDicid);
                ElMessage.success('删除成功');
            } else {
                ElMessage.error('删除失败');
            }
        } catch (error) {
            console.error(error);
            ElMessage.error('服务异常');
        }
    }

    /**
     * 删除下拉框字典
     */
    async deleteDic() {
        try {
            const param = {
                dicid: this.currentDicid,
                sql: "gather_select_dic.deleteDicAndDicData"
            };

            const response = await commonApi.excute(param);

            if (response[0].state === "success") {
                this.deleteDicDialogVisible = false;
                this.currentDicid = '';
                await this.findAllSelectDic();
                ElMessage.success('字典及其数据已成功删除');
            } else {
                ElMessage.error('删除失败');
            }
        } catch (error) {
            console.error(error);
            ElMessage.error('服务异常');
        }
    }

    showSelectDicDataWin() {
        this.dialogVisible = true;
    }

    cancle() {
        this.dialogVisible = false;
        this.selectDicDataForm.dicdataname = '';
    }

    deleteDicWin() {
        this.deleteDicDialogVisible = true;
    }

    deleteDicCancle() {
        this.deleteDicDialogVisible = false;
    }
}
