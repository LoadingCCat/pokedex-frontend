/**
 * N-01 (interventoría 4.3): el servidor de Next llama al backend en nombre del navegador, así que le
 * pasa la IP real del cliente (la que pone Vercel) en X-Cliente-IP, con el secreto compartido
 * PROXY_SECRETO en X-Proxy-Secreto. Sin PROXY_SECRETO no manda nada y el backend usa la IP de la conexión.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { cabecerasDeProxy } from "./cliente-proxy";

const SECRETO = "secreto-del-proxy-0123456789";
const peticion = (cabeceras: Record<string, string>) => new Request("http://localhost/api/x", { headers: cabeceras });

describe("cabecerasDeProxy", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("con PROXY_SECRETO y la IP de Vercel (x-real-ip) manda X-Cliente-IP y X-Proxy-Secreto", () => {
    vi.stubEnv("PROXY_SECRETO", SECRETO);

    expect(cabecerasDeProxy(peticion({ "x-real-ip": "203.0.113.7" }))).toEqual({
      "X-Cliente-IP": "203.0.113.7",
      "X-Proxy-Secreto": SECRETO,
    });
  });

  it("sin x-real-ip usa el primer valor de x-forwarded-for", () => {
    vi.stubEnv("PROXY_SECRETO", SECRETO);

    expect(cabecerasDeProxy(peticion({ "x-forwarded-for": " 203.0.113.9 , 76.76.21.1" }))).toEqual({
      "X-Cliente-IP": "203.0.113.9",
      "X-Proxy-Secreto": SECRETO,
    });
  });

  it("dos clientes distintos producen cabeceras distintas", () => {
    vi.stubEnv("PROXY_SECRETO", SECRETO);

    const a = cabecerasDeProxy(peticion({ "x-real-ip": "203.0.113.10" }));
    const b = cabecerasDeProxy(peticion({ "x-real-ip": "203.0.113.11" }));

    expect(a["X-Cliente-IP"]).not.toBe(b["X-Cliente-IP"]);
  });

  it("sin PROXY_SECRETO (o vacío) no manda ninguna cabecera, aunque haya IP", () => {
    vi.stubEnv("PROXY_SECRETO", "");
    expect(cabecerasDeProxy(peticion({ "x-real-ip": "203.0.113.7" }))).toEqual({});

    vi.unstubAllEnvs();
    delete process.env.PROXY_SECRETO;
    expect(cabecerasDeProxy(peticion({ "x-real-ip": "203.0.113.7" }))).toEqual({});
  });

  it("con PROXY_SECRETO pero sin IP en la petición no manda nada (el backend usa la de la conexión)", () => {
    vi.stubEnv("PROXY_SECRETO", SECRETO);

    expect(cabecerasDeProxy(peticion({}))).toEqual({});
    expect(cabecerasDeProxy(peticion({ "x-real-ip": "  " }))).toEqual({});
  });
});
