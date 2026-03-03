// Polyfill process for @stacks/connect Node.js dependencies
if (typeof (window as Window & { process?: unknown }).process === "undefined") {
  (window as Window & { process: unknown }).process = { env: {}, browser: true, version: "v18.0.0", versions: {} };
}

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
