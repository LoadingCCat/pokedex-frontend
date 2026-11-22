/**
 * A-01 y A-02 (interventoría). Revisan el código fuente de las pantallas y los componentes:
 * - A-01: ningún control interactivo baja de 44 px (`min-h-11`) en móvil; `min-h-8` y `min-h-9`
 *   (32 y 36 px) pisaban el mínimo de `Boton`.
 * - A-02: un `aria-label` sobre un `<span>` sin rol no se anuncia de forma fiable; el texto
 *   alternativo va en un `<span className="sr-only">`.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Chip from "@/components/ui/Chip";

const RAIZ = join(__dirname, "..");

function archivosTsx(carpeta: string): string[] {
  return readdirSync(carpeta, { withFileTypes: true }).flatMap((e) => {
    const ruta = join(carpeta, e.name);
    if (e.isDirectory()) return archivosTsx(ruta);
    return e.name.endsWith(".tsx") && !e.name.endsWith(".test.tsx") ? [ruta] : [];
  });
}

const fuentes = ["app", "components"]
  .flatMap((c) => archivosTsx(join(RAIZ, c)))
  .map((ruta) => ({ ruta: relative(RAIZ, ruta).replaceAll("\\", "/"), texto: readFileSync(ruta, "utf8") }));

describe("A-01 · áreas táctiles de 44 px", () => {
  it("ningún componente ni pantalla usa min-h-8 ni min-h-9", () => {
    const infractores = fuentes.filter((f) => /\bmin-h-(8|9)\b/.test(f.texto)).map((f) => f.ruta);
    expect(infractores).toEqual([]);
  });

  it("el chip de filtro activo y su «×» miden al menos 44 px en móvil", () => {
    const html = renderToStaticMarkup(Chip({ etiqueta: "Fuego", hrefQuitar: "/?tipo=" }));

    expect(html).toContain("min-h-11");
    expect(html).toMatch(/<a[^>]*class="[^"]*\bsize-11\b/);
    expect(html).not.toMatch(/\bsize-7\b/);
  });
});

describe("A-02 · aria-label sobre <span>", () => {
  it("ningún <span> lleva aria-label (se usa <span className=\"sr-only\">)", () => {
    const infractores = fuentes.filter((f) => /<span\b[^>]*\baria-label=/.test(f.texto)).map((f) => f.ruta);
    expect(infractores).toEqual([]);
  });
});
