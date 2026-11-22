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
