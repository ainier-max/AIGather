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
        name: "gather-page",
        path: "/gather-page",
        component: () => import("@/components/views/gather/gather-page/View/index.vue")
      },
      {
        name: "gather-task",
        path: "/gather-task",
        component: () => import("@/components/views/gather/gather-task/View/index.vue")
      },
      {
        name: "task-apply",
        path: "/task-apply",
        component: () => import("@/components/views/gather/task-apply/View/index.vue")
      },

      {
        name: "task-distribution",
        path: "/task-distribution",
        component: () => import("@/components/views/gather/task-distribution/View/index.vue")
      },
      {
        name: "task-detail",
        path: "/task-detail",
        component: () => import("@/components/views/gather/task-detail/View/index.vue")
      },
      {
        name: "task-deploy",
        path: "/task-deploy",
        component: () => import("@/components/views/gather/task-deploy/View/index.vue")
      },
      {
        name: "task-approval",
        path: "/task-approval",
        component: () => import("@/components/views/gather/task-approval/View/index.vue")
      },
      {
        name: "select-dic",
        path: "/select-dic",
        component: () => import("@/components/views/gather/select-dic/View/index.vue")
      },
      {
        name: "user-manager",
        path: "/user-manager",
        component: () => import("@/components/views/gather/user-manager/View/index.vue")
      },
      {
        name: "tree-dic",
        path: "/tree-dic",
        component: () => import("@/components/views/gather/tree-dic/View/index.vue")
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
