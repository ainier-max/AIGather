/**
 * MVC中的Controller层,主要用来处理中间跳转
 */
import { defineStore } from 'pinia'
import GatherModel from "@/components/views/gather/gather-model/Model/GatherModel.js"

export const gatherModelStore = defineStore('gatherModelControllerID', {
    state: () => ({
        modelClass: null as any
    }),
    getters: {},
    actions: {
        initClass() {
            this.modelClass = new GatherModel()
        },
        // Proxy methods if needed, or View calls modelClass methods directly
        async loadTree(treeRef: any) {
            if (this.modelClass) {
                this.modelClass.findDataModelTree(treeRef);
            }
        }
    }
})

// Optional: auto-init
// const storeInstance = gatherModelStore()
// storeInstance.initClass()
