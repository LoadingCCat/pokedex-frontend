/**
 * F20: estados de la pantalla /identificar y sus transiciones. Sin React ni navegador, para
 * poder probarlas en Node.
 */
import type { Identificacion } from "./api/tipos";

/** Pasados estos ms analizando, se avisa de que el servidor puede estar despertando (Render gratuito). */
export const ESPERA_LENTA_MS = 5000;

export const MENSAJE_ESPERA_LENTA = "Despertando el servidor, puede tardar hasta un minuto…";

export type EstadoIdentificar =
  | { fase: "inactivo" }
  | { fase: "analizando"; lento: boolean }
  | { fase: "resultado"; datos: Identificacion }
  | { fase: "error"; mensaje: string };

export type AccionIdentificar =
  | { tipo: "elegir" }
  | { tipo: "analizar" }
  | { tipo: "lento" }
  | { tipo: "exito"; datos: Identificacion }
  | { tipo: "fallo"; mensaje: string }
  | { tipo: "reiniciar" };

export const ESTADO_INICIAL: EstadoIdentificar = { fase: "inactivo" };

export function reductorIdentificar(estado: EstadoIdentificar, accion: AccionIdentificar): EstadoIdentificar {
  switch (accion.tipo) {
    case "analizar":
      // Un segundo envío mientras se analiza se ignora
      return estado.fase === "analizando" ? estado : { fase: "analizando", lento: false };
    case "lento":
      return estado.fase === "analizando" ? { fase: "analizando", lento: true } : estado;
    case "exito":
      return estado.fase === "analizando" ? { fase: "resultado", datos: accion.datos } : estado;
    case "fallo":
      return estado.fase === "analizando" ? { fase: "error", mensaje: accion.mensaje } : estado;
    case "elegir": // otra foto: se limpia el resultado o el error anterior
    case "reiniciar":
      return estado.fase === "analizando" ? estado : ESTADO_INICIAL;
  }
}
