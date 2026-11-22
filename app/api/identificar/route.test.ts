/**
 * N-01 (interventoría 4.3): /api/identificar reenvía al backend la IP real del cliente (X-Cliente-IP) con
 * el secreto del proxy, para que el límite de 10 fotos por minuto sea por cliente y no de todo Vercel.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const identificar = vi.hoisted(() => vi.fn());
vi.mock("@/lib/api", () => {
  class ErrorApi extends Error {
    constructor(
      readonly status: number,
      mensaje: string,
    ) {
      super(mensaje);
    }
  }
  return { identificar, ErrorApi };
});

import { POST } from "./route";
import { ErrorApi } from "@/lib/api";

const SECRETO = "secreto-del-proxy-0123456789";

function peticion(ip?: string): Request {
  const cuerpo = new FormData();
  cuerpo.append("foto", new File([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], "foto.jpg", { type: "image/jpeg" }));
  return new Request("http://localhost/api/identificar", {
    method: "POST",
    body: cuerpo,
    headers: ip ? { "x-real-ip": ip } : {},
  });
}

describe("POST /api/identificar · IP del cliente", () => {
  beforeEach(() => {
    identificar.mockReset();
    identificar.mockResolvedValue({ confianza: 0.9 });
  });
  afterEach(() => vi.unstubAllEnvs());

  it("con PROXY_SECRETO manda al backend la IP real y el secreto", async () => {
    vi.stubEnv("PROXY_SECRETO", SECRETO);

    const r = await POST(peticion("203.0.113.7"));

    expect(r.status).toBe(200);
    expect(identificar).toHaveBeenCalledOnce();
    expect(identificar.mock.calls[0][1]).toEqual({ "X-Cliente-IP": "203.0.113.7", "X-Proxy-Secreto": SECRETO });
  });

  it("sin PROXY_SECRETO no manda cabeceras de proxy", async () => {
    vi.stubEnv("PROXY_SECRETO", "");

    await POST(peticion("203.0.113.7"));

    expect(identificar.mock.calls[0][1]).toEqual({});
  });

  it("el 429 del backend sigue llegando como 429 con el texto para el usuario", async () => {
    vi.stubEnv("PROXY_SECRETO", SECRETO);
    identificar.mockRejectedValue(new ErrorApi(429, "x"));

    const r = await POST(peticion("203.0.113.7"));

    expect(r.status).toBe(429);
    expect((await r.json()).mensaje).toBe("Demasiadas fotos seguidas. Espera un minuto");
  });
});
