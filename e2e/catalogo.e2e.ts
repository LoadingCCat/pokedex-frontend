import { expect, test } from "@playwright/test";
import { esperarHidratacion } from "./ayudas";

test("catálogo: buscar un Pokémon por nombre y abrir su ficha", async ({ page }) => {
  await page.goto("/");
  await esperarHidratacion(page, 'form[role="search"]');

  const buscador = page.getByRole("search", { name: "Buscar y filtrar Pokémon" });
  await buscador.getByLabel("Nombre").fill("charmander");
  await buscador.getByLabel("Nombre").press("Enter");

  await expect(page).toHaveURL(/nombre=charmander/);
  const enlace = page.getByRole("heading", { level: 3 }).getByRole("link", { name: /Charmander/ });
  await expect(enlace).toBeVisible();

  await enlace.click();
  await expect(page).toHaveURL(/\/pokemon\/4$/);
  await expect(page.getByRole("heading", { level: 1, name: "Charmander" })).toBeVisible();
});

test("catálogo: «Identificar por foto» junto al buscador lleva a /identificar", async ({ page }) => {
  await page.goto("/");
  await esperarHidratacion(page, 'form[role="search"]');

  const buscador = page.getByRole("search", { name: "Buscar y filtrar Pokémon" });
  const enlace = buscador.getByRole("link", { name: "Identificar por foto" });
  await expect(enlace).toBeVisible();
  await expect(enlace).toHaveAttribute("href", "/identificar");

  // El enlace de la cabecera se mantiene
  await expect(page.getByRole("banner").getByRole("link", { name: "Identificar", exact: true })).toBeVisible();

  await enlace.click();
  await expect(page).toHaveURL(/\/identificar$/);
  await expect(page.getByRole("heading", { level: 1, name: "Identificar por foto" })).toBeVisible();
});

test("catálogo en escritorio: «Identificar por foto» queda a la derecha de «Buscar», de 44 px o más", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");

  const buscador = page.getByRole("search", { name: "Buscar y filtrar Pokémon" });
  const campo = await buscador.getByLabel("Nombre").boundingBox();
  const buscar = await buscador.getByRole("button", { name: "Buscar", exact: true }).boundingBox();
  const enlace = await buscador.getByRole("link", { name: "Identificar por foto" }).boundingBox();
  if (!campo || !buscar || !enlace) throw new Error("no se pudo medir el buscador");

  expect(enlace.x).toBeGreaterThanOrEqual(buscar.x + buscar.width); // a la derecha
  expect(Math.abs(enlace.y - campo.y)).toBeLessThan(4); // en la misma fila
  expect(enlace.height).toBeGreaterThanOrEqual(44);
});

test("catálogo: «Identificar por foto» se alcanza con el teclado y muestra el foco", async ({ page }) => {
  await page.goto("/");
  await esperarHidratacion(page, 'form[role="search"]');

  const enlace = page.getByRole("search", { name: "Buscar y filtrar Pokémon" }).getByRole("link", { name: "Identificar por foto" });
  await page.getByRole("search", { name: "Buscar y filtrar Pokémon" }).getByRole("button", { name: "Buscar", exact: true }).focus();
  await page.keyboard.press("Tab");
  await expect(enlace).toBeFocused();
  expect(await enlace.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
});
