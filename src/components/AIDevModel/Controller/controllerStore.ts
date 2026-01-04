
/**
 * MVC中的Controller层,主要用来处理中间跳转
 */
import { defineStore, storeToRefs } from 'pinia'
//根据实际需要更改controllerStore与controllerStoreID值
import ModelClass from "@/components/AIDevModel/Model/ModelClass.js"
export const controllerStore = defineStore('controllerStoreID', {
  state: () => ({
    modelClass: null
  }),
  getters: {},
  actions: {
    initClass() {
      this.modelClass = new ModelClass
    }
  }
})

const mapLayerConfiguredStoreObj = controllerStore()
mapLayerConfiguredStoreObj.initClass()
