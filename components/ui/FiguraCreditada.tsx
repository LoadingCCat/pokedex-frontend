import Image from "next/image";
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
  prioridad = false,
}: {
  imagen: ImagenCreditada;
  sizes: string;
  className?: string;
  /** Reemplaza el tamaño por defecto de la imagen (`h-auto w-full`) */
  imagenClassName?: string;
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
          sizes={sizes}
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
