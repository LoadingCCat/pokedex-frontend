import { describe, expect, it } from "vitest";
import imagenesJson from "../datos/imagenes.json";
import rutas from "../datos/mock/rutas.json";
import { agruparCreditos } from "./creditos";
import type { ImagenCreditada, ImagenLugar } from "./imagenes";

const imagenes = {
  regiones: Object.entries(imagenesJson.regiones) as [string, ImagenCreditada][],
  lugares: Object.entries(imagenesJson.lugares).map(([id, i]) => [Number(id), i]) as [number, ImagenLugar][],
};

describe("créditos de mapas y capturas", () => {
  it("tiene una fila por cada imagen de datos/imagenes.json, con su origen", () => {
    const filas = agruparCreditos(imagenes, rutas).flatMap((g) => g.filas);
    const total = imagenes.regiones.length + imagenes.lugares.length;
    expect(filas).toHaveLength(total);
    expect(new Set(filas.map((f) => f.imagen.archivo)).size).toBe(total);
    expect(filas.every((f) => f.imagen.origen.startsWith("https://"))).toBe(true);
  });

  it("agrupa los lugares por región y enlaza a su página", () => {
    const grupos = agruparCreditos(imagenes, rutas);
    expect(grupos[0].titulo).toBe("Mapas de región");
    const kanto = grupos.find((g) => g.titulo === "Lugares de Kanto");
    expect(kanto?.filas.every((f) => f.href?.startsWith("/rutas/"))).toBe(true);
  });

  it("una captura sin ruta en los datos no se pierde", () => {
    const grupos = agruparCreditos(imagenes, []);
    expect(grupos.at(-1)?.titulo).toBe("Otros lugares");
    expect(grupos.at(-1)?.filas).toHaveLength(imagenes.lugares.length);
  });
});
