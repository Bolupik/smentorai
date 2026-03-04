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
    },
  },
  optimizeDeps: {
    include: ["refractor"],
    // Exclude @stacks/connect from pre-bundling so it runs after polyfills
    exclude: ["@stacks/connect"],
  },
  define: {
    // Inject Node globals needed by @stacks/connect CJS deps
    global: "globalThis",
    "process.env": "{}",
    "process.browser": "true",
    "process.version": '"v18.0.0"',
    "process.versions": "{}",
    "process.nextTick": "globalThis.setTimeout",
  },
}));
