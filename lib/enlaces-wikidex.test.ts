import { describe, expect, it } from "vitest";
import datos from "../datos/enlaces-wikidex.json";
import { busquedaWikidex, enlaceDeLugar, enlaceDePokemon, enlaceDeRegion } from "./enlaces-wikidex";

describe("enlaces a WikiDex", () => {
  it("cubre los 1025 Pokémon y las 9 regiones con artículos verificados", () => {
    const pokemon = Object.values(datos.pokemon);
    expect(pokemon).toHaveLength(1025);
    expect(pokemon.every((e) => e.tipo === "exacto")).toBe(true);
    expect(Object.values(datos.regiones).every((e) => e.tipo === "exacto")).toBe(true);
  });

  it("todas las URL van a WikiDex: los exactos a /wiki/ y los demás a la búsqueda", () => {
    for (const grupo of [datos.pokemon, datos.lugares, datos.regiones]) {
      for (const e of Object.values(grupo) as { tipo: string; url: string }[]) {
        const prefijo = e.tipo === "exacto" ? "https://www.wikidex.net/wiki/" : "https://www.wikidex.net/index.php?search=";
        expect(e.url.startsWith(prefijo)).toBe(true);
      }
    }
  });

  it("resuelve un Pokémon, un lugar y una región conocidos", () => {
    expect(enlaceDePokemon(25, "pikachu")).toEqual({ tipo: "exacto", url: "https://www.wikidex.net/wiki/Pikachu" });
    expect(enlaceDeRegion("kanto").url).toBe("https://www.wikidex.net/wiki/Kanto");
    const bosque = Object.entries(datos.lugares).find(([, e]) => e.url.endsWith("/Bosque_Verde"));
    expect(bosque).toBeDefined();
    expect(enlaceDeLugar(Number(bosque![0]), "Bosque Verde", "Kanto").tipo).toBe("exacto");
  });

  it("lo que no está en los datos va a la búsqueda", () => {
    expect(enlaceDeLugar(null, "Mi ruta", "Kanto")).toEqual(busquedaWikidex("Mi ruta Kanto"));
    expect(enlaceDeLugar(999999, "Otra", "Johto").url).toBe("https://www.wikidex.net/index.php?search=Otra%20Johto&fulltext=1");
    expect(enlaceDePokemon(99999, "nuevo").tipo).toBe("busqueda");
    expect(enlaceDeRegion("Orre").url).toContain("search=Orre%20regi%C3%B3n");
  });
});
