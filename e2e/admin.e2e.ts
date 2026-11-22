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

// T-12 (interventoría 4.2) · F15: «/admin sin sesión redirige a /login y, tras iniciar sesión, vuelve»
test("admin: /admin sin sesión redirige a /login recordando adónde volver", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/login\?volver=%2Fadmin/);
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
});

test("admin: tras iniciar sesión se vuelve a la subpágina pedida", async ({ page }) => {
  test.skip(!usuario || !contrasena, "Faltan E2E_ADMIN_USUARIO y E2E_ADMIN_CONTRASENA (ver .env.test)");
  await page.goto("/admin/pokemon");
  await expect(page).toHaveURL(/\/login\?volver=%2Fadmin%2Fpokemon/);
  await esperarHidratacion(page, "form");

  await page.getByLabel("Usuario").fill(usuario!);
  await page.getByLabel("Contraseña").fill(contrasena!);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/admin\/pokemon$/);
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
