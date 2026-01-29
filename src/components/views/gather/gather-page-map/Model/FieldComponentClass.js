
import commonApi from '@/api/common';
import { ElMessage, ElMessageBox } from 'element-plus';
import { translateDataToTree } from '@/components/views/gather/common/tree';

export default class FieldComponentModel {
    constructor(field, valueObj, gatherPageModel) {
        this.field = field;
        this.valueObj = valueObj;
        this.gatherPageModel = gatherPageModel;

        // 字段值
        this.wordFieldValue = '';
        this.timeFieldValue = '';
        this.richFieldValue = '';
        this.selectFieldValue = '';
        this.treeFieldValue = '';
        this.photoFieldValue = '';
        this.audioFieldValue = '';
        this.videoFieldValue = '';

        // UI 状态
        this.richFieldDialogVisible = false;
        this.richButtonType = 'warning';
        this.treeFieldDialogVisible = false;
        this.treeButtonType = 'warning';

        // 数据
        this.selectArrData = [];
        this.treeData = [];
        this.editorOption = {};

        // 文件上传相关
        this.fileList = [];
        this.listType = 'text';
        this.paramData = {};
        this.fileTip = '';
        this.buttonTip = '';
        this.fileTypeJudge = [];
        this.fileTypeErrorTip = '';
        this.fileEndFlag = true;
        this.uploadUrl = '/cbc/upload.cbc';
        this.acceptType = '';

        this.editAudioArr = [];
        this.editVideoArr = [];
    }

    /**
     * 初始化数据
     */
    initData() {
        // 初始化字段值
        if (this.field.field_type == 'word' && this.valueObj != null) {
            this.wordFieldValue = this.valueObj[this.field.field_name];
        }
        if (this.field.field_type == 'rich' && this.valueObj != null) {
            this.richFieldValue = this.valueObj[this.field.field_name];
        }

        // 获取下拉框选项
        if (this.field.field_type == 'select') {
            this.findSelectArrData();
        }

        // 获取树形菜单
        if (this.field.field_type == 'tree') {
            this.findTreeArrData();
        }

        // 初始化时间
        if (this.field.field_type == 'time') {
            if (this.valueObj != null) {
                this.timeFieldValue = this.valueObj[this.field.field_name];
            } else {
                this.timeFieldValue = this.getNowTime();
            }
        }

        // 文件参数
        if (this.field.field_type == 'photo' || this.field.field_type == 'audio' || this.field.field_type == 'video') {
            const param = {
                table_name: this.field.table_name,
                file_type: this.field.field_type
            };
            this.paramData.param = JSON.stringify(param);
        }

        this.initPhoto();
        this.initAudio();
        this.initVideo();
    }

    initPhoto() {
        if (this.field.field_type != 'photo') return;

        if (this.valueObj != null) {
            this.photoFieldValue = this.valueObj[this.field.field_name];
            if (this.photoFieldValue) {
                this.editPhotoArr = this.photoFieldValue.split(",");
            }
        }
        this.fileTypeJudge.push('image/png');
        this.fileTypeJudge.push('image/jpeg');
        this.buttonTip = "照片上传";
        this.fileTip = "只能上传jpg/png文件，且不超过5M";
        this.fileTypeErrorTip = "只能上传jpg/png文件";
        this.listType = "picture";
        this.acceptType = ".jpg,.jpeg,.png";
    }

    initAudio() {
        if (this.field.field_type != 'audio') return;

        if (this.valueObj != null) {
            this.audioFieldValue = this.valueObj[this.field.field_name] || "";
            if (this.audioFieldValue) {
                this.editAudioArr = this.audioFieldValue.split(",");
            }
        }

        this.fileTypeJudge.push('audio/mpeg');
        this.buttonTip = "音频上传";
        this.fileTip = "只能上传mp3文件，且不超过5M";
        this.fileTypeErrorTip = "只能上传mp3文件";
        this.listType = "text";
        this.acceptType = ".mp3";
    }

