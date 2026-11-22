/**
 * S-06 (interventoría): el login del panel nunca deja escapar un 500 sin mensaje. Si el backend
 * responde 200 con un cuerpo que no es JSON, la ruta contesta 502 con texto.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const guardarSesion = vi.hoisted(() => vi.fn());
vi.mock("@/lib/sesion", () => ({ guardarSesion, borrarSesion: vi.fn() }));

import { POST } from "./route";

function peticion(cuerpo: unknown): Request {
  return new Request("http://localhost/api/sesion", { method: "POST", body: JSON.stringify(cuerpo) });
}

describe("POST /api/sesion", () => {
  beforeEach(() => {
    vi.stubEnv("API_URL", "http://api.prueba/api");
    guardarSesion.mockReset();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  const credenciales = { usuario: "admin", contrasena: "clave" };

  it("200 del backend con HTML en vez de JSON: responde 502 con mensaje y no guarda sesión", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("<html>Bad gateway</html>", { status: 200 })));

    const respuesta = await POST(peticion(credenciales));

    expect(respuesta.status).toBe(502);
    expect((await respuesta.json()).mensaje).toBe("No se pudo iniciar sesión. Vuelve a intentarlo.");
    expect(guardarSesion).not.toHaveBeenCalled();
  });

  it("200 del backend con cuerpo vacío: también 502 con mensaje", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 200 })));

    const respuesta = await POST(peticion(credenciales));

    expect(respuesta.status).toBe(502);
    expect((await respuesta.json()).mensaje).toBeTruthy();
  });

  it("200 con JSON válido: guarda la sesión y responde el usuario", async () => {
    const expiraEn = new Date(Date.now() + 3_600_000).toISOString();
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ token: "t", expiraEn, usuario: "admin" })));

    const respuesta = await POST(peticion(credenciales));

    expect(respuesta.status).toBe(200);
    expect(await respuesta.json()).toEqual({ usuario: "admin" });
    expect(guardarSesion).toHaveBeenCalledOnce();
  });

  it("401 del backend: mensaje de credenciales incorrectas", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ mensaje: "x" }, { status: 401 })));

    const respuesta = await POST(peticion(credenciales));

    expect(respuesta.status).toBe(401);
  });
});
