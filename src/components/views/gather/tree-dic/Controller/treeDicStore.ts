import { defineStore, storeToRefs } from 'pinia'
import TreeDicModel from "../Model/TreeDicModel.js"
import { ref } from "vue";

export const treeDicStore = defineStore('treeDicStore', () => {
    const treeDicModel = ref(null);

    function initClass() {
        treeDicModel.value = new TreeDicModel();
    }

    return { treeDicModel, initClass }
})
