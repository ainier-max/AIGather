/**
 * MVC中的Controller层
 */
import { defineStore } from 'pinia';
import GatherPageModel from '../Model/GatherPageModel.js';
import { ref } from 'vue';

export const gatherPageStore = defineStore('gatherPageNoneStoreId', () => {
    const modelClass = ref<any>(null);

    function initClass() {
        modelClass.value = new GatherPageModel();
    }

    return {
        modelClass,
        initClass
    };
});
