/**
 * T-11 (interventoría 4.2) · F14 (front, P1): el selector «Tipo 2» del catálogo, renderizado a HTML
 * estático (sin DOM). «Desactivado hasta elegir el primero»; no ofrece el tipo ya elegido; los dos
 * selectores se llaman `tipo`, así la URL queda `?tipo=fire&tipo=flying` también sin JavaScript.
 * Los chips y que el total coincida con el de la API se comprueban en e2e/catalogo.e2e.ts.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import FiltrosCatalogo from "./FiltrosCatalogo";
import type { EstadoCatalogo } from "@/lib/parametros-catalogo";

// FiltrosCatalogo usa el router de Next, que no existe fuera de la app
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: () => {} }) }));

const TIPOS = [
  { valor: "fire", etiqueta: "Fuego" },
  { valor: "flying", etiqueta: "Volador" },
  { valor: "water", etiqueta: "Agua" },
];

function html(estado: Partial<EstadoCatalogo>) {
  return renderToStaticMarkup(
    <FiltrosCatalogo estado={{ pagina: 1, ...estado }} tipos={TIPOS} regiones={[]} />,
  );
}

/** El <select> con ese id, con sus atributos y sus <option>. */
function selector(documento: string, id: string) {
  const coincidencia = documento.match(new RegExp(`<select\\s([^>]*id="${id}"[^>]*)>([\\s\\S]*?)</select>`));
  expect(coincidencia, `no hay un <select id="${id}">`).not.toBeNull();
  const [, atributos, contenido] = coincidencia!;
  return {
    atributos,
    deshabilitado: /\sdisabled=""/.test(` ${atributos}`),
    opciones: [...contenido.matchAll(/<option value="([^"]*)"/g)].map((m) => m[1]),
  };
}

describe("selector «Tipo 2» (F14)", () => {
  it("sin un primer tipo está desactivado y explica por qué al lector de pantalla", () => {
    const documento = html({});

    expect(selector(documento, "filtro-tipo2").deshabilitado).toBe(true);
    expect(documento).toContain("Elige primero un tipo");
    expect(documento).toMatch(/aria-describedby="filtro-tipo2-ayuda"/);
  });

  it("con un primer tipo se activa y deja de mostrar el aviso", () => {
    const documento = html({ tipo: "fire" });

    expect(selector(documento, "filtro-tipo2").deshabilitado).toBe(false);
    expect(documento).not.toContain("Elige primero un tipo");
  });

  it("no ofrece como segundo tipo el que ya se eligió como primero", () => {
    const { opciones } = selector(html({ tipo: "fire" }), "filtro-tipo2");

    expect(opciones).toEqual(["", "flying", "water"]);
  });

  it("el primer selector sí ofrece todos los tipos", () => {
    const { opciones, deshabilitado } = selector(html({ tipo: "fire" }), "filtro-tipo");

    expect(deshabilitado).toBe(false);
    expect(opciones).toEqual(["", "fire", "flying", "water"]);
  });

  it("los dos selectores se llaman «tipo» (la URL queda ?tipo=fire&tipo=flying, también sin JavaScript)", () => {
    const documento = html({ tipo: "fire", tipo2: "flying" });

    expect(selector(documento, "filtro-tipo").atributos).toMatch(/name="tipo"/);
    expect(selector(documento, "filtro-tipo2").atributos).toMatch(/name="tipo"/);
  });

  it("con los dos tipos elegidos, el segundo queda seleccionado y el panel de filtros empieza abierto con (2)", () => {
    const documento = html({ tipo: "fire", tipo2: "flying" });

    expect(documento).toMatch(/<option value="flying" selected="">Volador<\/option>/);
    expect(documento).toMatch(/aria-expanded="true"/);
    expect(documento).toContain(">(2)<");
  });
});
