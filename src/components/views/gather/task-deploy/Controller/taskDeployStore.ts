import { defineStore } from 'pinia';
import TaskDeployModel from '../Model/TaskDeployModel.js';
import { ref } from 'vue';

export const taskDeployStore = defineStore('taskDeploy', () => {
    const taskDeployModel = ref(null);

    function initClass() {
        if (!taskDeployModel.value) {
            taskDeployModel.value = new TaskDeployModel();
        }
    }

    return {
        taskDeployModel,
        initClass
    };
});
