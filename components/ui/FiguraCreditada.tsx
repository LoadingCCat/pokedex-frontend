import Image from "next/image";
import type { CSSProperties } from "react";
import type { ImagenCreditada } from "@/lib/imagenes";

/**
 * Mapa o captura en su propio bloque, con el crédito corto debajo (identidad, "Toques de
 * nostalgia": nunca hay texto encima de la imagen). El crédito completo está en /creditos.
 */
export default function FiguraCreditada({
  imagen,
  sizes,
  className = "",
  imagenClassName = "",
  estiloImagen,
  sinOptimizar = false,
  prioridad = false,
}: {
  imagen: ImagenCreditada;
  sizes: string;
  className?: string;
  /** Reemplaza el tamaño por defecto de la imagen (`h-auto w-full`) */
  imagenClassName?: string;
  /** Ancho exacto de la imagen (pixel art a escala entera) */
  estiloImagen?: CSSProperties;
  /** Pixel art: se sirve tal cual; el optimizador de Next lo suavizaría al reescalarlo */
  sinOptimizar?: boolean;
  prioridad?: boolean;
}) {
  return (
    <figure className={`flex flex-col gap-2 ${className}`}>
      <div className="overflow-hidden rounded-lg border border-borde-suave bg-fondo">
        <Image
          src={imagen.archivo}
          alt={imagen.alt}
          width={imagen.ancho}
          height={imagen.alto}
          sizes={sinOptimizar ? undefined : sizes}
          unoptimized={sinOptimizar}
          style={estiloImagen}
          preload={prioridad}
          className={`mx-auto ${imagenClassName || "h-auto w-full"}`}
        />
      </div>
      <figcaption className="text-xs text-texto-secundario">
        {imagen.juego} · Imagen: {imagen.fuente}
      </figcaption>
    </figure>
  );
}
