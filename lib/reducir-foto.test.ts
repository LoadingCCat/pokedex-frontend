/**
 * F20 (front) · reducir la foto en el navegador: lado mayor de 1024 px, JPEG y menos de 1,5 MB.
 * El navegador se sustituye por un adaptador hecho con `sharp` (devDependency): decodifica y
 * codifica JPEG de verdad, así que el peso y las dimensiones que se comprueban son reales.
 */
import sharp from "sharp";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import {
  ErrorFoto,
  LADO_MAXIMO_PX,
  MAX_BYTES_REDUCIDA,
  MENSAJE_FOTO_ILEGIBLE,
  dimensionesReducidas,
  reducirFoto,
  type DependenciasReducir,
  type ImagenDecodificada,
  type LienzoFoto,
} from "./reducir-foto";

type Pixeles = ImagenDecodificada & { datos: Buffer };

/** Ruido de colores: el peor caso para JPEG (no se comprime bien). */
function ruido(ancho: number, alto: number): Buffer {
  const datos = Buffer.alloc(ancho * alto * 3);
  let semilla = 12345;
  for (let i = 0; i < datos.length; i++) {
    semilla = (semilla * 1103515245 + 12345) & 0x7fffffff;
    datos[i] = semilla >> 16;
  }
  return datos;
}

const dependenciasConSharp: DependenciasReducir = {
  async decodificar(archivo) {
    const { data, info } = await sharp(Buffer.from(await archivo.arrayBuffer()))
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    return { ancho: info.width, alto: info.height, datos: data } as Pixeles;
  },
  crearLienzo(): LienzoFoto {
    // Como un <canvas>: dibujar() guarda la imagen a ese tamaño y aJpeg() la exporta
    let pixeles: Pixeles;
    let destino = { ancho: 0, alto: 0 };
    return {
      dibujar(imagen, ancho, alto) {
        pixeles = imagen as Pixeles;
        destino = { ancho, alto };
      },
      async aJpeg(calidad) {
        const buffer = await sharp(pixeles.datos, { raw: { width: pixeles.ancho, height: pixeles.alto, channels: 3 } })
          .resize(destino.ancho, destino.alto)
          .jpeg({ quality: Math.round(calidad * 100) })
          .toBuffer();
        return new Blob([new Uint8Array(buffer)], { type: "image/jpeg" });
      },
    };
  },
};

async function leerJpeg(blob: Blob) {
  const buffer = Buffer.from(await blob.arrayBuffer());
  const meta = await sharp(buffer).metadata();
  return { formato: meta.format, ancho: meta.width!, alto: meta.height! };
}

describe("dimensionesReducidas", () => {
  it("apaisada: el lado mayor queda en 1024 y se conservan las proporciones", () => {
    expect(dimensionesReducidas(4000, 3000)).toEqual({ ancho: 1024, alto: 768 });
  });

  it("vertical (foto de celular): el alto manda", () => {
    expect(dimensionesReducidas(3000, 4000)).toEqual({ ancho: 768, alto: 1024 });
  });

  it("una foto pequeña no se amplía", () => {
    expect(dimensionesReducidas(800, 600)).toEqual({ ancho: 800, alto: 600 });
  });

  it("nunca devuelve 0 ni pasa del máximo", () => {
    expect(dimensionesReducidas(10000, 1)).toEqual({ ancho: LADO_MAXIMO_PX, alto: 1 });
  });
});

