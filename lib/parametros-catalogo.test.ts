import { describe, expect, it } from "vitest";
import { aFiltrosApi, hrefCatalogo, leerCatalogo, obtencionEnUrl } from "./parametros-catalogo";

const validos = { tipos: ["fire", "water", "electric"], regiones: ["Kanto", "Teselia"] };

describe("Parámetros del catálogo (P1)", () => {
  it("sin parámetros: página 1 y nada más", () => {
    expect(leerCatalogo({}, validos)).toEqual({ pagina: 1 });
  });

  it("lee y normaliza los valores válidos", () => {
    const estado = leerCatalogo(
      { nombre: " pika ", generacion: "1", tipo: "FIRE", region: "Kanto", obtencion: "fosil", sort: "velocidad,desc", page: "3" },
      validos,
    );
    expect(estado).toEqual({
      nombre: "pika",
      generacion: 1,
      tipo: "fire",
      region: "kanto",
      obtencion: "Fósil",
      sort: "velocidad,desc",
      pagina: 3,
    });
    expect(aFiltrosApi(estado)).toMatchObject({ page: 2, size: 20, obtencion: "Fósil" });
  });

  it("ignora los valores inválidos o vacíos", () => {
    expect(
      leerCatalogo(
        { nombre: "", generacion: "12", tipo: "luz", region: "narnia", obtencion: "comprado", sort: "totalEstadisticas", page: "-1" },
        validos,
      ),
    ).toEqual({ pagina: 1 });
    expect(leerCatalogo({ generacion: "abc", page: "0" }, validos)).toEqual({ pagina: 1 });
  });

  it("acepta 'sin-datos' (como sale en la URL) y 'Sin datos'", () => {
    expect(leerCatalogo({ obtencion: "sin-datos" }, validos).obtencion).toBe("Sin datos");
    expect(leerCatalogo({ obtencion: "Sin datos" }, validos).obtencion).toBe("Sin datos");
    expect(obtencionEnUrl("Evolución")).toBe("evolucion");
  });

  it("arma enlaces sin vacíos, sin page=1 y volviendo a la página 1 al cambiar un filtro", () => {
    const estado = leerCatalogo({ tipo: "fire", generacion: "1", page: "2" }, validos);
    expect(hrefCatalogo({ pagina: 1 })).toBe("/");
    expect(hrefCatalogo(estado, { pagina: estado.pagina })).toBe("/?generacion=1&tipo=fire&page=2");
    expect(hrefCatalogo(estado, { tipo: undefined })).toBe("/?generacion=1");
    expect(hrefCatalogo(estado, { pagina: 3 })).toBe("/?generacion=1&tipo=fire&page=3");
    expect(hrefCatalogo({ pagina: 1, obtencion: "Sin datos" })).toBe("/?obtencion=sin-datos");
  });
});
