/**
 * F15 · RNF-05: /admin y sus subrutas exigen sesión. Sin la cookie, redirige a /login?volver=…
 * Es una comprobación rápida (solo mira que exista la cookie): el layout de /admin vuelve a
 * leer la sesión y el backend verifica el token en cada escritura.
 * Sin API_URL (sitio de Vercel con mock) no redirige: /admin muestra el aviso.
 */
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESION, adminDisponible } from "@/lib/sesion-comun";

export function proxy(request: NextRequest) {
  if (!adminDisponible() || request.cookies.has(COOKIE_SESION)) return NextResponse.next();
  const login = new URL("/login", request.url);
  login.searchParams.set("volver", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
