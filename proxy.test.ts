/**
 * T-12 / T-15 (interventoría 4.2) · F15: /admin sin sesión redirige a /login y recuerda adónde volver;
 * sin API_URL (sitio con mock) no redirige y /admin muestra su aviso.
 */
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { proxy, config } from "./proxy";
import { COOKIE_SESION } from "@/lib/sesion-comun";

function peticion(ruta: string, conCookie = false): NextRequest {
  return new NextRequest(`http://localhost:3000${ruta}`, {
    headers: conCookie ? { cookie: `${COOKIE_SESION}=token` } : {},
  });
}

describe("proxy de /admin", () => {
  afterEach(() => vi.unstubAllEnvs());

  describe("con API_URL", () => {
    beforeEach(() => vi.stubEnv("API_URL", "http://api.prueba/api"));

    it("sin cookie de sesión redirige a /login?volver=/admin", () => {
      const respuesta = proxy(peticion("/admin"));

      expect(respuesta.status).toBe(307);
      const destino = new URL(respuesta.headers.get("location")!);
      expect(destino.pathname).toBe("/login");
      expect(destino.searchParams.get("volver")).toBe("/admin");
    });

    it("la ruta y la búsqueda de la subpágina viajan en «volver»", () => {
      const respuesta = proxy(peticion("/admin/pokemon?page=2"));

      const destino = new URL(respuesta.headers.get("location")!);
      expect(destino.pathname).toBe("/login");
      expect(destino.searchParams.get("volver")).toBe("/admin/pokemon?page=2");
    });

    it("con la cookie de sesión deja pasar (sin redirección)", () => {
      const respuesta = proxy(peticion("/admin", true));

      expect(respuesta.headers.get("location")).toBeNull();
      expect(respuesta.headers.get("x-middleware-next")).toBe("1");
    });
  });

  it("sin API_URL no redirige aunque no haya cookie: /admin muestra el aviso", () => {
    vi.stubEnv("API_URL", "");

    const respuesta = proxy(peticion("/admin"));

    expect(respuesta.headers.get("location")).toBeNull();
    expect(respuesta.headers.get("x-middleware-next")).toBe("1");
  });

  it("solo vigila /admin y sus subrutas", () => {
    expect(config.matcher).toEqual(["/admin", "/admin/:path*"]);
  });
});
