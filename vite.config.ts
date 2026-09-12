import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const moduleId = id.replace(/\\/g, "/");
          if (!moduleId.includes("/node_modules/")) return undefined;
          if (
            moduleId.includes("/node_modules/react/") ||
            moduleId.includes("/node_modules/react-dom/") ||
            moduleId.includes("/node_modules/react-router")
          ) return "react-vendor";
          if (moduleId.includes("/node_modules/@supabase/")) return "supabase-vendor";
          if (
            moduleId.includes("/node_modules/framer-motion/") ||
            moduleId.includes("/node_modules/motion/")
          ) return "animation-vendor";
          if (
            moduleId.includes("/node_modules/@radix-ui/") ||
            moduleId.includes("/node_modules/lucide-react/")
          ) return "ui-vendor";
          return undefined;
        },
      },
    },
  },
});
