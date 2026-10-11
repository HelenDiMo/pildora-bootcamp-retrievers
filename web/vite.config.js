import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" para que funcione abierta desde cualquier carpeta o en GitHub Pages
export default defineConfig({
  base: "./",
  plugins: [react()],
});
