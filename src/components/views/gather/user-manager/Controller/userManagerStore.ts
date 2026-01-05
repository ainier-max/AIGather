import { defineStore, storeToRefs } from 'pinia'
import UserManagerModel from "../Model/UserManagerModel.js"
import { ref } from "vue";

export const userManagerStore = defineStore('userManagerStore', () => {
    const userManagerModel = ref(null);

    function initClass() {
        userManagerModel.value = new UserManagerModel();
    }

    return { userManagerModel, initClass }
})
