import axios from "axios";
import { ElMessage } from "element-plus";

// 创建 axios 实例
const service = axios.create({
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" }
});

// 响应拦截器
service.interceptors.response.use((response) => {
  console.log("响应拦截器--response", response);
  const data = response.data;
  if (data) {
    console.log("响应拦截器--data", data);
    // 检查是否为数组格式的响应（后端返回格式）
    if (Array.isArray(data) && data.length > 0 && data[0].state === "error") {
      const errorMsg = data[0].message || "请求失败";
      ElMessage.error(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }
    // 检查是否为对象格式的响应
    if (data.state === "error") {
      const errorMsg = data.message || "请求失败";
      ElMessage.error(errorMsg);
      return Promise.reject(new Error(errorMsg));
    }
    return data;
  } else {
    return response;
  }
}, (error) => {
  // 网络错误等
  ElMessage.error(error.message || "网络请求失败");
  return Promise.reject(error);
});

// 导出 axios 实例
export default service;