    initVideo() {
        if (this.field.field_type != 'video') return;

        if (this.valueObj != null) {
            this.videoFieldValue = this.valueObj[this.field.field_name] || "";
            if (this.videoFieldValue) {
                this.editVideoArr = this.videoFieldValue.split(",");
            }
        }

        this.fileTypeJudge.push('video/mp4');
        this.buttonTip = "视频上传";
        this.fileTip = "只能上传mp4文件，且不超过50M";
        this.fileTypeErrorTip = "只能上传mp4文件";
        this.listType = "text";
        this.acceptType = ".mp4";
    }


    getNowTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

    async findSelectArrData() {
        try {
            const response = await commonApi.select({
                sql: "gather_select_dic.find_select_dic_data",
                dicid: this.field.dicid
            });
            if (response[0].state === "success") {
                this.selectArrData = response[0].objects || [];
                if (this.valueObj != null) {
                    this.selectFieldValue = this.valueObj[this.field.field_name];
                }
            }
        } catch (error) {
            console.error("查询下拉框数据失败:", error);
        }
    }

    async findTreeArrData() {
        try {
            const response = await commonApi.select({
                sql: "gather_tree_dic.find_tree_dic_data",
                treetablename: "gather_tree_dic_" + this.field.field_name
            });
            if (response[0].state === "success") {
                this.treeData = translateDataToTree(response[0].objects || []);
                if (this.valueObj != null) {
                    this.treeFieldValue = this.valueObj[this.field.field_name];
                }
            }
        } catch (error) {
            console.error("查询树形数据失败:", error);
        }
    }

    handleNodeClick(node) {
        this.treeFieldValue = node.label;
        this.treeFieldDialogVisible = false;
        this.updateButtonType(this.treeFieldValue, 'treeButtonType');
    }

    showRichWin() {
        this.richFieldDialogVisible = true;
    }

    showTreeWin() {
        this.treeFieldDialogVisible = true;
    }

    richConfirm() {
        this.richFieldDialogVisible = false;
        this.updateButtonType(this.richFieldValue, 'richButtonType');
    }

    updateButtonType(value, buttonTypeKey) {
        if (value != "") {
            this[buttonTypeKey] = "info";
        } else {
            this[buttonTypeKey] = "warning";
        }
    }

    // Watch logic handler
    updateModelValue(val) {
        if (this.gatherPageModel) {
            this.gatherPageModel.tableFieldValue[this.field.field_name] = val;
        }
    }

    // File Handlers
    async handleRemove(file) {
        // Remove from fileList
        for (let i = 0; i < this.fileList.length; i++) {
            if (this.fileList[i].uid == file.uid) {
                this.fileList.splice(i, 1);
                i--;
            }
        }

        try {
            const response = await commonApi.deleteFile({ uuid: file.uuid });
            if (response[0].state == "success") {
                console.log("成功删除文件：", response[0].state);
                if (this.field.field_type == "audio") {
                    this.removeAudioByUUID(file.uuid);
                }
                if (this.field.field_type == "video") {
                    this.removeVideoByUUID(file.uuid);
                }
                if (this.field.field_type == "photo") {
                    this.removePhotoByUUID(file.uuid);
                }
            }
        } catch (error) {
            console.error("删除文件失败:", error);
        }
    }

