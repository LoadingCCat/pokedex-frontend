import { describe, expect, it } from "vitest";
import { aFiltrosMovimiento, hrefMovimientos, leerMovimientos } from "./parametros-movimientos";

describe("Parámetros de /movimientos (P3)", () => {
  it("sin parámetros: todos, página 1", () => {
    expect(leerMovimientos({})).toEqual({ nombre: undefined, vista: undefined, pagina: 1 });
    expect(aFiltrosMovimiento({ pagina: 1 })).toEqual({
      page: 0,
      size: 20,
      sort: "nombreEs",
      nombre: undefined,
      categoria: undefined,
      competitivos: undefined,
    });
  });

  it("vista → categoría o competitivos", () => {
    expect(aFiltrosMovimiento(leerMovimientos({ vista: "fisico" }))).toMatchObject({ categoria: "Físico" });
    expect(aFiltrosMovimiento(leerMovimientos({ vista: "ESPECIAL", page: "3" }))).toMatchObject({ categoria: "Especial", page: 2 });
    expect(aFiltrosMovimiento(leerMovimientos({ vista: "competitivos" }))).toMatchObject({ competitivos: true, categoria: undefined });
  });

  it("el nombre manda sobre la vista; una vista inválida se ignora", () => {
    expect(leerMovimientos({ nombre: "puno", vista: "fisico" })).toEqual({ nombre: "puno", vista: undefined, pagina: 1 });
    expect(leerMovimientos({ vista: "magico", page: "x" })).toEqual({ nombre: undefined, vista: undefined, pagina: 1 });
  });

  it("enlaces: nombre o vista, nunca los dos; sin page=1", () => {
    expect(hrefMovimientos({ pagina: 1 })).toBe("/movimientos");
    expect(hrefMovimientos({ nombre: "puno", vista: "fisico", pagina: 2 }, { pagina: 2 })).toBe("/movimientos?nombre=puno&page=2");
    expect(hrefMovimientos({ vista: "estado", pagina: 4 })).toBe("/movimientos?vista=estado");
  });
});
