import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
const routes = [
  {
    path: "/",
    component: () => import("@/components/AIDevModel/View/index.vue")
  },


  {
    // 主页
    path: "/gather",
    name: "gather",
    component: () => import("@/components/views/gather/index.vue"),
    children: [
      //系统设置
      // {
      //   name: "structural-settings",
      //   path: "/structural-settings",
      //   component: () => import("@/components/views/screen/systemSettings/structural-settings/index.vue")
      // },

    ]
  }

];
const router = createRouter({
  history: createWebHashHistory(), // hash路由模式
  // history: createWebHistory(),  // history路由模式
  routes
});
export default router;
