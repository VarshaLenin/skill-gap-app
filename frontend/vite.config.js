import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// During `npm run dev`, requests to /api/* are proxied to the local Flask
// server (default http://localhost:5000) so there's no CORS friction while
// developing. In production, Flask serves the built frontend directly, so
// /api/* requests are same-origin and this proxy isn't used.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
