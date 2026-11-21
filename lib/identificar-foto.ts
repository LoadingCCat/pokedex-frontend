/**
 * F20: el navegador manda la foto (ya reducida) a /api/identificar, el route handler del propio
 * sitio. Nunca llama a la API directamente. Los textos de error salen de identificar-mensajes.ts.
 */
import type { Identificacion } from "./api/tipos";
import { mensajeDeIdentificacion } from "./identificar-mensajes";

/** Fallo al identificar; `message` ya es un texto para el usuario. */
export class ErrorIdentificar extends Error {
  constructor(
    mensaje: string,
    readonly status: number,
  ) {
    super(mensaje);
    this.name = "ErrorIdentificar";
  }
}

/** `signal` cancela la petición (al desmontar la pantalla); entonces lanza el AbortError tal cual. */
export async function enviarFoto(foto: Blob, signal?: AbortSignal): Promise<Identificacion> {
  const cuerpo = new FormData();
  cuerpo.append("foto", foto, "foto.jpg");

  let respuesta: Response;
  try {
    respuesta = await fetch("/api/identificar", { method: "POST", body: cuerpo, signal });
  } catch (e) {
    if (signal?.aborted) throw e;
    throw new ErrorIdentificar(mensajeDeIdentificacion(0), 0);
  }

  if (respuesta.ok) {
    try {
      return (await respuesta.json()) as Identificacion;
    } catch {
      throw new ErrorIdentificar(mensajeDeIdentificacion(502), 502);
    }
  }
  const datos = (await respuesta.json().catch(() => null)) as { mensaje?: unknown } | null;
  const mensajeApi = typeof datos?.mensaje === "string" ? datos.mensaje : undefined;
  throw new ErrorIdentificar(
    // El route handler ya mandó el texto para el usuario; mensajeDeIdentificacion solo conserva
    // los 400 del contrato y descarta cualquier otro texto técnico
    mensajeDeIdentificacion(respuesta.status, mensajeApi),
    respuesta.status,
  );
}
