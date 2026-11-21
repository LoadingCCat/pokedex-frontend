/**
 * F20: de un error de POST /pokemons/identificar al mensaje que ve el usuario. Sin códigos ni
 * textos técnicos. Los textos del 400, 422, 429 y 502 son los de ../pokedex-backend/docs/contratos/api.md.
 * Sin dependencias de Next, para que lo usen el route handler, la pantalla y las pruebas.
 */
import { MENSAJE_IDENTIFICAR_NO_DISPONIBLE } from "./api/tipos";

/** Peso máximo que acepta /api/identificar. La pantalla (3.2) reduce la foto a menos de 1,5 MB. */
export const MAX_BYTES_FOTO = 2 * 1024 * 1024;

/** Los tres 400 del contrato: cada uno dice qué corregir, así que se conserva su texto. */
const MENSAJES_400 = [
  "Envía una foto en el campo foto",
  "La foto debe ser JPG, PNG o WEBP",
  "La foto pesa más de 5 MB",
];

const MENSAJES: Record<number, string> = {
  0: "No pudimos conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
  413: "La foto pesa demasiado. Prueba con otra más pequeña.",
  422: "No reconocimos un Pokémon en la foto. Prueba con otra más clara",
  429: "Demasiadas fotos seguidas. Espera un minuto",
  502: "El reconocimiento no está disponible en este momento",
  503: MENSAJE_IDENTIFICAR_NO_DISPONIBLE,
  504: "El servidor tardó demasiado en responder. Inténtalo de nuevo en un momento.",
};

const GENERICO = "No pudimos identificar la foto. Inténtalo de nuevo.";

/** `mensajeApi` solo cuenta en el 400; en los demás códigos manda el texto fijo de arriba. */
export function mensajeDeIdentificacion(status: number, mensajeApi?: string): string {
  if (status === 400) {
    return MENSAJES_400.find((m) => m === mensajeApi?.trim()) ?? "No pudimos leer la foto. Prueba con otra.";
  }
  return MENSAJES[status] ?? GENERICO;
}
