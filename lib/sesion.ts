/**
 * Sesión del panel en el servidor (F15). El token vive en una cookie httpOnly: lo leen solo
 * los componentes de servidor, las server actions y los route handlers, nunca el navegador.
 */
import "server-only";
import { connection } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_SESION, datosDelToken } from "./sesion-comun";

export type Sesion = { token: string; usuario: string };

/** La sesión actual, o null si no hay cookie o el token ya venció. */
export async function leerSesion(): Promise<Sesion | null> {
  await connection(); // fuerza lectura en tiempo de petición (Date.now() al validar el vencimiento)
  const token = (await cookies()).get(COOKIE_SESION)?.value;
  if (!token) return null;
  const datos = datosDelToken(token);
  return datos ? { token, usuario: datos.usuario } : null;
}

/** Guarda el token hasta que vence. `Secure` en producción (en localhost los navegadores lo aceptan igual). */
export async function guardarSesion(token: string, expiraEn: Date): Promise<void> {
  (await cookies()).set(COOKIE_SESION, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiraEn,
  });
}

export async function borrarSesion(): Promise<void> {
  (await cookies()).delete(COOKIE_SESION);
}
