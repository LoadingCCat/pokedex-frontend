/**
 * F20 · criterios del front: "Los errores 400, 422, 429 y 502 muestran el mensaje del contrato,
 * sin códigos ni textos técnicos". Los textos esperados salen de contratos/api.md, no del código.
 */
import { describe, expect, it } from "vitest";
import { MAX_BYTES_FOTO, mensajeDeIdentificacion } from "./identificar-mensajes";

const TECNICO = /\b\d{3}\b|exception|stack|trace|gemini|api key|https?:\/\/|\bnull\b|undefined/i;

describe("F20 · mensajes de error de identificar", () => {
  it("400: conserva cada uno de los tres mensajes del contrato", () => {
    expect(mensajeDeIdentificacion(400, "Envía una foto en el campo foto")).toBe("Envía una foto en el campo foto");
    expect(mensajeDeIdentificacion(400, "La foto debe ser JPG, PNG o WEBP")).toBe("La foto debe ser JPG, PNG o WEBP");
    expect(mensajeDeIdentificacion(400, "La foto pesa más de 5 MB")).toBe("La foto pesa más de 5 MB");
  });

  it("400: un texto que no es del contrato no llega al usuario", () => {
    const m = mensajeDeIdentificacion(400, "Required part 'foto' is not present. at org.springframework…");
    expect(m).not.toMatch(/springframework|Required part/);
    expect(m).not.toMatch(TECNICO);
    expect(mensajeDeIdentificacion(400)).toBe(m);
  });

  it("422: no hay Pokémon en la foto", () => {
    expect(mensajeDeIdentificacion(422)).toBe("No reconocimos un Pokémon en la foto. Prueba con otra más clara");
  });

  it("429: demasiadas fotos seguidas", () => {
    expect(mensajeDeIdentificacion(429)).toBe("Demasiadas fotos seguidas. Espera un minuto");
  });

  it("502: el reconocimiento no está disponible", () => {
    expect(mensajeDeIdentificacion(502)).toBe("El reconocimiento no está disponible en este momento");
  });

  it("en 422, 429 y 502 manda el texto del contrato, aunque la API envíe otro", () => {
    for (const status of [422, 429, 502]) {
      expect(mensajeDeIdentificacion(status, "java.net.SocketTimeoutException: https://proveedor/v1?key=SECRETO")).toBe(
        mensajeDeIdentificacion(status),
      );
    }
  });

  it("ningún mensaje lleva códigos ni textos técnicos", () => {
    for (const status of [0, 400, 413, 422, 429, 500, 502, 503, 504]) {
      expect(mensajeDeIdentificacion(status, "Error 500: NullPointerException")).not.toMatch(TECNICO);
    }
  });

  it("sin conexión (0), tiempo agotado (504), foto grande (413) y códigos desconocidos tienen mensaje propio", () => {
    expect(mensajeDeIdentificacion(0)).toMatch(/conexión/);
    expect(mensajeDeIdentificacion(504)).toMatch(/tardó demasiado/);
    expect(mensajeDeIdentificacion(413)).toMatch(/pesa demasiado/);
    expect(mensajeDeIdentificacion(500)).toBe(mensajeDeIdentificacion(418));
  });

  it("el tope de /api/identificar deja pasar una foto reducida (1,5 MB) y queda bajo el límite de Vercel (4,5 MB)", () => {
    expect(MAX_BYTES_FOTO).toBeGreaterThan(1.5 * 1024 * 1024);
    expect(MAX_BYTES_FOTO).toBeLessThan(4.5 * 1024 * 1024);
  });
});
