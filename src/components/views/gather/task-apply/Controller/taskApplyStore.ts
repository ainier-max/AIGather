/**
 * MVC中的Controller层
 */
import { defineStore } from 'pinia'
import TaskApplyModel from "@/components/views/gather/task-apply/Model/TaskApplyModel.js"

export const taskApplyStore = defineStore('taskApplyStoreId', {
    state: () => ({
        taskApplyModel: null
    }),
    actions: {
        initClass() {
            this.taskApplyModel = new TaskApplyModel()
            this.taskApplyModel.initDics()
        }
    }
})
