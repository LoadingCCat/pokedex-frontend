import { expect, test } from "@playwright/test";
import { ARCHIVO_NO_IMAGEN, esperarHidratacion, FOTO_PEQUENA, generarFotoGrande } from "./ayudas";

// El backend corre con el perfil e2e: la visión simulada siempre responde Charmander (confianza 0,93).

test.beforeEach(async ({ page }) => {
  await page.goto("/identificar");
  await esperarHidratacion(page, 'input[type="file"]');
});

test("identificar, camino feliz: el identificado y 3 similares que enlazan a su ficha", async ({ page }) => {
  await page.getByLabel("Elegir de la galería").setInputFiles(FOTO_PEQUENA);
  await expect(page.getByAltText("Vista previa de la foto elegida")).toBeVisible();
  await page.getByRole("button", { name: "Identificar" }).click();

  await expect(page.getByRole("heading", { level: 2, name: "Pokémon identificado" })).toBeVisible();
  const identificado = page.getByRole("region", { name: "Pokémon identificado" });
  await expect(identificado.getByRole("link", { name: /Charmander/ })).toBeVisible();

  const similares = page.getByRole("region", { name: "Pokémon similares" }).getByRole("list").first().locator(":scope > li");
  await expect(similares).toHaveCount(3);
  for (const similar of await similares.all()) {
    await expect(similar.getByRole("link")).toHaveAttribute("href", /^\/pokemon\/\d+$/);
  }

  const primero = similares.first().getByRole("link");
  const destino = await primero.getAttribute("href");
  await primero.click();
  await expect(page).toHaveURL(new RegExp(`${destino}$`));
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("identificar con error: un archivo que no es imagen da el mensaje y el botón de reintento", async ({ page }) => {
  await page.getByLabel("Elegir de la galería").setInputFiles(ARCHIVO_NO_IMAGEN);
  await page.getByRole("button", { name: "Identificar" }).click();

  await expect(page.getByText("No pudimos identificar la foto", { exact: true })).toBeVisible();
  await expect(page.getByText(/No pudimos leer esta foto/)).toBeVisible();
  const reintento = page.getByRole("button", { name: "Probar con otra foto" });
  await expect(reintento).toBeVisible();

  await reintento.click();
  await expect(page.getByLabel("Elegir de la galería")).toBeVisible();
});

test("identificar con foto grande: la petición a /api/identificar pesa menos de 1,5 MB", async ({ page }) => {
  const foto = await generarFotoGrande();
  expect(foto.buffer.length).toBeGreaterThan(5 * 1024 * 1024); // si no, la prueba no prueba nada

  await page.getByLabel("Elegir de la galería").setInputFiles(foto);
  const peticion = page.waitForRequest((r) => r.url().includes("/api/identificar") && r.method() === "POST");
  await page.getByRole("button", { name: "Identificar" }).click();

  // El cuerpo multipart no siempre llega como postData: se mide con la cabecera content-length que mandó el navegador
  const enviada = await peticion;
  const bytes = Number((await enviada.allHeaders())["content-length"] ?? enviada.postDataBuffer()?.length ?? Infinity);
  expect(bytes).toBeLessThan(1.5 * 1024 * 1024);
  await expect(page.getByRole("heading", { level: 2, name: "Pokémon identificado" })).toBeVisible();
});
