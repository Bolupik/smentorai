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
      // Force CJS builds to avoid ESM/CJS named-export mismatch in c32check
      "@stacks/transactions": path.resolve(__dirname, "node_modules/@stacks/transactions/dist/index.js"),
      "@stacks/connect": path.resolve(__dirname, "node_modules/@stacks/connect/dist/index.js"),
    },
  },
  optimizeDeps: {
    include: [
      "refractor",
      "c32check",
      "@stacks/transactions",
      "@stacks/connect",
    ],
  },
  define: {
    global: "globalThis",
    "process.env": "{}",
    "process.browser": "true",
    "process.version": '"v18.0.0"',
    "process.versions": "{}",
    "process.nextTick": "globalThis.setTimeout",
  },
}));
