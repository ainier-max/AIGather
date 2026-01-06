import { defineStore } from 'pinia';
import TaskApprovalModel from '../Model/TaskApprovalModel.js';
import { ref } from 'vue';

export const taskApprovalStore = defineStore('taskApproval', () => {
    const taskApprovalModel = ref(null);

    function initClass() {
        if (!taskApprovalModel.value) {
            taskApprovalModel.value = new TaskApprovalModel();
        }
    }

    return {
        taskApprovalModel,
        initClass
    };
});
