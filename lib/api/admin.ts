/**
 * Escrituras del panel (F15) contra la API real, con el token de la sesión en `Authorization`.
 * Solo existe con API_URL (sin ella el panel muestra el aviso y no llega aquí). Lo usan las
 * server actions de app/admin; nunca el navegador.
 */
import "server-only";
import type { Movimiento } from "./tipos";

export type RespuestaEscritura =
  | { ok: true; status: number }
  | { ok: false; status: number; mensaje?: string; campos?: Record<string, string> };

function base(): string {
  const url = process.env.API_URL;
  if (!url) throw new Error("API_URL no está definida");
  return url.replace(/\/$/, "");
}

/** POST, PUT o DELETE con el token. Un fallo de red se devuelve como status 0. */
export async function escribirApi(
  token: string,
  metodo: "POST" | "PUT" | "DELETE",
  ruta: string,
  cuerpo?: unknown,
): Promise<RespuestaEscritura> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${base()}${ruta}`, {
      method: metodo,
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        ...(cuerpo === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      cache: "no-store",
    });
  } catch {
    return { ok: false, status: 0 };
  }
  if (respuesta.ok) return { ok: true, status: respuesta.status };
  try {
    const error = (await respuesta.json()) as { mensaje?: string; campos?: Record<string, string> };
    return { ok: false, status: respuesta.status, mensaje: error.mensaje, campos: error.campos };
  } catch {
    return { ok: false, status: respuesta.status };
  }
}

/** GET /movimientos/{id} (el resto de pantallas no lo necesita). null si no existe. */
export async function obtenerMovimiento(id: number): Promise<Movimiento | null> {
  const respuesta = await fetch(`${base()}/movimientos/${id}`, { headers: { Accept: "application/json" }, cache: "no-store" });
  if (respuesta.status === 404 || respuesta.status === 400) return null;
  if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
  return (await respuesta.json()) as Movimiento;
}
