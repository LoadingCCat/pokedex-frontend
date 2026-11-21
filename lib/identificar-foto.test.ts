/** F20 (front) · enviarFoto: POST a /api/identificar y errores con los textos de identificar-mensajes. */
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Identificacion } from "./api/tipos";
import { ErrorIdentificar, enviarFoto } from "./identificar-foto";
import { mensajeDeIdentificacion } from "./identificar-mensajes";

const FOTO = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xe0])], { type: "image/jpeg" });
const OK = { identificado: { idPokedex: 4 }, confianza: 0.9, similares: [] } as unknown as Identificacion;

function simularFetch(r: Response | Error) {
  const mock = vi.fn(async () => {
    if (r instanceof Error) throw r;
    return r;
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

afterEach(() => vi.unstubAllGlobals());

describe("F20 · enviarFoto", () => {
  it("200: manda la foto en el campo `foto` a /api/identificar y devuelve la identificación", async () => {
    const mock = simularFetch(Response.json(OK));
    expect(await enviarFoto(FOTO)).toEqual(OK);

    const [url, init] = mock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/identificar");
    expect(init.method).toBe("POST");
    expect((init.body as FormData).get("foto")).toBeInstanceOf(Blob);
  });

  it.each([
    [400, "La foto debe ser JPG, PNG o WEBP"],
    [422, "No reconocimos un Pokémon en la foto. Prueba con otra más clara"],
    [429, "Demasiadas fotos seguidas. Espera un minuto"],
    [502, "El reconocimiento no está disponible en este momento"],
  ])("%i: el error trae el mensaje del contrato", async (status, mensaje) => {
    simularFetch(Response.json({ mensaje }, { status }));
    const promesa = enviarFoto(FOTO);
    await expect(promesa).rejects.toBeInstanceOf(ErrorIdentificar);
    await expect(promesa).rejects.toMatchObject({ status, message: mensaje });
  });

  it("un cuerpo de error técnico no llega al usuario", async () => {
    simularFetch(Response.json({ mensaje: "java.lang.NullPointerException at com.pokedex" }, { status: 500 }));
    await expect(enviarFoto(FOTO)).rejects.toMatchObject({ message: mensajeDeIdentificacion(500) });
  });

  it("503 (modo mock) y un error sin JSON usan los textos fijos", async () => {
    simularFetch(new Response("<html>", { status: 503 }));
    await expect(enviarFoto(FOTO)).rejects.toMatchObject({ status: 503, message: mensajeDeIdentificacion(503) });
  });

  it("sin conexión: mensaje de conexión (status 0)", async () => {
    simularFetch(new TypeError("Failed to fetch"));
    await expect(enviarFoto(FOTO)).rejects.toMatchObject({ status: 0, message: mensajeDeIdentificacion(0) });
  });

  it("cancelada (al salir de la pantalla): deja pasar el AbortError, no lo convierte en mensaje", async () => {
    const controlador = new AbortController();
    controlador.abort();
    simularFetch(new DOMException("Aborted", "AbortError"));
    await expect(enviarFoto(FOTO, controlador.signal)).rejects.toMatchObject({ name: "AbortError" });
  });
});
