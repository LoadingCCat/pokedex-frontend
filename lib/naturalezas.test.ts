import { describe, expect, it } from "vitest";
import { ETIQUETAS_ESTADISTICA, NATURALEZAS, esNeutra } from "./naturalezas";

describe("naturalezas (F19)", () => {
  it("son 25, con nombres únicos, y 5 neutras", () => {
    expect(NATURALEZAS).toHaveLength(25);
    expect(new Set(NATURALEZAS.map((n) => n.nombreEs)).size).toBe(25);
    expect(NATURALEZAS.filter(esNeutra).map((n) => n.nombreEs)).toEqual(["Fuerte", "Dócil", "Seria", "Tímida", "Rara"]);
  });

  it("cada estadística sube en 4 y baja en 4; ninguna sube y baja la misma", () => {
    for (const e of Object.keys(ETIQUETAS_ESTADISTICA)) {
      expect(NATURALEZAS.filter((n) => n.sube === e)).toHaveLength(4);
      expect(NATURALEZAS.filter((n) => n.baja === e)).toHaveLength(4);
    }
    expect(NATURALEZAS.every((n) => esNeutra(n) ? n.baja === null : n.sube !== n.baja)).toBe(true);
  });

  it("Firme y Miedosa", () => {
    expect(NATURALEZAS.find((n) => n.nombreEs === "Firme")).toMatchObject({ sube: "ataque", baja: "ataqueEspecial" });
    expect(NATURALEZAS.find((n) => n.nombreEs === "Miedosa")).toMatchObject({ sube: "velocidad", baja: "ataque" });
  });
});
