<!--MVC中的View层,主要用来显示界面信息-->
<template>
    <div class="model-chat-container" v-if="modelClass">
        <div class="chat-header">
            <div style="display: flex; align-items: center;">
                <span class="status-dot" :class="modelClass?.isConnected ? 'status-online' : 'status-offline'"></span>
                <span style="font-weight: bold;">大模型开发交流</span>
            </div>
            <el-button size="small" type="danger" plain @click="clearHistory">清空记录</el-button>
        </div>

        <div class="chat-messages" ref="messageBox">
            <div v-for="(msg, index) in modelClass?.messages" :key="index"
                :class="['message-item', `message-${msg.role}`]">
                <div class="message-content">{{ msg.content }}</div>
                <div class="message-time">{{ msg.time }}</div>
            </div>
        </div>

        <div class="chat-input-area">
            <el-input v-model="modelClass.inputText" placeholder="请输入交流内容..." @keyup.enter="handleSend"
                :disabled="!modelClass?.isConnected">
                <template #append>
                    <el-button type="primary" @click="handleSend" :disabled="!modelClass?.isConnected">发送</el-button>
                </template>
            </el-input>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { controllerStore } from "@/components/views/gather/model-chat/Controller/controllerStore.ts";

const controllerStoreObj = controllerStore();
const { modelClass } = storeToRefs(controllerStoreObj);
const messageBox = ref(null);

onMounted(() => {
    controllerStoreObj.initClass();
});

onUnmounted(() => {
    // We don't necessarily want to dispose if the store is global
    // but the session might need to close
    // controllerStoreObj.dispose();
});

const handleSend = () => {
    modelClass.value.sendMessage();
};

const clearHistory = () => {
    modelClass.value.clearMessages();
};

// Scroll to bottom when new messages arrive
watch(() => modelClass.value?.messages.length, () => {
    nextTick(() => {
        if (messageBox.value) {
            messageBox.value.scrollTop = messageBox.value.scrollHeight;
        }
    });
});

</script>

<style scoped>
@import "./style/index.css";
</style>
