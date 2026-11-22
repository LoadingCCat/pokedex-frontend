/**
 * T-15 (interventoría 4.2): `escribirApi`, las escrituras del panel (`lib/api/admin.ts`) con `fetch`
 * simulado. (`admin.test.ts` cubre `obtenerMovimiento`.)
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { escribirApi } from "./admin";

type LlamadaFetch = [string | URL, RequestInit];

function simularFetch(respuesta: () => Response | Promise<Response>) {
  const simulado = vi.fn<typeof fetch>(async () => respuesta());
  vi.stubGlobal("fetch", simulado);
  return simulado;
}

describe("escribirApi", () => {
  beforeEach(() => vi.stubEnv("API_URL", "http://api.prueba/api/"));
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("POST con cuerpo: lleva el token en Authorization, Content-Type JSON y el cuerpo serializado", async () => {
    const fetchSimulado = simularFetch(() => Response.json({}, { status: 201 }));

    const r = await escribirApi("tok123", "POST", "/rutas", { nombre: "Ruta X", region: "Kanto" });

    expect(r).toEqual({ ok: true, status: 201 });
    const [url, opciones] = fetchSimulado.mock.calls[0] as LlamadaFetch;
    expect(String(url)).toBe("http://api.prueba/api/rutas"); // sin doble barra
    expect(opciones.method).toBe("POST");
    expect(opciones.headers).toEqual({
      Accept: "application/json",
      Authorization: "Bearer tok123",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(opciones.body as string)).toEqual({ nombre: "Ruta X", region: "Kanto" });
    expect(opciones.signal).toBeInstanceOf(AbortSignal);
  });

  it("DELETE sin cuerpo: no manda Content-Type ni body", async () => {
    const fetchSimulado = simularFetch(() => new Response(null, { status: 204 }));

    const r = await escribirApi("tok", "DELETE", "/pokemons/25");

    expect(r).toEqual({ ok: true, status: 204 });
    const opciones = (fetchSimulado.mock.calls[0] as LlamadaFetch)[1];
    expect(opciones.method).toBe("DELETE");
    expect(opciones.headers).not.toHaveProperty("Content-Type");
    expect(opciones.body).toBeUndefined();
  });

  it("un 400 conserva el mensaje y los `campos` del servidor", async () => {
    simularFetch(() => Response.json({ mensaje: "Revisa los datos", campos: { ps: "Entre 1 y 255" } }, { status: 400 }));

    const r = await escribirApi("tok", "PUT", "/pokemons/25", { ps: 300 });

    expect(r).toEqual({ ok: false, status: 400, mensaje: "Revisa los datos", campos: { ps: "Entre 1 y 255" } });
  });

  it("un error con cuerpo que no es JSON devuelve solo el status", async () => {
    simularFetch(() => new Response("<html>caído</html>", { status: 502 }));

    expect(await escribirApi("tok", "PUT", "/rutas/1", {})).toEqual({ ok: false, status: 502 });
  });

  it("un fallo de red o un tiempo agotado se devuelve como status 0 (no lanza)", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("fetch failed"); }));

    expect(await escribirApi("tok", "POST", "/rutas", {})).toEqual({ ok: false, status: 0 });
  });

  it("sin API_URL no llama a la red (el panel no debería llegar aquí) y no deja escapar una excepción", async () => {
    vi.stubEnv("API_URL", "");
    const fetchSimulado = simularFetch(() => Response.json({}));

    expect(await escribirApi("tok", "POST", "/rutas", {})).toEqual({ ok: false, status: 0 });
    expect(fetchSimulado).not.toHaveBeenCalled();
  });
});
