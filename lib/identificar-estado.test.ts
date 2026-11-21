/** F20 (front) · estados de /identificar: carga, resultado, error y reinicio. */
import { describe, expect, it } from "vitest";
import type { Identificacion } from "./api/tipos";
import { ESPERA_LENTA_MS, ESTADO_INICIAL, reductorIdentificar, type EstadoIdentificar } from "./identificar-estado";

const DATOS = { identificado: { idPokedex: 4 }, confianza: 0.9, similares: [] } as unknown as Identificacion;

const analizando: EstadoIdentificar = { fase: "analizando", lento: false };

describe("F20 · estados de la pantalla", () => {
  it("empieza inactivo", () => {
    expect(ESTADO_INICIAL).toEqual({ fase: "inactivo" });
  });

  it("carga: analizar pasa a analizando, y a los 5 s se marca como lento", () => {
    expect(ESPERA_LENTA_MS).toBe(5000);
    const a = reductorIdentificar(ESTADO_INICIAL, { tipo: "analizar" });
    expect(a).toEqual({ fase: "analizando", lento: false });
    expect(reductorIdentificar(a, { tipo: "lento" })).toEqual({ fase: "analizando", lento: true });
  });

  it("un segundo envío mientras se analiza se ignora (y no borra el aviso de lento)", () => {
    const lento: EstadoIdentificar = { fase: "analizando", lento: true };
    expect(reductorIdentificar(lento, { tipo: "analizar" })).toBe(lento);
  });

  it("resultado: éxito desde analizando guarda los datos", () => {
    expect(reductorIdentificar(analizando, { tipo: "exito", datos: DATOS })).toEqual({ fase: "resultado", datos: DATOS });
  });

  it("error: fallo desde analizando guarda el mensaje", () => {
    expect(reductorIdentificar(analizando, { tipo: "fallo", mensaje: "No reconocimos un Pokémon" })).toEqual({
      fase: "error",
      mensaje: "No reconocimos un Pokémon",
    });
  });

  it("una respuesta tardía no pisa un estado que ya cambió (aviso de lento, éxito o fallo sueltos)", () => {
    expect(reductorIdentificar(ESTADO_INICIAL, { tipo: "lento" })).toBe(ESTADO_INICIAL);
    expect(reductorIdentificar(ESTADO_INICIAL, { tipo: "exito", datos: DATOS })).toBe(ESTADO_INICIAL);
    expect(reductorIdentificar(ESTADO_INICIAL, { tipo: "fallo", mensaje: "x" })).toBe(ESTADO_INICIAL);
  });

  it("elegir otra foto tras un resultado o un error vuelve a inactivo y limpia lo anterior", () => {
    const resultado: EstadoIdentificar = { fase: "resultado", datos: DATOS };
    const error: EstadoIdentificar = { fase: "error", mensaje: "x" };
    expect(reductorIdentificar(resultado, { tipo: "elegir" })).toEqual({ fase: "inactivo" });
    expect(reductorIdentificar(error, { tipo: "elegir" })).toEqual({ fase: "inactivo" });
    expect(reductorIdentificar(error, { tipo: "reiniciar" })).toEqual({ fase: "inactivo" });
  });

  it("no se puede elegir otra foto ni reiniciar en medio de un análisis", () => {
    expect(reductorIdentificar(analizando, { tipo: "elegir" })).toBe(analizando);
    expect(reductorIdentificar(analizando, { tipo: "reiniciar" })).toBe(analizando);
  });
});
