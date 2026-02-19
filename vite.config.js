import { defineConfig } from "vite";

export default defineConfig({
  root: "web",
  server: {
    proxy: {
      "/auth": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
      "/api": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
      "/health": {
        target: "http://localhost:8787",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
});
