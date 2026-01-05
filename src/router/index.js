import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
const routes = [
  {
    path: "/",
    component: () => import("@/components/views/login/View/index.vue")
  },
  {
    path: "/AiModel",
    component: () => import("@/components/AIDevModel/View/index.vue")
  },


  {
    // 主页
    path: "/gather",
    name: "gather",
    component: () => import("@/components/views/gather/index.vue"),
    children: [
      {
        name: "task-apply",
        path: "/task-apply",
        component: () => import("@/components/views/gather/task-apply/View/index.vue")
      },


    ]
  }

];
const router = createRouter({
  history: createWebHashHistory(), // hash路由模式
  // history: createWebHistory(),  // history路由模式
  routes
});
export default router;
