/**
 * MVC中的Controller层,主要用来处理中间跳转
 */
import { defineStore } from 'pinia'
import ModelClass from "@/components/views/gather/model-chat/Model/ModelClass.js"

export const controllerStore = defineStore('ModelChatControllerID', {
    state: () => ({
        modelClass: null as any
    }),
    getters: {},
    actions: {
        initClass() {
            if (!this.modelClass) {
                this.modelClass = new ModelClass()
                this.modelClass.initWebSocket()
            }
        },
        dispose() {
            if (this.modelClass) {
                this.modelClass.dispose()
            }
        }
    }
})

// Initialize the store and model class
const storeInstance = controllerStore()
storeInstance.initClass()
