<!--MVC中的View层,主要用来显示界面信息-->
<template>
    <div class="firstClass">
        <div class="titleClass" @click="toClick">
            {{ modelClass.name }}
        </div>
        <el-button @click="toClick">改变</el-button>
    </div>

</template>
<script setup>
import { storeToRefs } from "pinia";
import { controllerStore } from "@/components/AIDevModel/Controller/controllerStore.ts";
const controllerStoreObj = controllerStore();
const { modelClass } = storeToRefs(controllerStoreObj);

//该区域尽量不写逻辑代码
const toClick = () => {
    modelClass.value.changeName();
}

</script>
<style scoped>
@import "./style/index.css";
</style>
