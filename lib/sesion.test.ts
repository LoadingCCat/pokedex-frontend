/**
 * T-15 (interventoría 4.2): `lib/sesion.ts`, la cookie httpOnly con el token. Con `next/headers`
 * simulado: se comprueba lo que se lee, lo que se guarda y con qué opciones de seguridad.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookies = vi.hoisted(() => ({ get: vi.fn(), set: vi.fn(), delete: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/server", () => ({ connection: vi.fn(async () => undefined) }));
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => cookies) }));

import { borrarSesion, guardarSesion, leerSesion } from "./sesion";
import { COOKIE_SESION } from "./sesion-comun";

/** JWT sin firma verdadera: solo importan `sub` y `exp`, que es lo que lee el front. */
function token(sub: string, expEnSegundos: number): string {
  const codificar = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${codificar({ alg: "HS256" })}.${codificar({ sub, exp: expEnSegundos })}.firma`;
}

describe("lib/sesion", () => {
  beforeEach(() => Object.values(cookies).forEach((m) => m.mockReset()));
  afterEach(() => vi.unstubAllEnvs());

  describe("leerSesion", () => {
    it("sin cookie devuelve null", async () => {
      cookies.get.mockReturnValue(undefined);

      expect(await leerSesion()).toBeNull();
      expect(cookies.get).toHaveBeenCalledWith(COOKIE_SESION);
    });

    it("con un token vigente devuelve el token y el usuario", async () => {
      const t = token("admin", Math.floor(Date.now() / 1000) + 3600);
      cookies.get.mockReturnValue({ value: t });

      expect(await leerSesion()).toEqual({ token: t, usuario: "admin" });
    });

    it("con un token vencido devuelve null (no se usa un token ya vencido)", async () => {
      cookies.get.mockReturnValue({ value: token("admin", Math.floor(Date.now() / 1000) - 60) });

      expect(await leerSesion()).toBeNull();
    });

    it("con un valor que no es un JWT devuelve null", async () => {
      cookies.get.mockReturnValue({ value: "cualquier-cosa" });

      expect(await leerSesion()).toBeNull();
    });
  });

  describe("guardarSesion", () => {
    it("guarda el token en una cookie httpOnly, sameSite=lax, en toda la web y hasta que vence", async () => {
      const vence = new Date(Date.now() + 3_600_000);

      await guardarSesion("tok", vence);

      expect(cookies.set).toHaveBeenCalledWith(
        COOKIE_SESION,
        "tok",
        expect.objectContaining({ httpOnly: true, sameSite: "lax", path: "/", expires: vence }),
      );
    });

    it("`secure` solo en producción", async () => {
      vi.stubEnv("NODE_ENV", "production");
      await guardarSesion("tok", new Date());
      expect(cookies.set.mock.calls[0][2].secure).toBe(true);

      cookies.set.mockReset();
      vi.stubEnv("NODE_ENV", "development");
      await guardarSesion("tok", new Date());
      expect(cookies.set.mock.calls[0][2].secure).toBe(false);
    });
  });

  it("borrarSesion elimina la cookie de sesión", async () => {
    await borrarSesion();

    expect(cookies.delete).toHaveBeenCalledWith(COOKIE_SESION);
  });
});
