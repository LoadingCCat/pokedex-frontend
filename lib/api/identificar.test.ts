/**
 * F20 · identificar() en la capa lib/api: modo HTTP (reenvía la foto a la API, sin token, con
 * tiempo de espera largo) y modo mock ("no disponible"). `fetch` se simula: no se llama a la API real.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { TIEMPO_ESPERA_MS, crearFuenteHttp } from "./http";
import { fuenteMock } from "./mock";
import { ErrorApi, MENSAJE_IDENTIFICAR_NO_DISPONIBLE, type Identificacion } from "./tipos";

const FOTO = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], { type: "image/jpeg" });

const tipoFuego = { id: 2, nombre: "fire" };
const RESPUESTA_200: Identificacion = {
  identificado: { idPokedex: 4, nombre: "charmander", nombreEs: "Charmander", tipos: [tipoFuego], totalEstadisticas: 309, imagenUrl: "https://x/4.png" },
  confianza: 0.93,
  similares: [155, 390, 255].map((id) => ({
    idPokedex: id,
    nombre: `p${id}`,
    nombreEs: null,
    tipos: [tipoFuego],
    totalEstadisticas: 309,
    imagenUrl: null,
    motivo: "Comparte el tipo Fuego y tiene el mismo total",
  })),
};

function simularFetch(respuesta: Response | Error) {
  const mock = vi.fn(async () => {
    if (respuesta instanceof Error) throw respuesta;
    return respuesta;
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

const api = crearFuenteHttp("http://api.test/api/");

afterEach(() => vi.unstubAllGlobals());

describe("F20 · identificar() en modo HTTP", () => {
  it("200: reenvía la foto en el campo `foto` a POST /pokemons/identificar, sin token", async () => {
    const mock = simularFetch(Response.json(RESPUESTA_200));
    const resultado = await api.identificar(FOTO);

    expect(resultado).toEqual(RESPUESTA_200);
    expect(resultado.similares).toHaveLength(3);
    const [url, init] = mock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("http://api.test/api/pokemons/identificar");
    expect(init.method).toBe("POST");
    const cuerpo = init.body as FormData;
    expect(cuerpo).toBeInstanceOf(FormData);
    expect([...cuerpo.keys()]).toEqual(["foto"]);
    expect((cuerpo.get("foto") as File).size).toBe(FOTO.size);
    expect(JSON.stringify(init.headers)).not.toMatch(/authorization/i);
  });

  it.each([
    [400, "La foto debe ser JPG, PNG o WEBP"],
    [422, "No reconocimos un Pokémon en la foto. Prueba con otra más clara"],
    [429, "Demasiadas fotos seguidas. Espera un minuto"],
    [502, "El reconocimiento no está disponible en este momento"],
  ])("%i: lanza ErrorApi con ese status y el mensaje del cuerpo de error", async (status, mensaje) => {
    simularFetch(Response.json({ timestamp: "t", status, error: "e", mensaje, path: "/api/pokemons/identificar" }, { status }));
    const promesa = api.identificar(FOTO);
    await expect(promesa).rejects.toBeInstanceOf(ErrorApi);
    await expect(promesa).rejects.toMatchObject({ status, message: mensaje });
  });

  it("un error sin cuerpo JSON (p. ej. el 413 de un proxy) conserva el status", async () => {
    simularFetch(new Response("<html>Payload Too Large</html>", { status: 413 }));
    await expect(api.identificar(FOTO)).rejects.toMatchObject({ status: 413 });
  });

  it("espera hasta 70 s: pasa una señal de tiempo de espera a fetch", async () => {
    const mock = simularFetch(Response.json(RESPUESTA_200));
    await api.identificar(FOTO);
    const [, init] = mock.mock.calls[0] as unknown as [string, RequestInit];
    expect(TIEMPO_ESPERA_MS).toBe(70_000);
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("las lecturas (GET) también llevan el tiempo de espera largo", async () => {
    const mock = simularFetch(Response.json([]));
    await api.listarTipos();
    const [, init] = mock.mock.calls[0] as unknown as [string, RequestInit];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it("si la API no responde a tiempo: ErrorApi 504", async () => {
    simularFetch(new DOMException("The operation timed out.", "TimeoutError"));
    await expect(api.identificar(FOTO)).rejects.toMatchObject({ status: 504 });
  });

  it("si no hay conexión: ErrorApi 0", async () => {
    simularFetch(new TypeError("fetch failed"));
    const promesa = api.identificar(FOTO);
    await expect(promesa).rejects.toBeInstanceOf(ErrorApi);
    await expect(promesa).rejects.toMatchObject({ status: 0 });
  });
});

describe("F20 · identificar() en modo mock", () => {
  it("responde un error 'no disponible' (503) sin llamar a ninguna API", async () => {
    const mock = simularFetch(Response.json(RESPUESTA_200));
    const promesa = fuenteMock.identificar(FOTO);
    await expect(promesa).rejects.toBeInstanceOf(ErrorApi);
    await expect(promesa).rejects.toMatchObject({ status: 503, message: MENSAJE_IDENTIFICAR_NO_DISPONIBLE });
    expect(MENSAJE_IDENTIFICAR_NO_DISPONIBLE).toMatch(/no está disponible/);
    expect(mock).not.toHaveBeenCalled();
  });
});
