/**
 * MVC中的Controller层,主要用来处理中间跳转
 */
import { defineStore } from 'pinia'
import LoginModel from "@/components/views/login/Model/LoginModel.js"

export const loginStore = defineStore('loginStoreId', {
    state: () => ({
        loginModel: null
    }),
    getters: {},
    actions: {
        initClass() {
            this.loginModel = new LoginModel()
        }
    }
})
