import axios from "axios";

// 创建 axios 实例
const service = axios.create({
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" }
});

// 响应拦截器
service.interceptors.response.use((response) => {
  if (response.data) {
    return response.data;
  } else {
    return response;
  }
});
// 导出 axios 实例
export default service;
