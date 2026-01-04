import { defineConfig } from "vite";
import pluginVue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  plugins: [pluginVue()],
  resolve: {
    //路径别名
    alias: {
      "@": resolve(__dirname, "./src")
    }
  },
  server: {
    host: "0.0.0.0",
    port: "4070",
    proxy: {
      ["/api"]: {
        // 接口地址
        target: "http://127.0.0.1:8087/cbc/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cbc/, "")
      }
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        silenceDeprecations: ["legacy-js-api"]
      }
    }
  }
});
