import { expect, test, type Page } from "@playwright/test";
import { esperarHidratacion } from "./ayudas";

// Las credenciales buenas vienen de E2E_ADMIN_USUARIO y E2E_ADMIN_CONTRASENA (.env.test, fuera de Git).
const usuario = process.env.E2E_ADMIN_USUARIO;
const contrasena = process.env.E2E_ADMIN_CONTRASENA;

async function abrirLogin(page: Page) {
  await page.goto("/login");
  await esperarHidratacion(page, "form");
}

test("admin: credenciales malas muestran el error", async ({ page }) => {
  await abrirLogin(page);
  await page.getByLabel("Usuario").fill("nadie");
  await page.getByLabel("Contraseña").fill("contrasena-que-no-existe");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByText("Usuario o contraseña incorrectos.")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("admin: credenciales buenas entran al panel", async ({ page }) => {
  test.skip(!usuario || !contrasena, "Faltan E2E_ADMIN_USUARIO y E2E_ADMIN_CONTRASENA (ver .env.test)");
  await abrirLogin(page);
  await page.getByLabel("Usuario").fill(usuario!);
  await page.getByLabel("Contraseña").fill(contrasena!);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/admin/);
  await expect(page.getByRole("heading", { level: 1, name: "Administración" })).toBeVisible();
});
