/**
 * T-15 (interventoría 4.2): el resto de casos de /api/sesion (login y cierre de sesión) que
 * `route.test.ts` no cubre: sin API_URL, cuerpo roto, campos vacíos, fallos del backend y DELETE.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sesion = vi.hoisted(() => ({ guardarSesion: vi.fn(), borrarSesion: vi.fn() }));
vi.mock("@/lib/sesion", () => sesion);

import { DELETE, POST } from "./route";
import { AVISO_SIN_API } from "@/lib/sesion-comun";

const peticion = (cuerpo: string) => new Request("http://localhost/api/sesion", { method: "POST", body: cuerpo });
const credenciales = JSON.stringify({ usuario: "admin", contrasena: "clave" });

describe("POST /api/sesion · casos que faltaban", () => {
  beforeEach(() => {
    vi.stubEnv("API_URL", "http://api.prueba/api");
    sesion.guardarSesion.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("sin API_URL responde 503 con el aviso y no llama al backend", async () => {
    vi.stubEnv("API_URL", "");
    const fetchSimulado = vi.fn();
    vi.stubGlobal("fetch", fetchSimulado);

    const r = await POST(peticion(credenciales));

    expect(r.status).toBe(503);
    expect((await r.json()).mensaje).toBe(AVISO_SIN_API);
    expect(fetchSimulado).not.toHaveBeenCalled();
  });

  it("un cuerpo que no es JSON responde 400", async () => {
    const r = await POST(peticion("esto no es json"));

    expect(r.status).toBe(400);
    expect((await r.json()).mensaje).toBe("Escribe tu usuario y tu contraseña.");
  });

  it("usuario y contraseña vacíos responden 400 con el mensaje junto a cada campo, sin llamar al backend", async () => {
    const fetchSimulado = vi.fn();
    vi.stubGlobal("fetch", fetchSimulado);

    const r = await POST(peticion(JSON.stringify({ usuario: "   ", contrasena: "" })));

    expect(r.status).toBe(400);
    expect((await r.json()).campos).toEqual({ usuario: "Escribe tu usuario.", contrasena: "Escribe tu contraseña." });
    expect(fetchSimulado).not.toHaveBeenCalled();
  });

  it("un campo que no es texto cuenta como vacío", async () => {
    const r = await POST(peticion(JSON.stringify({ usuario: 123, contrasena: { x: 1 } })));

    expect(r.status).toBe(400);
    expect(Object.keys((await r.json()).campos)).toEqual(["usuario", "contrasena"]);
  });

  it("reenvía al backend el usuario sin espacios, a /auth/login, sin Authorization", async () => {
    const expiraEn = new Date(Date.now() + 3_600_000).toISOString();
    const fetchSimulado = vi.fn<typeof fetch>(async () => Response.json({ token: "t", expiraEn, usuario: "admin" }));
    vi.stubGlobal("fetch", fetchSimulado);

    await POST(peticion(JSON.stringify({ usuario: "  admin  ", contrasena: "clave" })));

    expect(String(fetchSimulado.mock.calls[0][0])).toBe("http://api.prueba/api/auth/login");
    const opciones = fetchSimulado.mock.calls[0][1] as RequestInit;
    expect(opciones.method).toBe("POST");
    expect(JSON.parse(opciones.body as string)).toEqual({ usuario: "admin", contrasena: "clave" });
    expect(opciones.headers).not.toHaveProperty("Authorization");
    expect(sesion.guardarSesion).toHaveBeenCalledWith("t", new Date(expiraEn));
  });

  it("si el backend no responde (fetch lanza), 502 con mensaje y sin guardar sesión", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("fetch failed"); }));

    const r = await POST(peticion(credenciales));

    expect(r.status).toBe(502);
    expect((await r.json()).mensaje).toMatch(/No se pudo conectar con la API/);
    expect(sesion.guardarSesion).not.toHaveBeenCalled();
  });

  it("un error del backend distinto de 401 y 429 (p. ej. 500) responde 502 con mensaje", async () => {
    for (const status of [500, 503]) {
      vi.stubGlobal("fetch", vi.fn(async () => Response.json({ mensaje: "x" }, { status })));

      const r = await POST(peticion(credenciales));

      expect(r.status).toBe(502);
      expect((await r.json()).mensaje).toBe("No se pudo iniciar sesión. Vuelve a intentarlo.");
    }
    expect(sesion.guardarSesion).not.toHaveBeenCalled();
  });

  // N-02 (interventoría 4.3): el 429 del límite de intentos no es un fallo del servidor
  it("el 429 del backend responde 429 con «Demasiados intentos. Espera un minuto» y no guarda sesión", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ mensaje: "x" }, { status: 429, headers: { "Retry-After": "60" } })));

    const r = await POST(peticion(credenciales));

    expect(r.status).toBe(429);
    expect((await r.json()).mensaje).toBe("Demasiados intentos. Espera un minuto");
    expect(sesion.guardarSesion).not.toHaveBeenCalled();
  });

  // N-01: la IP real del cliente viaja al backend con el secreto del proxy
  it("con PROXY_SECRETO reenvía X-Cliente-IP y X-Proxy-Secreto; sin él, ninguna de las dos", async () => {
    const expiraEn = new Date(Date.now() + 3_600_000).toISOString();
    const fetchSimulado = vi.fn<typeof fetch>(async () => Response.json({ token: "t", expiraEn, usuario: "admin" }));
    vi.stubGlobal("fetch", fetchSimulado);
    const conIp = () =>
      new Request("http://localhost/api/sesion", { method: "POST", body: credenciales, headers: { "x-real-ip": "203.0.113.7" } });

    vi.stubEnv("PROXY_SECRETO", "secreto-del-proxy-0123456789");
    await POST(conIp());
    const con = (fetchSimulado.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(con["X-Cliente-IP"]).toBe("203.0.113.7");
    expect(con["X-Proxy-Secreto"]).toBe("secreto-del-proxy-0123456789");

    vi.stubEnv("PROXY_SECRETO", "");
    await POST(conIp());
    const sin = (fetchSimulado.mock.calls[1][1] as RequestInit).headers as Record<string, string>;
    expect(sin).not.toHaveProperty("X-Cliente-IP");
    expect(sin).not.toHaveProperty("X-Proxy-Secreto");
  });

  it("el 401 del backend responde «Usuario o contraseña incorrectos.» y no guarda sesión", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ mensaje: "x" }, { status: 401 })));

    const r = await POST(peticion(credenciales));

    expect((await r.json()).mensaje).toBe("Usuario o contraseña incorrectos.");
    expect(sesion.guardarSesion).not.toHaveBeenCalled();
  });

  it.each([
    ["sin token", { expiraEn: "2999-01-01T00:00:00Z", usuario: "admin" }],
    ["con un vencimiento inválido", { token: "t", expiraEn: "mañana", usuario: "admin" }],
    ["sin vencimiento", { token: "t", usuario: "admin" }],
  ])("un 200 %s responde 502 y no guarda sesión", async (_caso, cuerpo) => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json(cuerpo)));

    const r = await POST(peticion(credenciales));

    expect(r.status).toBe(502);
    expect(sesion.guardarSesion).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/sesion", () => {
  it("borra la cookie de sesión y responde 204", async () => {
    sesion.borrarSesion.mockReset();

    const r = await DELETE();

    expect(r.status).toBe(204);
    expect(sesion.borrarSesion).toHaveBeenCalledOnce();
  });
});
