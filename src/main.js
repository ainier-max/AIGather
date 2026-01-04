import { createApp } from "vue";
import App from "./App.vue";
window.vueApp = createApp(App);

//ElementPlus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import router from "./router/index";
import { createPinia } from "pinia";
const pinia = createPinia();
window.vueApp.use(ElementPlus, { locale: zhCn }).use(router).use(pinia).mount("#app");

