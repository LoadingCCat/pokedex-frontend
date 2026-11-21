/**
 * F20: el navegador manda la foto aquí y este route handler la reenvía a POST /pokemons/identificar
 * de la API (API_URL). Así el navegador no llama a la API directamente (sin CORS que abrir) y la
 * URL del backend no sale del servidor.
 *
 * Es un route handler y no una server action a propósito: las server actions limitan el cuerpo a
 * 1 MB (subirlo con `serverActions.bodySizeLimit` valdría también para las del panel de admin) y
 * este endpoint, no. Vercel igualmente rechaza cuerpos de más de 4,5 MB antes de llegar aquí;
 * por eso la pantalla reduce la foto a menos de 1,5 MB y aquí se corta en MAX_BYTES_FOTO.
 *
 * Respuestas: 200 con la identificación, o { mensaje } con el status del error y un texto para el usuario.
 */
import { ErrorApi, identificar } from "@/lib/api";
import { MAX_BYTES_FOTO, mensajeDeIdentificacion } from "@/lib/identificar-mensajes";

const error = (status: number, mensajeApi?: string) =>
  Response.json({ mensaje: mensajeDeIdentificacion(status, mensajeApi) }, { status });

export async function POST(request: Request) {
  // Corta antes de leer el cuerpo si el cliente ya declara que es demasiado grande
  const declarado = Number(request.headers.get("content-length"));
  if (declarado > MAX_BYTES_FOTO + 64 * 1024) return error(413);

  let foto: FormDataEntryValue | null;
  try {
    foto = (await request.formData()).get("foto");
  } catch {
    return error(400, "Envía una foto en el campo foto");
  }
  if (!(foto instanceof File) || foto.size === 0) return error(400, "Envía una foto en el campo foto");
  if (foto.size > MAX_BYTES_FOTO) return error(413);

  try {
    return Response.json(await identificar(foto), { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    if (e instanceof ErrorApi) return error(e.status, e.message);
    return error(502);
  }
}
