<!--MVC中的View层,主要用来显示界面信息-->
<template>
    <div class="login-container">
        <div class="login-box">
            <h2 class="title" style="margin-bottom: 20px;">系统登录</h2>
            <el-form label-width="70px" v-if="loginModel">
                <el-form-item label="账号">
                    <el-input v-model="loginModel.userid" placeholder="请输入账号" @keyup.enter="handleLogin"></el-input>
                </el-form-item>
                <el-form-item label="密码">
                    <el-input v-model="loginModel.password" type="password" placeholder="请输入密码" show-password
                        @keyup.enter="handleLogin"></el-input>
                </el-form-item>
                <div style="margin-top: 20px;">
                    <el-button type="primary" @click="handleLogin" style="width: 100%; height: 40px; font-size: 16px;">登
                        录</el-button>
                </div>
            </el-form>
        </div>
    </div>
</template>
<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from "pinia";
import { loginStore } from "@/components/views/login/Controller/loginStore.ts";
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';

const store = loginStore();
const { loginModel } = storeToRefs(store);
const router = useRouter();

// 初始化Model
onMounted(() => {
    store.initClass();
});

const handleLogin = async () => {
    if (!loginModel.value) return;

    if (loginModel.value.userid === '' || loginModel.value.password === '') {
        ElMessage.warning('请输入账号和密码');
        return;
    }

    // 调用Model层逻辑
    const result = await loginModel.value.login();
    if (result.success) {
        ElMessage.success('登录成功');
        // 跳转到主页
        router.push('/gather');
    } else {
        ElMessage.error(result.message || '登录失败');
    }
}
</script>
<style scoped>
@import "./style/index.css";
</style>
