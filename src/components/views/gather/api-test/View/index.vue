<!--MVC中的View层,主要用来显示界面信息-->
<template>
    <div class="api-test-container">
        <div class="api-test-header">
            <span style="font-weight: bold; font-size: 16px;">接口测试工具</span>
        </div>

        <div class="api-test-body">
            <!-- 请求配置区 -->
            <div class="request-section">
                <div class="url-bar">
                    <el-select v-model="method" style="width: 120px;">
                        <el-option label="GET" value="GET" />
                        <el-option label="POST" value="POST" />
                    </el-select>
                    <el-input v-model="url" placeholder="请输入请求地址，例如：http://127.0.0.1:8087/cbc/select.cbc"
                        style="flex: 1; margin: 0 10px;" />
                    <el-button type="primary" @click="sendRequest" :loading="loading">发送</el-button>
                    <el-button @click="clearAll">清空</el-button>
                </div>

                <!-- Headers -->
                <el-tabs v-model="activeTab" style="margin-top: 10px;">
                    <el-tab-pane label="请求体 (Body)" name="body">
                        <div v-if="method === 'POST'">
                            <el-input v-model="requestBody" type="textarea" :rows="8"
                                placeholder='输入 JSON 请求体，例如：{"sql": "user.findUser", "username": "admin","password":"123456"}'
                                style="font-family: monospace;" />
                        </div>
                        <div v-else style="color: #999; padding: 10px;">GET 请求无请求体</div>
                    </el-tab-pane>

                    <el-tab-pane label="请求头 (Headers)" name="headers">
                        <div v-for="(header, index) in headers" :key="index" class="header-row">
                            <el-input v-model="header.key" placeholder="Header 名称" style="width: 200px;" />
                            <span style="margin: 0 8px;">:</span>
                            <el-input v-model="header.value" placeholder="Header 值" style="flex: 1;" />
                            <el-button type="danger" size="small" @click="removeHeader(index)"
                                style="margin-left: 8px;">删除</el-button>
                        </div>
                        <el-button size="small" @click="addHeader" style="margin-top: 8px;">+ 添加 Header</el-button>
                    </el-tab-pane>

                    <el-tab-pane label="快捷示例" name="examples">
                        <div class="examples-list">
                            <el-button v-for="ex in examples" :key="ex.name" size="small" @click="applyExample(ex)"
                                style="margin: 4px;">
                                {{ ex.name }}
                            </el-button>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>

            <!-- 响应区 -->
            <div class="response-section">
                <div class="response-header">
                    <span style="font-weight: bold;">响应结果</span>
                    <span v-if="statusCode" :class="['status-badge', statusCode < 300 ? 'status-ok' : 'status-error']">
                        {{ statusCode }}
                    </span>
                    <span v-if="responseTime" style="color: #999; font-size: 12px; margin-left: 10px;">
                        {{ responseTime }}ms
                    </span>
                    <el-button size="small" @click="copyResponse" style="margin-left: auto;"
                        :disabled="!responseText">复制</el-button>
                </div>
                <el-input v-model="responseText" type="textarea" :rows="15" placeholder="响应结果将显示在这里..." readonly
                    style="font-family: monospace; margin-top: 8px;" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';

const method = ref('POST');
const url = ref('');
const requestBody = ref('');
const activeTab = ref('body');
const loading = ref(false);
const responseText = ref('');
const statusCode = ref(null);
const responseTime = ref(null);
const headers = ref([{ key: 'Content-Type', value: 'application/json' }]);

const examples = [
    {
        name: 'combineSql-结合Sql查询',
        method: 'POST',
        url: 'http://127.0.0.1:8087/cbc/combineSql.cbc',
        body: JSON.stringify({ layerName: '网吧', sqls: ['ai_chat.getTableNameByLayerName', 'ai_chat.getTableCount'] }, null, 2)
    },
    {
        name: 'select-查询用户',
        method: 'POST',
        url: 'http://127.0.0.1:8087/cbc/select.cbc',
        body: JSON.stringify({ sql: 'user.findUser' }, null, 2)
    },
    {
        name: 'select-更新多用户',
        method: 'POST',
        url: 'http://127.0.0.1:8087/cbc/excuteByBatch.cbc',
        body: JSON.stringify({
            "sql": "user.updateManyUser", 
            "id1": 10,
            "phone1": "用户手机号更新4",
            "id2": 13,
            "phone2": "用户手机号更新5"
        }, null, 2)
    },

];

const sendRequest = async () => {
    if (!url.value.trim()) {
        ElMessage.warning('请输入请求地址');
        return;
    }

    loading.value = true;
    statusCode.value = null;
    responseTime.value = null;
    responseText.value = '';

    const startTime = Date.now();

    try {
        // 构建请求头
        const headerMap = {};
        headers.value.forEach(h => {
            if (h.key && h.value) headerMap[h.key] = h.value;
        });

        const config = {
            method: method.value,
            url: url.value,
            headers: headerMap
        };

        if (method.value === 'POST' && requestBody.value) {
            try {
                config.data = JSON.parse(requestBody.value);
            } catch (e) {
                config.data = requestBody.value;
            }
        }

        const res = await axios(config);
        statusCode.value = res.status;
        responseTime.value = Date.now() - startTime;
        responseText.value = JSON.stringify(res.data, null, 2);

    } catch (err) {
        responseTime.value = Date.now() - startTime;
        if (err.response) {
            statusCode.value = err.response.status;
            responseText.value = JSON.stringify(err.response.data, null, 2);
        } else {
            statusCode.value = 0;
            responseText.value = err.message;
        }
    } finally {
        loading.value = false;
    }
};

const clearAll = () => {
    url.value = '';
    requestBody.value = '';
    responseText.value = '';
    statusCode.value = null;
    responseTime.value = null;
};

const addHeader = () => {
    headers.value.push({ key: '', value: '' });
};

const removeHeader = (index) => {
    headers.value.splice(index, 1);
};

const applyExample = (ex) => {
    method.value = ex.method;
    url.value = ex.url;
    requestBody.value = ex.body;
    activeTab.value = 'body';
};

const copyResponse = () => {
    navigator.clipboard.writeText(responseText.value);
    ElMessage.success('已复制到剪贴板');
};
</script>

<style scoped>
.api-test-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.api-test-header {
    background-color: #2c3e50;
    color: white;
    padding: 15px 20px;
}

.api-test-body {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.url-bar {
    display: flex;
    align-items: center;
}

.header-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.response-header {
    display: flex;
    align-items: center;
    gap: 8px;
}

.status-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
}

.status-ok {
    background-color: #f0f9eb;
    color: #67c23a;
}

.status-error {
    background-color: #fef0f0;
    color: #f56c6c;
}

.examples-list {
    padding: 10px 0;
}
</style>