    handleExceed(files, fileList) {
        ElMessage.warning(`当前限制选择 5 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
    }

    async beforeRemove(file) {
        if (file && file.status === "success") {
            try {
                await ElMessageBox.confirm(`确定移除 ${file.name}？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                });
                return true;
            } catch {
                return false;
            }
        }
    }

    beforeAvatarUpload(file) {
        let isChooseFile = false;
        let isSize5M = false;

        // Check against allowed MIME types
        for (let i = 0; i < this.fileTypeJudge.length; i++) {
            if (file.type == this.fileTypeJudge[i]) {
                isChooseFile = true;
                break;
            }
        }

        // Check file size (< 5MB)
        if (file.size / 1024 / 1024 < 50) {
            isSize5M = true;
        }

        if (isChooseFile == false) {
            ElMessage.error(this.fileTypeErrorTip);
        }
        if (isSize5M == false) {
            ElMessage.error('上传文件大小不能超过 50MB!');
        }

        // Only indicate upload start if validation passes
        if (isChooseFile && isSize5M) {
            this.fileEndFlag = false;
            return true;
        } else {
            return false;
        }
    }

    handleAvatarSuccess(res, file) {
        console.log("handleAvatarSuccess：", res, file);
        // 检查响应是否为错误状态
        if (res && Array.isArray(res) && res.length > 0 && res[0].state === "error") {
            ElMessage.error(res[0].message || "文件上传失败");
            this.fileEndFlag = true;
            this.removeFileFromList(file.uid);
            return;
        }
        if (res && res.state === "error") {
            ElMessage.error(res.message || "文件上传失败");
            this.fileEndFlag = true;
            this.removeFileFromList(file.uid);
            return;
        }

        const fileObj = {
            name: file.name,
            url: commonApi.getFileUrl(file.response[0].uuid, 'photo'),
            uuid: file.response[0].uuid
        };
        this.fileList.push(fileObj);
        this.fileEndFlag = true;

        if (this.field.field_type == "photo") {
            this.processFileSuccess('photoFieldValue');
        }
        if (this.field.field_type == "audio") {
            this.processFileSuccess('audioFieldValue');
        }
        if (this.field.field_type == "video") {
            this.processFileSuccess('videoFieldValue');
        }
    }

    handleUploadError(error, file, fileList) {
        this.fileEndFlag = true;
        this.removeFileFromList(file.uid);

        // 尝试解析错误信息
        let errorMsg = "文件上传失败";
        if (error && error.message) {
            try {
                const errData = JSON.parse(error.message);
                if (Array.isArray(errData) && errData.length > 0 && errData[0].message) {
                    errorMsg = errData[0].message;
                } else if (errData.message) {
                    errorMsg = errData.message;
                }
            } catch (e) {
                errorMsg = error.message || "文件上传失败";
            }
        }
        ElMessage.error(errorMsg);
    }

    removeFileFromList(uid) {
        for (let i = 0; i < this.fileList.length; i++) {
            if (this.fileList[i].uid === uid) {
                this.fileList.splice(i, 1);
                break;
            }
        }
    }

    processFileSuccess(fieldValueKey) {
        if (this.valueObj == null) {
            this[fieldValueKey] = "";
        }
        if (this[fieldValueKey] != "") {
            this[fieldValueKey] = this[fieldValueKey] + ",";
        }
        for (let i = 0; i < this.fileList.length; i++) {
            if (this[fieldValueKey].indexOf(this.fileList[i].uuid) >= 0) {
                // 已存在
            } else {
                this[fieldValueKey] += this.fileList[i].uuid + ",";
            }
        }
        this[fieldValueKey] = this[fieldValueKey].slice(0, -1);
    }


    removePhotoByUUID(uuid) {
        this.removeFileByUUID(uuid, 'editPhotoArr', 'photoFieldValue');
    }

    removeAudioByUUID(uuid) {
        this.removeFileByUUID(uuid, 'editAudioArr', 'audioFieldValue');
    }

    removeVideoByUUID(uuid) {
        this.removeFileByUUID(uuid, 'editVideoArr', 'videoFieldValue');
    }

    removeFileByUUID(uuid, arrKey, valueKey) {
        const index = this[arrKey].indexOf(uuid);
        if (index > -1) {
            this[arrKey].splice(index, 1);
        }

        const valueArrTemp = this[valueKey].split(",");
        for (let i = 0; i < valueArrTemp.length; i++) {
            if (uuid == valueArrTemp[i]) {
                valueArrTemp.splice(i, 1);
            }
        }
        this[valueKey] = valueArrTemp.join(",");
    }
}
