/**
 * MVC中的Controller层
 */
import { defineStore } from 'pinia';
import GatherPageModel from '../Model/GatherPageModel.js';
import { ref } from 'vue';

export const gatherPageStore = defineStore('gatherPageNoneStoreId', () => {
    const gatherPageModel = ref<any>(null);

    function initClass() {
        gatherPageModel.value = new GatherPageModel();
    }

    return {
        gatherPageModel,
        initClass
    };
});
