import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwind()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false, // İki farklı port olduğundan CORS (Cross-Origin Resource Sharing) devreye giriyor. Bunu geçici olarak böyle yaptım//
      },
    },
  },
});
