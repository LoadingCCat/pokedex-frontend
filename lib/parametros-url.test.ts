import { describe, expect, it } from "vitest";
import { conPagina, leerId, leerPagina, primero } from "./parametros-url";

describe("Parámetros comunes de la URL", () => {
  it("primero: primer valor sin espacios; vacío → undefined", () => {
    expect(primero(" kanto ")).toBe("kanto");
    expect(primero(["a", "b"])).toBe("a");
    expect(primero("  ")).toBeUndefined();
    expect(primero(undefined)).toBeUndefined();
  });

  it("leerPagina: empieza en 1; inválido → 1", () => {
    expect(leerPagina({ page: "3" })).toBe(3);
    expect(leerPagina({})).toBe(1);
    expect(leerPagina({ page: "0" })).toBe(1);
    expect(leerPagina({ page: "-2" })).toBe(1);
    expect(leerPagina({ page: "abc" })).toBe(1);
  });

  it("conPagina: sin ?page en la página 1", () => {
    expect(conPagina("/regiones/kanto", 1)).toBe("/regiones/kanto");
    expect(conPagina("/regiones/kanto", 2)).toBe("/regiones/kanto?page=2");
  });

  it("leerId: solo enteros positivos sin ceros a la izquierda", () => {
    expect(leerId("25")).toBe(25);
    expect(leerId("abc")).toBeNull();
    expect(leerId("025")).toBeNull();
    expect(leerId("0")).toBeNull();
    expect(leerId("1.5")).toBeNull();
  });
});
