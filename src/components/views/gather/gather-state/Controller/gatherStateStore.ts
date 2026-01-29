/**
 * MVC中的Controller层,主要用来处理中间跳转
 */
import { defineStore } from 'pinia'
import GatherStateModel from "@/components/views/gather/gather-state/Model/GatherStateModel.js"

export const gatherStateStore = defineStore('gatherStateStore', {
    state: () => ({
        gatherStateModel: null
    }),
    getters: {},
    actions: {
        initClass() {
            this.gatherStateModel = new GatherStateModel()
        }
    }
})

const storeInstance = gatherStateStore()
storeInstance.initClass()
