import { defineStore } from 'pinia';
import SelectDicModel from '../Model/SelectDicModel.js';
import { ref } from 'vue';

export const selectDicStore = defineStore('selectDic', () => {
    const selectDicModel = ref(null);

    function initClass() {
        if (!selectDicModel.value) {
            selectDicModel.value = new SelectDicModel();
        }
    }

    return {
        selectDicModel,
        initClass
    };
});
