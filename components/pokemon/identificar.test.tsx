/**
 * F20 (front) · la pantalla /identificar en cada estado, renderizada a HTML estático (sin DOM):
 * inactivo, carga (también la espera larga), resultado, error y modo mock (sin API_URL).
 * Los clics, el temporizador de 5 s y la cámara del celular se comprueban en el navegador.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import Identificar from "@/app/identificar/page";
import type { Identificacion } from "@/lib/api/tipos";
import { MENSAJE_IDENTIFICAR_NO_DISPONIBLE } from "@/lib/api/tipos";
import { AVISO_PRIVACIDAD, mensajeDeIdentificacion } from "@/lib/identificar-mensajes";
import { MENSAJE_ESPERA_LENTA, type EstadoIdentificar } from "@/lib/identificar-estado";
import PanelIdentificar from "./PanelIdentificar";

const fuego = { id: 2, nombre: "fire" };
const DATOS: Identificacion = {
  identificado: { idPokedex: 4, nombre: "charmander", nombreEs: "Charmander", tipos: [fuego], totalEstadisticas: 309, imagenUrl: null },
  confianza: 0.93,
  similares: [
    { idPokedex: 155, nombre: "cyndaquil", nombreEs: "Cyndaquil", tipos: [fuego], totalEstadisticas: 309, imagenUrl: null, motivo: "Comparte el tipo Fuego y tiene el mismo total" },
    { idPokedex: 390, nombre: "chimchar", nombreEs: null, tipos: [fuego], totalEstadisticas: 309, imagenUrl: null, motivo: "Comparte el tipo Fuego y tiene el mismo total" },
    { idPokedex: 255, nombre: "torchic", nombreEs: "Torchic", tipos: [fuego], totalEstadisticas: 310, imagenUrl: null, motivo: "Comparte el tipo Fuego y su total difiere en 1" },
  ],
};

function panel(estado: EstadoIdentificar, hayFoto = true) {
  return renderToStaticMarkup(
    <PanelIdentificar
      estado={estado}
      vistaPrevia={hayFoto ? "blob:http://localhost/foto" : null}
      hayFoto={hayFoto}
      onElegir={() => {}}
      onIdentificar={() => {}}
      onOtraFoto={() => {}}
    />,
  );
}

/** El atributo disabled (las clases de Tailwind también llevan «disabled:»). */
const DESHABILITADO = /\sdisabled=""/;

/** El `<button …>` cuyo texto es `texto`, para mirar si lleva `disabled`. */
function boton(html: string, texto: string) {
  return html.match(new RegExp(`<button[^>]*>${texto}</button>`))?.[0] ?? "";
}

/**
 * La opción de foto con esa etiqueta: su `<label for>` y el `<input type="file">` al que apunta.
 * Cada opción es un label nativo (abre el selector también en iOS Safari, sin `input.click()`).
 */
function opcionFoto(html: string, etiqueta: string) {
  const label = html.match(new RegExp(`<label[^>]*\\sfor="([^"]+)"[^>]*>${etiqueta}</label>`));
  const id = label?.[1];
  const input = id ? html.match(new RegExp(`<input[^>]*\\sid="${id.replace(/[:]/g, "\\$&")}"[^>]*>`))?.[0] : undefined;
  return { label: label?.[0], input: input ?? "" };
}

describe("F20 · selector de foto", () => {
  it("ofrece cámara trasera y galería como labels nativos de un input file, y muestra la vista previa", () => {
    const html = panel({ fase: "inactivo" });
    const camara = opcionFoto(html, "Tomar foto");
    const galeria = opcionFoto(html, "Elegir de la galería");

    expect(camara.label).toBeDefined();
    expect(camara.input).toMatch(/type="file"/);
    expect(camara.input).toMatch(/accept="image\/\*"/);
    expect(camara.input).toMatch(/capture="environment"/); // cámara trasera
    expect(galeria.label).toBeDefined();
    expect(galeria.input).toMatch(/type="file"/);
    expect(galeria.input).toMatch(/accept="image\/\*"/);
    expect(galeria.input).not.toMatch(/capture/); // galería: sin cámara
    expect(html.match(/type="file"/g)).toHaveLength(2);
    expect(html).toContain('alt="Vista previa de la foto elegida"');
    expect(html).toContain("Identificar");
  });

  it("los inputs siguen en el orden de tabulación (enfocables con teclado, no display:none ni tabindex -1)", () => {
    const html = panel({ fase: "inactivo" });
    for (const etiqueta of ["Tomar foto", "Elegir de la galería"]) {
      const { input } = opcionFoto(html, etiqueta);
      expect(input).toContain("sr-only");
      expect(input).not.toMatch(/\bhidden\b/);
      expect(input).not.toMatch(/tabindex/i);
    }
  });

  it("sin foto elegida no hay vista previa ni botón Identificar", () => {
    const html = panel({ fase: "inactivo" }, false);
    expect(html).not.toContain("<img");
    expect(boton(html, "Identificar")).toBe("");
  });
});

