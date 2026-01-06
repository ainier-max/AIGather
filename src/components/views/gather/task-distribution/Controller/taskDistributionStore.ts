import { defineStore } from 'pinia';
import TaskDistributionModel from '../Model/TaskDistributionModel.js';
import { ref } from 'vue';

export const taskDistributionStore = defineStore('taskDistribution', () => {
    const taskDistributionModel = ref(null);

    function initClass() {
        if (!taskDistributionModel.value) {
            taskDistributionModel.value = new TaskDistributionModel();
        }
    }

    return {
        taskDistributionModel,
        initClass
    };
});
