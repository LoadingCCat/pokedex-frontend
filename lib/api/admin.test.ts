/**
 * S-07 (interventoría): obtenerMovimiento usa el mismo helper que el resto de lib/api: espera
 * con tope de tiempo (AbortSignal) y falla con ErrorApi, no con un Error genérico.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { obtenerMovimiento } from "./admin";
import { ErrorApi } from "./tipos";

describe("obtenerMovimiento", () => {
  beforeEach(() => vi.stubEnv("API_URL", "http://api.prueba/api"));
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("devuelve el movimiento si existe y pide a /movimientos/{id}", async () => {
    const fetchSimulado = vi.fn(async (_url: string | URL, _init?: RequestInit) => Response.json({ idMovimiento: 9, nombre: "thunder-punch" }));
    vi.stubGlobal("fetch", fetchSimulado);

    const movimiento = await obtenerMovimiento(9);

    expect(movimiento?.nombre).toBe("thunder-punch");
    expect(String(fetchSimulado.mock.calls[0][0])).toBe("http://api.prueba/api/movimientos/9");
  });

  it("404 y 400 devuelven null", async () => {
    vi.stubGlobal("fetch", vi.fn(async (_url: string | URL, _init?: RequestInit) => Response.json({ mensaje: "no" }, { status: 404 })));
    expect(await obtenerMovimiento(1)).toBeNull();
    vi.stubGlobal("fetch", vi.fn(async (_url: string | URL, _init?: RequestInit) => Response.json({ mensaje: "no" }, { status: 400 })));
    expect(await obtenerMovimiento(1)).toBeNull();
  });

  it("un 500 lanza ErrorApi con el status y el mensaje de la API", async () => {
    vi.stubGlobal("fetch", vi.fn(async (_url: string | URL, _init?: RequestInit) => Response.json({ mensaje: "Fallo interno" }, { status: 500 })));

    const error = await obtenerMovimiento(1).catch((e) => e);

    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.status).toBe(500);
    expect(error.message).toBe("Fallo interno");
  });

  it("la petición lleva un AbortSignal (tope de espera): no puede colgarse para siempre", async () => {
    const fetchSimulado = vi.fn(async (_url: string | URL, _init?: RequestInit) => Response.json({ idMovimiento: 1 }));
    vi.stubGlobal("fetch", fetchSimulado);

    await obtenerMovimiento(1);

    const opciones = fetchSimulado.mock.calls[0][1] as RequestInit;
    expect(opciones.signal).toBeInstanceOf(AbortSignal);
  });
});
