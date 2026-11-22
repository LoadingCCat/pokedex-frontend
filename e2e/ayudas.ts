import path from "node:path";
import sharp from "sharp";

export const FOTO_PEQUENA = path.join(__dirname, "fixtures", "pokemon.png");
export const ARCHIVO_NO_IMAGEN = path.join(__dirname, "fixtures", "no-es-imagen.txt");

/**
 * Una foto de celular simulada: JPEG de 4000×3000 con ruido, de unos 8 MB. Se genera aquí
 * y no se guarda en el repositorio. Pasa el límite de 5 MB del backend: solo llega si el
 * navegador la reduce antes de enviarla.
 */
export async function generarFotoGrande(): Promise<{ name: string; mimeType: string; buffer: Buffer }> {
  const ancho = 4000;
  const alto = 3000;
  const ruido = Buffer.alloc(ancho * alto * 3);
  for (let i = 0; i < ruido.length; i++) ruido[i] = (i * 2654435761) >>> 24;
  const buffer = await sharp(ruido, { raw: { width: ancho, height: alto, channels: 3 } })
    .jpeg({ quality: 95 })
    .toBuffer();
  return { name: "foto-grande.jpg", mimeType: "image/jpeg", buffer };
}

/** Espera a que React haya hidratado el elemento (antes, un formulario se enviaría como un GET normal). */
export async function esperarHidratacion(page: import("@playwright/test").Page, selector: string) {
  await page.waitForFunction(
    (s) => {
      const el = document.querySelector(s);
      return !!el && Object.keys(el).some((k) => k.startsWith("__reactProps"));
    },
    selector,
  );
}
