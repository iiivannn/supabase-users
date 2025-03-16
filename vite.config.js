import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
  },
  server: {
    port: 3000,
  },
  // Add this section to ensure proper routing
  base: "/",
  // Resolve routing issues with proper fallback
  preview: {
    port: 3000,
    host: true,
  },
  // Add this for proper SPA routing
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
