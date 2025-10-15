import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/cst8504-aat-midterm-practice-project/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
