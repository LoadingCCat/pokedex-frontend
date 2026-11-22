import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 360, height: 640 } });

for (const ruta of ["/identificar", "/"]) {
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
