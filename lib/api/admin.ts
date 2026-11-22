/**
 * Escrituras del panel (F15) contra la API real, con el token de la sesión en `Authorization`.
 * Solo existe con API_URL (sin ella el panel muestra el aviso y no llega aquí). Lo usan las
 * server actions de app/admin; nunca el navegador.
 */
import "server-only";
import { pedirApi, TIEMPO_ESPERA_MS } from "./http";
import { ErrorApi, type Movimiento } from "./tipos";

export type RespuestaEscritura =
  | { ok: true; status: number }
  | { ok: false; status: number; mensaje?: string; campos?: Record<string, string> };

function base(): string {
  const url = process.env.API_URL;
  if (!url) throw new Error("API_URL no está definida");
  return url.replace(/\/$/, "");
}

/** POST, PUT o DELETE con el token (espera hasta 180 s, como las lecturas). Un fallo de red o un tiempo agotado se devuelve como status 0. */
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
      signal: AbortSignal.timeout(TIEMPO_ESPERA_MS),
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

/** GET /movimientos/{id} (el resto de pantallas no lo necesita). null si no existe. Mismo tope de espera y ErrorApi que lib/api/http.ts (S-07). */
export async function obtenerMovimiento(id: number): Promise<Movimiento | null> {
  try {
    return await pedirApi<Movimiento>(base(), `/movimientos/${id}`);
  } catch (error) {
    if (error instanceof ErrorApi && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}
