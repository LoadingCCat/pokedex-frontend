import { describe, expect, it } from "vitest";
import { ATAQUE, efectividadContra, multiplicador, TIPOS } from "./efectividad-tipos";
import { TIPOS_POKEMON } from "./tipos-pokemon";

const grupos = (tipos: string[]) => Object.fromEntries(efectividadContra(tipos).map((g) => [g.valor, [...g.tipos].sort()]));

describe("efectividad de tipos (F19)", () => {
  it("la tabla cubre los 18 tipos (18 × 18) y solo nombra tipos que existen", () => {
    expect(TIPOS.sort()).toEqual(Object.keys(TIPOS_POKEMON).sort());
    for (const a of TIPOS) {
      const { doble, mitad, nulo } = ATAQUE[a];
      for (const d of [...doble, ...mitad, ...nulo]) expect(TIPOS).toContain(d);
      expect(TIPOS.map((d) => multiplicador(a, d))).toHaveLength(18);
    }
  });

  it("Charizard (Fuego/Volador)", () => {
    expect(grupos(["fire", "flying"])).toEqual({
      4: ["rock"],
      2: ["electric", "water"],
      0.5: ["fairy", "fighting", "fire", "steel"],
      0.25: ["bug", "grass"],
      0: ["ground"],
    });
  });

  it("Pikachu (Eléctrico)", () => {
    expect(grupos(["electric"])).toEqual({ 2: ["ground"], 0.5: ["electric", "flying", "steel"] });
  });

  it("Gengar (Fantasma/Veneno)", () => {
    expect(grupos(["ghost", "poison"])).toEqual({
      2: ["dark", "ghost", "ground", "psychic"],
      0.5: ["fairy", "grass"],
      0.25: ["bug", "poison"],
      0: ["fighting", "normal"],
    });
  });

  it("sin tipos conocidos no hay grupos", () => {
    expect(efectividadContra([])).toEqual([]);
    expect(efectividadContra(["shadow"])).toEqual([]);
  });
});
