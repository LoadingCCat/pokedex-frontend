import { describe, expect, it } from "vitest";
import imagenesJson from "../datos/imagenes.json";
import pokemons from "../datos/mock/pokemons.json";
import { elegirCapturasFicha } from "./capturas-ficha";
import type { CapturaJuego, ImagenLugar } from "./imagenes";

const lugares = imagenesJson.lugares as Record<string, ImagenLugar>;
const propiasDe = (id: number) => ((imagenesJson.pokemon as Record<string, CapturaJuego[]>)[String(id)] ?? []);
const imagenDeLugar = (id: number | null) => (id == null ? null : (lugares[String(id)] ?? null));
const pokemon = (id: number) => pokemons.find((p) => p.idPokedex === id)!;

describe("capturas de la ficha", () => {
  it("con capturas propias, usa esas y no las de lugares", () => {
    const r = elegirCapturasFicha(pokemon(151), propiasDe(151), imagenDeLugar);
    expect(r?.tipo).toBe("propias");
    expect(r?.capturas.every((c) => c.href === null)).toBe(true);
  });

  it("sin capturas propias, usa hasta 2 lugares donde aparece, enlazados, sin repetir imagen", () => {
    const r = elegirCapturasFicha(pokemon(12), propiasDe(12), imagenDeLugar);
    expect(r?.tipo).toBe("lugares");
    expect(r!.capturas.length).toBeGreaterThan(0);
    expect(r!.capturas.length).toBeLessThanOrEqual(2);
    expect(r!.capturas.every((c) => c.pie.startsWith("Aparece en ") && c.href?.startsWith("/rutas/"))).toBe(true);
    expect(new Set(r!.capturas.map((c) => c.archivo)).size).toBe(r!.capturas.length);
  });

  it("prefiere los lugares de su región de origen y las capturas del juego a las vistas desde arriba", () => {
    const p = pokemon(12);
    const r = elegirCapturasFicha(p, propiasDe(12), imagenDeLugar);
    const primera = p.rutas.find((ruta) => `/rutas/${ruta.idRuta}` === r!.capturas[0].href)!;
    // Butterfree es de Kanto y aparece en lugares de Kanto con captura de Let's Go
    expect(primera.region).toBe("Kanto");
    expect(r!.capturas[0].pixelArt).toBe(false);
  });

  it("sin capturas propias ni lugares con captura, no hay sección", () => {
    expect(elegirCapturasFicha({ region: "Paldea", rutas: [] }, [], imagenDeLugar)).toBeNull();
  });
});