describe("reducirFoto", () => {
  let foto8Mb: Blob;

  beforeAll(async () => {
    // 3000 × 2000 de ruido con calidad 100: más de 8 MB, como una foto de celular
    const jpeg = await sharp(ruido(3000, 2000), { raw: { width: 3000, height: 2000, channels: 3 } })
      .jpeg({ quality: 100, chromaSubsampling: "4:4:4" })
      .toBuffer();
    foto8Mb = new Blob([new Uint8Array(jpeg)], { type: "image/jpeg" });
  }, 60_000);

  afterEach(() => vi.unstubAllGlobals());

  it("una foto de más de 8 MB sale como JPEG de 1024 px de lado mayor y menos de 1,5 MB", async () => {
    expect(foto8Mb.size).toBeGreaterThan(8 * 1024 * 1024);
    const reducida = await reducirFoto(foto8Mb, dependenciasConSharp);

    expect(reducida.size).toBeLessThan(MAX_BYTES_REDUCIDA);
    expect(reducida.size).toBeGreaterThan(0);
    const { formato, ancho, alto } = await leerJpeg(reducida);
    expect(formato).toBe("jpeg");
    expect(Math.max(ancho, alto)).toBeLessThanOrEqual(LADO_MAXIMO_PX);
    expect(ancho / alto).toBeCloseTo(3 / 2, 1);
  }, 60_000);

  it("si ni con la calidad mínima baja de 1,5 MB, reduce también el lado", async () => {
    const lados: number[] = [];
    const pesos = [3_000_000, 3_000_000, 3_000_000, 3_000_000, 3_000_000, 3_000_000, 3_000_000, 3_000_000, 100_000];
    let n = 0;
    const deps: DependenciasReducir = {
      decodificar: async () => ({ ancho: 4000, alto: 3000 }),
      crearLienzo: () => ({
        dibujar: (_i, ancho, alto) => void lados.push(Math.max(ancho, alto)),
        aJpeg: async () => new Blob([new Uint8Array(pesos[Math.min(n++, pesos.length - 1)])], { type: "image/jpeg" }),
      }),
    };
    const reducida = await reducirFoto(new Blob(["x"]), deps);
    expect(reducida.size).toBe(100_000);
    expect(lados[0]).toBe(1024);
    expect(lados[1]).toBeLessThan(1024); // segunda vuelta con el lado más corto
  });

  it("pide la orientación de la foto (EXIF) al decodificar", async () => {
    const createImageBitmap = vi.fn(async () => ({ width: 400, height: 300, close: vi.fn() }));
    vi.stubGlobal("createImageBitmap", createImageBitmap);
    const archivo = new Blob(["x"], { type: "image/jpeg" });
    await reducirFoto(archivo, {
      crearLienzo: () => ({ dibujar: () => {}, aJpeg: async () => new Blob([new Uint8Array(10)]) }),
    });
    expect(createImageBitmap).toHaveBeenCalledWith(archivo, { imageOrientation: "from-image" });
  });

  it("un HEIC que el navegador no decodifica da un mensaje claro", async () => {
    const deps: Partial<DependenciasReducir> = {
      decodificar: async () => {
        throw new DOMException("The source image could not be decoded.", "InvalidStateError");
      },
    };
    const promesa = reducirFoto(new Blob(["heic"], { type: "image/heic" }), deps);
    await expect(promesa).rejects.toBeInstanceOf(ErrorFoto);
    await expect(promesa).rejects.toThrow(MENSAJE_FOTO_ILEGIBLE);
  });

  it("una imagen sin tamaño o un lienzo que no exporta dan el mismo mensaje", async () => {
    await expect(reducirFoto(new Blob(["x"]), { decodificar: async () => ({ ancho: 0, alto: 0 }) })).rejects.toThrow(
      MENSAJE_FOTO_ILEGIBLE,
    );
    await expect(
      reducirFoto(new Blob(["x"]), {
        decodificar: async () => ({ ancho: 10, alto: 10 }),
        crearLienzo: () => ({ dibujar: () => {}, aJpeg: async () => null }),
      }),
    ).rejects.toThrow(MENSAJE_FOTO_ILEGIBLE);
  });

  it("libera la imagen decodificada, con o sin error", async () => {
    const liberar = vi.fn();
    await reducirFoto(new Blob(["x"]), {
      decodificar: async () => ({ ancho: 10, alto: 10, liberar }),
      crearLienzo: () => ({ dibujar: () => {}, aJpeg: async () => new Blob([new Uint8Array(5)]) }),
    });
    expect(liberar).toHaveBeenCalledTimes(1);
  });
});
