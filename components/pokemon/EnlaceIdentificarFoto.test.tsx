/**
 * F20 · el botón «Identificar por foto» junto al buscador del catálogo (P1), renderizado a HTML
 * estático (sin DOM). La posición (derecha / debajo), el alto real y el foco se comprueban en el
 * navegador: e2e/catalogo.e2e.ts y e2e/responsive.e2e.ts.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import FiltrosCatalogo from "./FiltrosCatalogo";
import EnlaceIdentificarFoto from "./EnlaceIdentificarFoto";

// FiltrosCatalogo usa el router de Next, que no existe fuera de la app
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {} }) }));

/** Los <a> del HTML con sus atributos y su contenido. */
function enlaces(html: string) {
  return [...html.matchAll(/<a\s([^>]*)>([\s\S]*?)<\/a>/g)].map(([, atributos, contenido]) => ({ atributos, contenido }));
}

describe("EnlaceIdentificarFoto", () => {
  const html = renderToStaticMarkup(<EnlaceIdentificarFoto />);
  const [enlace] = enlaces(html);

  it("es un enlace a /identificar con el texto «Identificar por foto»", () => {
    expect(enlaces(html)).toHaveLength(1);
    expect(enlace.atributos).toMatch(/href="\/identificar"/);
    expect(enlace.contenido.replace(/<svg[\s\S]*?<\/svg>/, "").trim()).toBe("Identificar por foto");
  });

  it("el ícono de cámara es decorativo: va oculto al lector de pantalla y siempre con texto", () => {
    expect(enlace.contenido).toMatch(/<svg[^>]*aria-hidden="true"/);
    expect(enlace.contenido).toMatch(/<svg[^>]*focusable="false"/);
    expect(enlace.atributos).not.toMatch(/aria-label/);
  });

  it("es un botón secundario (no el rojo del buscador) de 44 px como mínimo, también en escritorio", () => {
    expect(enlace.atributos).toMatch(/border-borde/);
    expect(enlace.atributos).not.toMatch(/bg-primario/);
    expect(enlace.atributos).toMatch(/(^|\s)min-h-11(\s|")/);
    expect(enlace.atributos).toMatch(/sm:min-h-11!/);
    // a 360 px ocupa todo el ancho; desde sm se ajusta a su contenido
    expect(enlace.atributos).toMatch(/(^|\s)w-full(\s|")/);
    expect(enlace.atributos).toMatch(/sm:w-auto/);
  });
});

describe("FiltrosCatalogo con «Identificar por foto»", () => {
  const html = renderToStaticMarkup(
    <FiltrosCatalogo estado={{ pagina: 1 }} tipos={[{ valor: "fire", etiqueta: "Fuego" }]} regiones={[{ valor: "kanto", etiqueta: "Kanto" }]} />,
  );
  const buscador = html.match(/<form[^>]*role="search"[\s\S]*?<\/form>/)?.[0] ?? "";

  it("el enlace está dentro de la búsqueda, después del botón «Buscar»", () => {
    expect(buscador).not.toBe("");
    const iBuscar = buscador.indexOf("Buscar</button>");
    const iEnlace = buscador.indexOf('href="/identificar"');
    expect(iBuscar).toBeGreaterThan(-1);
    expect(iEnlace).toBeGreaterThan(iBuscar);
    expect(enlaces(buscador).filter((e) => /href="\/identificar"/.test(e.atributos))).toHaveLength(1);
  });

  it("el campo, «Buscar» y el enlace comparten una fila (columna en móvil, fila desde sm)", () => {
    expect(buscador).toMatch(/flex flex-col gap-2 sm:flex-row/);
  });
});
