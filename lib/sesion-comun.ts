/**
 * Piezas de la sesión del panel (F15) que no dependen de Next: las usan proxy.ts, el route
 * handler de /api/sesion, lib/sesion.ts y las pruebas.
 */

/** Cookie httpOnly con el JWT del backend. El navegador la guarda, pero el JavaScript no la ve. */
export const COOKIE_SESION = "pokedex_sesion";

export const AVISO_SIN_API =
  "La administración solo funciona con la API local. Este sitio usa datos de ejemplo y no se pueden modificar.";

/** ¿Hay API real (API_URL)? Con el mock (Vercel) no: lo que necesita la API muestra un aviso. */
export function apiDisponible(): boolean {
  return Boolean(process.env.API_URL);
}

/** El panel solo existe si hay API real (API_URL); en Vercel, con el mock, no. */
export function adminDisponible(): boolean {
  return apiDisponible();
}

/**
 * Adónde volver tras iniciar sesión: solo rutas del panel ("/admin…"), para que un enlace
 * con ?volver=https://otro-sitio no saque al usuario de Pokedex+.
 */
export function destinoSeguro(volver: string | null | undefined): string {
  if (!volver || !/^\/admin(?:[/?#]|$)/.test(volver) || volver.startsWith("//")) return "/admin";
  return volver;
}

/**
 * Usuario y vencimiento del JWT, leídos sin verificar la firma: solo sirven para mostrar quién
 * inició sesión y para no usar un token ya vencido. Quien verifica la firma es el backend, en
 * cada escritura. Un token mal formado o vencido → null.
 */
export function datosDelToken(token: string, ahora = Date.now()): { usuario: string; venceEn: Date } | null {
  const partes = token.split(".");
  if (partes.length !== 3) return null;
  try {
    const carga = JSON.parse(Buffer.from(partes[1], "base64url").toString("utf8")) as { sub?: unknown; exp?: unknown };
    if (typeof carga.sub !== "string" || typeof carga.exp !== "number") return null;
    const venceEn = new Date(carga.exp * 1000);
    return venceEn.getTime() > ahora ? { usuario: carga.sub, venceEn } : null;
  } catch {
    return null;
  }
}
