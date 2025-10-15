import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // 在开发环境中使用根路径，在生产环境中使用 GitHub Pages 子路径
  const base = command === 'serve' ? '/' : '/cst8504-aat-midterm-practice-project/';
  
  return {
    plugins: [react()],
    base: base,
    build: {
      outDir: "dist",
      assetsDir: "assets",
    },
  };
});
