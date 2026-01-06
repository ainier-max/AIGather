import { defineStore } from 'pinia';
import TaskDetailModel from '../Model/TaskDetailModel.js';
import { ref } from 'vue';

export const taskDetailStore = defineStore('taskDetail', () => {
    const taskDetailModel = ref(null);

    function initClass() {
        if (!taskDetailModel.value) {
            taskDetailModel.value = new TaskDetailModel();
        }
    }

    return {
        taskDetailModel,
        initClass
    };
});
