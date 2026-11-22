import { existsSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

// Credenciales del admin local (E2E_ADMIN_USUARIO / E2E_ADMIN_CONTRASENA): viven en .env.test, que no se sube a Git.
if (existsSync(".env.test")) process.loadEnvFile(".env.test");

const URL_FRONT = process.env.E2E_URL_FRONT ?? "http://localhost:3000";
const URL_API = process.env.API_URL ?? "http://localhost:8080/api";

/**
 * E2E (FE.51). Necesita el backend con el perfil `e2e` (visión simulada, no gasta cuota de Gemini);
 * el front lo levanta `webServer` (o reutiliza el que ya corra con API_URL). Ver CLAUDE.md.
 * Los archivos se llaman `*.e2e.ts` para que Vitest (`npm run test`) no los recoja.
 */
export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  // Un solo worker: el límite de 10 fotos por minuto por IP del backend es un contador común
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: URL_FRONT,
    trace: "retain-on-failure",
    locale: "es-CO",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: URL_FRONT,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: { API_URL: URL_API },
  },
});
