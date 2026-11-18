/**
 * Mensaje de confirmación del panel (P8 punto 6): tras guardar o borrar se vuelve al listado con
 * `?aviso=creado|guardado|eliminado&n=<nombre>` y el listado lo muestra con role="status".
 */
import { primero, type ParametrosUrl } from "./parametros-url";

const AVISOS = {
  creado: "se creó",
  guardado: "se guardó",
  eliminado: "se eliminó",
} as const;

export type Aviso = keyof typeof AVISOS;

export function hrefConAviso(listado: string, aviso: Aviso, nombre: string): string {
  const parametros = new URLSearchParams({ aviso, n: nombre.slice(0, 100) });
  return `${listado}${listado.includes("?") ? "&" : "?"}${parametros}`;
}

/** Texto del aviso, o null si la URL no trae uno válido. */
export function textoAviso(parametros: ParametrosUrl): string | null {
  const aviso = primero(parametros.aviso);
  if (!aviso || !Object.hasOwn(AVISOS, aviso)) return null;
  const nombre = primero(parametros.n)?.slice(0, 100);
  const accion = AVISOS[aviso as Aviso];
  return nombre ? `«${nombre}» ${accion} correctamente.` : `El registro ${accion} correctamente.`;
}
