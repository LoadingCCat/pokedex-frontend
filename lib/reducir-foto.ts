/**
 * F20: reduce la foto en el navegador antes de enviarla (lado mayor de 1024 px, JPEG, menos de
 * 1,5 MB). Vercel rechaza cuerpos de más de 4,5 MB y una foto de celular pesa 5–12 MB.
 * Los pasos que dependen del navegador (decodificar, canvas) se pueden inyectar para probarlos en Node.
 */

export const LADO_MAXIMO_PX = 1024;
/** Peso máximo de la foto reducida. /api/identificar acepta hasta MAX_BYTES_FOTO (2 MB). */
export const MAX_BYTES_REDUCIDA = 1.5 * 1024 * 1024;

const CALIDAD_INICIAL = 0.85;
const CALIDAD_MINIMA = 0.4;
const PASO_CALIDAD = 0.07;
const FACTOR_LADO = 0.8;
const LADO_MINIMO_PX = 200;

export const MENSAJE_FOTO_ILEGIBLE =
  "No pudimos leer esta foto. Si es HEIC, prueba con otra o guárdala como JPG.";

/** La foto no se pudo leer o reducir; el mensaje ya es para el usuario. */
export class ErrorFoto extends Error {
  constructor(mensaje = MENSAJE_FOTO_ILEGIBLE) {
    super(mensaje);
    this.name = "ErrorFoto";
  }
}

export type ImagenDecodificada = { ancho: number; alto: number; liberar?: () => void };

export type LienzoFoto = {
  /** Dibuja la imagen con ese tamaño sobre fondo blanco (por si tiene transparencia). */
  dibujar(imagen: ImagenDecodificada, ancho: number, alto: number): void;
  aJpeg(calidad: number): Promise<Blob | null>;
};

export type DependenciasReducir = {
  decodificar(archivo: Blob): Promise<ImagenDecodificada>;
  crearLienzo(): LienzoFoto;
};

/** Mismas proporciones con el lado mayor en `maximo` como mucho; nunca amplía. */
export function dimensionesReducidas(ancho: number, alto: number, maximo = LADO_MAXIMO_PX) {
  const escala = Math.min(1, maximo / Math.max(ancho, alto));
  return { ancho: Math.max(1, Math.round(ancho * escala)), alto: Math.max(1, Math.round(alto * escala)) };
}

/** `from-image` aplica la orientación EXIF: una foto vertical del celular no sale girada. */
const OPCIONES_DECODIFICAR = { imageOrientation: "from-image" } as const;

const decodificarEnNavegador: DependenciasReducir["decodificar"] = async (archivo) => {
  if (typeof createImageBitmap === "function") {
    const mapa = await createImageBitmap(archivo, OPCIONES_DECODIFICAR);
    return Object.assign(mapa, { ancho: mapa.width, alto: mapa.height, liberar: () => mapa.close() });
  }
  // Navegadores sin createImageBitmap: <img> (también respeta la orientación EXIF)
  const url = URL.createObjectURL(archivo);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return Object.assign(img, { ancho: img.naturalWidth, alto: img.naturalHeight });
  } finally {
    URL.revokeObjectURL(url);
  }
};

const crearLienzoEnNavegador: DependenciasReducir["crearLienzo"] = () => {
  const lienzo = document.createElement("canvas");
  const ctx = lienzo.getContext("2d");
  if (!ctx) throw new ErrorFoto();
  return {
    dibujar(imagen, ancho, alto) {
      lienzo.width = ancho;
      lienzo.height = alto;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, ancho, alto);
      ctx.drawImage(imagen as unknown as CanvasImageSource, 0, 0, ancho, alto);
    },
    aJpeg: (calidad) => new Promise((resolver) => lienzo.toBlob(resolver, "image/jpeg", calidad)),
  };
};

/**
 * Devuelve un JPEG de lado mayor ≤ 1024 px y menos de 1,5 MB. Baja la calidad por pasos y, si
 * aun así pesa de más, reduce el lado y repite. Lanza `ErrorFoto` si el navegador no puede
 * leerla (por ejemplo un HEIC que no decodifica) o no consigue comprimirla.
 */
export async function reducirFoto(archivo: Blob, deps?: Partial<DependenciasReducir>): Promise<Blob> {
  const decodificar = deps?.decodificar ?? decodificarEnNavegador;
  const crearLienzo = deps?.crearLienzo ?? crearLienzoEnNavegador;

  let imagen: ImagenDecodificada;
  try {
    imagen = await decodificar(archivo);
  } catch {
    throw new ErrorFoto();
  }
  try {
    if (!(imagen.ancho > 0 && imagen.alto > 0)) throw new ErrorFoto();
    const lienzo = crearLienzo();
    let { ancho, alto } = dimensionesReducidas(imagen.ancho, imagen.alto);
    for (;;) {
      lienzo.dibujar(imagen, ancho, alto);
      for (let calidad = CALIDAD_INICIAL; calidad >= CALIDAD_MINIMA - 1e-9; calidad -= PASO_CALIDAD) {
        const jpeg = await lienzo.aJpeg(calidad);
        if (!jpeg || jpeg.size === 0) throw new ErrorFoto();
        if (jpeg.size < MAX_BYTES_REDUCIDA) return jpeg;
      }
      if (Math.max(ancho, alto) * FACTOR_LADO < LADO_MINIMO_PX) throw new ErrorFoto();
      ({ ancho, alto } = { ancho: Math.round(ancho * FACTOR_LADO), alto: Math.round(alto * FACTOR_LADO) });
    }
  } catch (e) {
    throw e instanceof ErrorFoto ? e : new ErrorFoto();
  } finally {
    imagen.liberar?.();
  }
}
