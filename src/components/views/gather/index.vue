<template>
    <div style="height: 100vh;">
        <el-container style="height: 100%;">
            <el-header>
                <div style="height: 100%; display: flex; justify-content: space-between; align-items: center;">
                    <div style="display: flex; align-items: center;">
                        <span style="font-size: 20px; font-weight: bold; color: white;">采集系统</span>
                    </div>

                    <div style="cursor: pointer; display: flex; align-items: center;">
                        <el-dropdown trigger="hover" :hide-on-click="false" @command="handleCommand">
                            <span class="el-dropdown-link" style="color: white; display: flex; align-items: center;">
                                <el-icon style="margin-right: 5px;">
                                    <User />
                                </el-icon>
                                {{ userid }}
                                <el-icon class="el-icon--right">
                                    <ArrowDown />
                                </el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </div>
            </el-header>
            <el-container style="height: calc(100% - 60px);">
                <el-aside width="201px">
                    <div style="height: 100%;">
                        <el-menu style="border-right: none;" :default-active="activeIndex" class="el-menu-vertical"
                            background-color="#2c3e50" text-color="#fff" active-text-color="#ffd04b"
                            @select="handleSelect_menu">

                            <el-menu-item index="1" v-if="userType !== 'normal'">
                                <el-icon>
                                    <Document />
                                </el-icon>
                                <span>采集状况</span>
                            </el-menu-item>

                            <el-menu-item index="2">
                                <el-icon>
                                    <Location />
                                </el-icon>
                                <span>采集任务</span>
                            </el-menu-item>

                            <el-sub-menu index="3" v-if="userType !== 'normal'">
                                <template #title>
                                    <el-icon>
                                        <Menu />
                                    </el-icon>
                                    <span>任务管理</span>
                                </template>
                                <el-menu-item index="3-1">任务申请</el-menu-item>
                                <el-menu-item index="3-2">任务审批</el-menu-item>
                                <el-menu-item index="3-3">任务调配</el-menu-item>
                                <el-menu-item index="3-4">任务详情</el-menu-item>
                                <el-menu-item index="3-5">任务分配</el-menu-item>
                            </el-sub-menu>

                            <el-menu-item index="4" v-if="userType !== 'normal'">
                                <el-icon>
                                    <DataAnalysis />
                                </el-icon>
                                <span>下拉框字典</span>
                            </el-menu-item>

                            <el-menu-item index="5" v-if="userType !== 'normal'">
                                <el-icon>
                                    <Files />
                                </el-icon>
                                <span>树形字典</span>
                            </el-menu-item>

                            <el-menu-item index="6" v-if="userType !== 'normal'">
                                <el-icon>
                                    <UserFilled />
                                </el-icon>
                                <span>人员管理</span>
                            </el-menu-item>

                        </el-menu>
                    </div>
                </el-aside>


                <el-main>
                    <router-view></router-view>
                </el-main>

            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { User, ArrowDown, Document, Location, Menu, DataAnalysis, Files, UserFilled } from '@element-plus/icons-vue';

const router = useRouter();
const activeIndex = ref('1');
const userid = ref('');
const userType = ref('');

onMounted(() => {
    // 获取登录用户信息
    userid.value = localStorage.getItem('loginUserid') || 'Guest';
    userType.value = localStorage.getItem('userType') || 'normal';

    if (!userid.value || userid.value === 'null') {
        // Commented out as requested
        // router.push('/'); 
    }

    // 普通用户默认跳转到采集任务
    if (userType.value === 'normal') {
        activeIndex.value = '2';
        router.push('/gather-task');
    }
});

const handleCommand = (command) => {
    if (command === 'logout') {
        ElMessageBox.confirm('确定要退出登录吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }).then(() => {
            localStorage.setItem('loginUserid', '');
            router.push('/');
            ElMessage.success('已退出登录');
        }).catch(() => { });
    }
};

const handleSelect_menu = (key, keyPath) => {
    console.log(key, keyPath);
    activeIndex.value = key;

    // 路由跳转配置 (已屏蔽)
    if (key == "1") {
        console.log("采集状况");
        // router.push('/gather/gatherState')
    }
    if (key == "2") {
        console.log("任务采集");
        router.push('/gather-task')
    }
    if (key == "3-1") {
        console.log("任务申请");
        router.push('/task-apply')
    }
    if (key == "3-2") {
        console.log("任务审批");
        router.push('/task-approval')
    }
    if (key == "3-3") {
        console.log("任务调配");
        router.push('/task-deploy')
    }
    if (key == "3-4") {
        console.log("任务详情");
        router.push('/task-detail')
    }
    if (key == "3-5") {
        console.log("任务分配");
        router.push('/task-distribution')
    }

    if (key == "4") {
        console.log("下拉框字典");
        router.push('/select-dic')
    }
    if (key == "5") {
        console.log("树形字典");
        router.push('/tree-dic')
    }
    if (key == "6") {
        console.log("用户管理");
        router.push('/user-manager')
    }
};

</script>

<style scoped>
.el-header {
    background-color: #23262E;
    color: #fff;
    padding: 0 20px;
    height: 60px;
}

.el-aside {
    background-color: #2c3e50;
    color: #333;
}

.el-main {
    background-color: #E9EEF3;
    color: #333;
    padding: 20px;
    height: 100%;
}

:deep(.el-menu) {
    border-right: none;
}
</style>
