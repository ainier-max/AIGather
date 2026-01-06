import { defineStore } from 'pinia';
import GatherTaskModel from '../Model/GatherTaskModel.js';
import { ref } from 'vue';

export const gatherTaskStore = defineStore('gatherTask', () => {
    const gatherTaskModel = ref(null);

    function initClass() {
        if (!gatherTaskModel.value) {
            gatherTaskModel.value = new GatherTaskModel();
        }
    }

    return {
        gatherTaskModel,
        initClass
    };
});
