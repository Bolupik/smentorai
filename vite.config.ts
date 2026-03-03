import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Polyfill Node's crypto for @stacks/connect in the browser
      crypto: "crypto-browserify",
    },
  },
  optimizeDeps: {
    include: ['refractor'],
  },
  define: {
    // required by some stacks internals
    global: "globalThis",
  },
}));
