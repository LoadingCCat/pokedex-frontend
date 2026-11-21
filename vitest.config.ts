import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Alias "@/" como en tsconfig.json: los componentes lo usan en sus imports.
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
  esbuild: { jsx: "automatic" },
});