describe("F20 · estado de carga", () => {
  it("analizando: botones deshabilitados (no hay segundo envío) y texto de carga", () => {
    const html = panel({ fase: "analizando", lento: false });
    expect(boton(html, "Analizando…")).toMatch(DESHABILITADO);
    // Un input deshabilitado no abre el selector aunque se pulse su label
    expect(opcionFoto(html, "Tomar foto").input).toMatch(DESHABILITADO);
    expect(opcionFoto(html, "Elegir de la galería").input).toMatch(DESHABILITADO);
    expect(html).toContain('aria-busy="true"');
    expect(html).toMatch(/role="status"[^>]*>Analizando la foto…/);
    expect(html).not.toContain(MENSAJE_ESPERA_LENTA);
  });

  it("pasados 5 s: «Despertando el servidor, puede tardar más de un minuto…»", () => {
    const html = panel({ fase: "analizando", lento: true });
    expect(MENSAJE_ESPERA_LENTA).toBe("Despertando el servidor, puede tardar más de un minuto…");
    expect(html).toContain(MENSAJE_ESPERA_LENTA);
  });

  it("fuera de la carga, el botón Identificar y los inputs están habilitados", () => {
    const html = panel({ fase: "inactivo" });
    expect(boton(html, "Identificar")).not.toMatch(DESHABILITADO);
    expect(opcionFoto(html, "Tomar foto").input).not.toMatch(DESHABILITADO);
  });
});

describe("F20 · resultado", () => {
  const html = panel({ fase: "resultado", datos: DATOS });

  it("muestra el identificado y 3 similares, cada uno con enlace a su ficha", () => {
    expect(html).toContain("Pokémon identificado");
    expect(html).toContain("Pokémon similares");
    for (const id of [4, 155, 390, 255]) expect(html).toContain(`href="/pokemon/${id}"`);
    expect(html.match(/<article/g)).toHaveLength(4);
  });

  it("cada similar dice su motivo, y un nombreEs null usa el slug formateado", () => {
    expect(html).toContain("Comparte el tipo Fuego y su total difiere en 1");
    expect(html.match(/Comparte el tipo Fuego y tiene el mismo total/g)).toHaveLength(2);
    expect(html).toContain("Chimchar");
    expect(html).toContain("Fuego"); // insignia de tipo reutilizada
  });

  it("tras el resultado se puede elegir otra foto, sin botón de identificar la anterior", () => {
    expect(html).toContain("Tomar foto");
    expect(boton(html, "Identificar")).toBe("");
  });
});

describe("F20 · error", () => {
  it.each([400, 422, 429, 502, 0])("%i: muestra el mensaje y un botón para probar con otra foto", (status) => {
    const mensaje = mensajeDeIdentificacion(status);
    const html = panel({ fase: "error", mensaje });
    expect(html).toContain('role="alert"');
    expect(html).toContain(mensaje);
    expect(html).toContain("Probar con otra foto");
    expect(html).not.toMatch(/\b(HTTP|Exception|status)\b/);
  });
});

describe("F20 · página /identificar", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("siempre dice que la foto no se guarda y que la analiza un servicio de IA externo", () => {
    expect(AVISO_PRIVACIDAD).toBe("La foto no se guarda. Se analiza con un servicio de IA externo.");
    vi.stubEnv("API_URL", "http://localhost:8080/api");
    expect(renderToStaticMarkup(<Identificar />)).toContain(AVISO_PRIVACIDAD);
  });

  it("con API_URL muestra el selector de foto", () => {
    vi.stubEnv("API_URL", "http://localhost:8080/api");
    const html = renderToStaticMarkup(<Identificar />);
    expect(html).toContain("<h1");
    expect(html).toContain("Tomar foto");
  });

  it("modo mock (sin API_URL): muestra el aviso de que no está disponible, sin selector ni fallos", () => {
    vi.stubEnv("API_URL", "");
    const html = renderToStaticMarkup(<Identificar />);
    expect(html).toContain(MENSAJE_IDENTIFICAR_NO_DISPONIBLE);
    expect(html).toContain(AVISO_PRIVACIDAD);
    expect(html).not.toContain('type="file"');
    expect(html).not.toContain("Tomar foto");
  });
});
