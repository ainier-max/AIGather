<template>
    <div class="user-manager-container" v-if="userManagerModel">
        <div class="titleClass">
            <el-icon style="vertical-align: middle; margin-right: 8px;">
                <UserFilled />
            </el-icon>
            用户管理
        </div>

        <el-card class="table-card" shadow="hover">
            <template #header>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: #475569;">系统用户列表</span>
                    <el-button type="primary" link @click="userManagerModel.findAllUser">刷新数据</el-button>
                </div>
            </template>

            <el-table :data="userManagerModel.userData" stripe style="width: 100%"
                v-loading="!userManagerModel.userData.length" size="small">
                <el-table-column prop="username" label="用户名" width="180">
                    <template #default="{ row }">
                        <span style="font-weight: 500; color: #1e293b;">{{ row.username }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="phone" label="手机号" width="180">
                </el-table-column>
                <el-table-column prop="sfzh" label="身份证号">
                </el-table-column>
                <el-table-column prop="type" label="用户类型">
                    <template #default="{ row }">
                        <el-tag :type="row.type === 'admin' ? 'danger' : 'success'" effect="light">
                            {{ row.type || '普通用户' }}
                        </el-tag>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { userManagerStore } from "@/components/views/gather/user-manager/Controller/userManagerStore.ts";
import { storeToRefs } from "pinia";
import { UserFilled } from '@element-plus/icons-vue';

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
