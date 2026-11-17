import Image from "next/image";
import type { CapturaJuego } from "@/lib/imagenes";

/**
 * "Cómo se consigue en el juego" (Fase 5): hasta 3 capturas, dos por fila en escritorio. El pixel
 * art (GB, GBA, DS) se muestra a 2× exacto y sin suavizar; las capturas en HD, a 512 px de ancho, y las de 3DS (400 px), a su tamaño.
 * Es contenido, no un efecto: sin animación ni zoom (identidad, "Toques de nostalgia").
 */
export default function CapturasDelJuego({ capturas }: { capturas: CapturaJuego[] }) {
  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {capturas.map((c) => {
        // Las de 3DS (400 px) se quedan a su tamaño; las HD se muestran a 512 px
        const ancho = c.pixelArt ? c.ancho * 2 : Math.min(c.ancho, 512);
        return (
          <li key={c.archivo}>
            <figure className="flex flex-col gap-2">
              <div className="flex justify-center overflow-hidden rounded-lg border border-borde-suave bg-fondo">
                <Image
                  src={c.archivo}
                  alt={c.alt}
                  width={c.ancho}
                  height={c.alto}
                  // El pixel art se sirve tal cual (pocos KB): el optimizador lo suavizaría al escalarlo
                  unoptimized={c.pixelArt}
                  sizes={c.pixelArt ? undefined : "(min-width: 640px) 512px, 100vw"}
                  style={{ width: ancho }}
                  className={`h-auto max-w-full ${c.pixelArt ? "[image-rendering:pixelated]" : ""}`}
                />
              </div>
              <figcaption className="flex flex-col text-sm">
                <span>{c.pie}</span>
                <span className="text-xs text-texto-secundario">
                  {c.juego} · Imagen: {c.fuente}
                </span>
              </figcaption>
            </figure>
          </li>
        );
      })}
    </ul>
  );
}
