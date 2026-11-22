/**
 * N-01 (interventoría 4.3): los Route Handlers (login e identificar) llaman al backend desde el servidor
 * de Next, así que el backend solo vería la IP de Vercel y todos los usuarios compartirían el cupo de
 * los límites de uso. Aquí se arman las cabeceras con la IP real del cliente (la que pone Vercel) y el
 * secreto compartido PROXY_SECRETO, que es lo que permite al backend creer en esa IP.
 *
 * Sin PROXY_SECRETO, o sin IP en la petición, no se manda nada y el backend usa la IP de la conexión.
 * Sin dependencias de Next, para usarlo en los route handlers y en las pruebas.
 */

/** Cabeceras `X-Cliente-IP` y `X-Proxy-Secreto` para la llamada al backend, o `{}` si no aplican. */
export function cabecerasDeProxy(request: Request): Record<string, string> {
  const secreto = process.env.PROXY_SECRETO;
  if (!secreto) return {};
  const ip = ipDelCliente(request);
  if (!ip) return {};
  return { "X-Cliente-IP": ip, "X-Proxy-Secreto": secreto };
}

/** Vercel pone x-real-ip y x-forwarded-for con la IP del cliente (el primer valor, en el segundo caso). */
function ipDelCliente(request: Request): string {
  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
}
