import { describe, expect, it } from "vitest";
import { textoAviso, hrefConAviso } from "./avisos-admin";
import { validarMovimiento, validarPokemon, type ValoresPokemon } from "./validacion-admin";

const pikachu: ValoresPokemon = {
  idPokedex: "",
  nombre: "",
  generacion: "",
  nombreEs: "Pikachu",
  descripcion: "",
  tipoObtencion: "Salvaje",
  formaObtencion: "",
  altura: "0,4",
  peso: "6",
  tipo1: "electric",
  tipo2: "",
  rutas: "3, 7",
  ps: "35",
  ataque: "55",
  defensa: "40",
  ataqueEspecial: "50",
  defensaEspecial: "50",
  velocidad: "90",
};

describe("validarPokemon (F15 · RF-12)", () => {
  it("un Pokémon válido da el cuerpo para la API", () => {
    const { errores, cuerpo } = validarPokemon(pikachu, false);
    expect(errores).toEqual({});
    expect(cuerpo).toMatchObject({ nombreEs: "Pikachu", altura: 0.4, peso: 6, ataque: 55, tipos: ["electric"], rutas: [3, 7] });
    expect(cuerpo).not.toHaveProperty("idPokedex", expect.anything());
  });

  it("'abc' y '300' en una estadística no se envían y marcan el campo", () => {
    expect(validarPokemon({ ...pikachu, ataque: "abc" }, false)).toEqual({ errores: { ataque: "Debe ser un número entero." } });
    expect(validarPokemon({ ...pikachu, ataque: "300" }, false).errores.ataque).toBe("Debe estar entre 1 y 255.");
    expect(validarPokemon({ ...pikachu, ps: "0" }, false).errores.ps).toBe("Debe estar entre 1 y 255.");
  });

  it("vacíos obligatorios, negativos y tipos repetidos", () => {
    const { errores, cuerpo } = validarPokemon(
      { ...pikachu, nombreEs: " ", peso: "-1", tipo2: "electric", tipoObtencion: "", rutas: "3, x" },
      false,
    );
    expect(cuerpo).toBeUndefined();
    expect(errores).toEqual({
      nombreEs: "Es obligatorio.",
      peso: "No puede ser negativo.",
      tipos: "Los dos tipos deben ser distintos.",
      tipoObtencion: "Elige la forma de obtención.",
      rutas: expect.any(String),
    });
  });

  it("al crear pide número, identificador (slug) y generación", () => {
    expect(validarPokemon(pikachu, true).errores).toEqual({
      idPokedex: "Es obligatorio.",
      nombre: "Es obligatorio.",
      generacion: "Es obligatorio.",
    });
    const { cuerpo } = validarPokemon({ ...pikachu, idPokedex: "2000", nombre: "Mi-Pokemon", generacion: "9" }, true);
    expect(cuerpo).toMatchObject({ idPokedex: 2000, nombre: "mi-pokemon", generacion: 9 });
    expect(validarPokemon({ ...pikachu, idPokedex: "1", nombre: "mi pokemon", generacion: "1" }, true).errores.nombre).toMatch(/guiones/);
  });
});

describe("avisos del panel", () => {
  it("arma y lee el aviso de confirmación; ignora uno inválido", () => {
    const href = hrefConAviso("/admin/pokemon", "eliminado", "Pikachu");
    const parametros = Object.fromEntries(new URL(href, "http://x").searchParams);
    expect(textoAviso(parametros)).toBe("«Pikachu» se eliminó correctamente.");
    expect(textoAviso({ aviso: "hackeado", n: "x" })).toBeNull();
    expect(textoAviso({ aviso: "constructor" })).toBeNull();
    expect(hrefConAviso("/admin/rutas?region=kanto", "creado", "X")).toBe("/admin/rutas?region=kanto&aviso=creado&n=X");
  });
});

describe("validarMovimiento y validarRuta (FE.36, FE.37)", () => {
  const rayo = { nombre: "thunderbolt", nombreEs: "Rayo", tipo: "electric", categoria: "Especial", potencia: "90" };

  it("movimiento válido; potencia vacía = 0; sin nombreEs ni tipo → null", () => {
    expect(validarMovimiento(rayo).cuerpo).toEqual({ ...rayo, potencia: 90 });
    expect(validarMovimiento({ ...rayo, nombreEs: " ", tipo: "", potencia: "" }).cuerpo).toMatchObject({ nombreEs: null, tipo: null, potencia: 0 });
  });

  it("movimiento: nombre vacío, categoría inválida y potencia 'abc' o negativa", () => {
    expect(validarMovimiento({ ...rayo, nombre: "", categoria: "Otra", potencia: "abc" }).errores).toEqual({
      nombre: "Es obligatorio.",
      categoria: "Elige Físico, Especial o Estado.",
      potencia: "Debe ser un número entero.",
    });
    expect(validarMovimiento({ ...rayo, potencia: "-5" }).errores.potencia).toBe("No puede ser negativo.");
  });

});
