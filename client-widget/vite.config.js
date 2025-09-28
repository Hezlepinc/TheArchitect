import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./")
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/widget.js"),
      name: "ArchitectWidget",
      formats: ["iife", "es"],
      fileName: (format) => `widget.${format}.js`
    },
    rollupOptions: {
      // No externals; bundle React for simpler embed
    }
  },
  plugins: [react()]
});
