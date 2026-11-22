/**
 * Sesión del panel (F15, P7).
 * - POST { usuario, contrasena }: pide el token a POST /auth/login del backend y lo guarda en una
 *   cookie httpOnly. El token nunca llega al JavaScript del navegador.
 * - DELETE: cierra la sesión (borra la cookie).
 * Las respuestas de error usan { mensaje, campos? }, con textos del tono de voz (sin códigos).
 */
import { borrarSesion, guardarSesion } from "@/lib/sesion";
import { AVISO_SIN_API } from "@/lib/sesion-comun";

type CuerpoLogin = { usuario?: unknown; contrasena?: unknown };

const error = (status: number, mensaje: string, campos?: Record<string, string>) =>
  Response.json(campos ? { mensaje, campos } : { mensaje }, { status });

export async function POST(request: Request) {
  const urlApi = process.env.API_URL;
  if (!urlApi) return error(503, AVISO_SIN_API);

  let cuerpo: CuerpoLogin;
  try {
    cuerpo = (await request.json()) as CuerpoLogin;
  } catch {
    return error(400, "Escribe tu usuario y tu contraseña.");
  }
  const usuario = typeof cuerpo?.usuario === "string" ? cuerpo.usuario.trim() : "";
  const contrasena = typeof cuerpo?.contrasena === "string" ? cuerpo.contrasena : "";
  const campos: Record<string, string> = {};
  if (!usuario) campos.usuario = "Escribe tu usuario.";
  if (!contrasena) campos.contrasena = "Escribe tu contraseña.";
  if (Object.keys(campos).length > 0) return error(400, "Escribe tu usuario y tu contraseña.", campos);

  let respuesta: Response;
  try {
    respuesta = await fetch(`${urlApi.replace(/\/$/, "")}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ usuario, contrasena }),
      cache: "no-store",
    });
  } catch {
    return error(502, "No se pudo conectar con la API. Comprueba que el backend esté arrancado.");
  }
  if (respuesta.status === 401) return error(401, "Usuario o contraseña incorrectos.");
  if (!respuesta.ok) return error(502, "No se pudo iniciar sesión. Vuelve a intentarlo.");

  // S-06: un 200 con un cuerpo que no es JSON (p. ej. HTML de un proxy) no puede acabar en un 500 sin mensaje
  let datos: { token?: string; expiraEn?: string; usuario?: string };
  try {
    datos = (await respuesta.json()) as typeof datos;
  } catch {
    return error(502, "No se pudo iniciar sesión. Vuelve a intentarlo.");
  }
  const expiraEn = new Date(datos.expiraEn ?? "");
  if (!datos.token || Number.isNaN(expiraEn.getTime())) {
    return error(502, "No se pudo iniciar sesión. Vuelve a intentarlo.");
  }
  await guardarSesion(datos.token, expiraEn);
  return Response.json({ usuario: datos.usuario ?? usuario });
}

export async function DELETE() {
  await borrarSesion();
  return new Response(null, { status: 204 });
}
