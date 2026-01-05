<template>
    <div style="height: 100%;" v-if="userManagerModel">
        <div class="titleClass">用户管理</div>
        <div style="margin:40px 50px">
            <el-table :data="userManagerModel.userData" stripe style="width: 100%">
                <el-table-column prop="username" label="用户名" width="180">
                </el-table-column>
                <el-table-column prop="phone" label="手机号" width="180">
                </el-table-column>
                <el-table-column prop="sfzh" label="身份证号">
                </el-table-column>
                <el-table-column prop="type" label="类型">
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { userManagerStore } from "@/components/views/gather/user-manager/Controller/userManagerStore.ts";
import { storeToRefs } from "pinia";

const store = userManagerStore();
const { userManagerModel } = storeToRefs(store);

onMounted(() => {
    store.initClass();
    if (userManagerModel.value) {
        userManagerModel.value.findAllUser();
    }
});
</script>

<style scoped>
@import "./style/index.css";
</style>
