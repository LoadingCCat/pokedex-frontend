import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 360, height: 640 } });

// T-13 (interventoría 4.2) · F19: también la ficha (con debilidades; el #6 tiene dos tipos) y /naturalezas
for (const ruta of ["/identificar", "/", "/pokemon/25", "/pokemon/6", "/naturalezas"]) {
  test(`360 px: ${ruta} sin scroll horizontal`, async ({ page }) => {
    await page.goto(ruta);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const { ancho, visible } = await page.evaluate(() => ({
      ancho: document.documentElement.scrollWidth,
      visible: window.innerWidth,
    }));
    expect(ancho).toBeLessThanOrEqual(visible);
  });
}

test("360 px: «Identificar por foto» queda debajo del campo, a todo el ancho y de 44 px", async ({ page }) => {
  await page.goto("/");
  const buscador = page.getByRole("search", { name: "Buscar y filtrar Pokémon" });
  const campo = await buscador.getByLabel("Nombre").boundingBox();
  const enlace = await buscador.getByRole("link", { name: "Identificar por foto" }).boundingBox();
  const ancho = await buscador.boundingBox();
  if (!campo || !enlace || !ancho) throw new Error("no se pudo medir el buscador");

  expect(enlace.y).toBeGreaterThanOrEqual(campo.y + campo.height); // debajo
  expect(enlace.width).toBeGreaterThan(ancho.width * 0.85); // casi todo el ancho de la tarjeta del buscador
  expect(enlace.height).toBeGreaterThanOrEqual(44);
  expect(enlace.x).toBeGreaterThanOrEqual(0);
  expect(enlace.x + enlace.width).toBeLessThanOrEqual(360);
});
