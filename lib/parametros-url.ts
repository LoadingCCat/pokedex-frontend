/** Lectura de parámetros de la URL comunes a varias pantallas. */

export type ParametrosUrl = Record<string, string | string[] | undefined>;

/** Primer valor no vacío de un parámetro (sin espacios alrededor). */
export function primero(valor: string | string[] | undefined): string | undefined {
  const texto = (Array.isArray(valor) ? valor[0] : valor)?.trim();
  return texto ? texto : undefined;
}

/** `?page=` empieza en 1 en la URL; inválido o ausente → 1. */
export function leerPagina(parametros: ParametrosUrl): number {
  const texto = primero(parametros.page);
  const pagina = texto && /^\d+$/.test(texto) ? Number(texto) : 1;
  return pagina >= 1 ? pagina : 1;
}

/** `ruta` con `?page=n` (sin el parámetro en la página 1). */
export function conPagina(ruta: string, pagina: number): string {
  return pagina > 1 ? `${ruta}?page=${pagina}` : ruta;
}

/** Id numérico positivo de un segmento de la URL ("25" → 25; "abc", "025", "0" → null). */
export function leerId(texto: string): number | null {
  return /^[1-9]\d*$/.test(texto) ? Number(texto) : null;
}
