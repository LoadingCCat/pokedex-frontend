import Image from "next/image";
import Link from "next/link";
import type { CapturasFicha } from "@/lib/capturas-ficha";

/**
 * "Cómo se consigue en el juego" (Fase 5, FE.29–FE.30): hasta 3 capturas propias del Pokémon o, si
 * no tiene, hasta 2 de lugares donde aparece (con el pie enlazado a su página). Dos por fila en
 * escritorio. El pixel art de hasta 256 px se muestra a 2× exacto y sin suavizar, el más grande a
 * su tamaño (las vistas muy altas, recortadas a 24rem); las capturas en HD, a 512 px, y las de
 * 3DS (400 px), a su tamaño. Es contenido, no un efecto: sin animación ni zoom.
 */
export default function CapturasDelJuego({ seleccion }: { seleccion: CapturasFicha }) {
  return (
    <div className="flex flex-col gap-4">
      {seleccion.tipo === "lugares" && (
        <p className="text-sm text-texto-secundario">
          No hay capturas de este Pokémon; estos son lugares de los juegos donde aparece.
        </p>
      )}
      <ul className="grid gap-4 lg:grid-cols-2">
        {seleccion.capturas.map((c) => {
          const escala = c.pixelArt && c.ancho <= 256 ? 2 : 1;
          const ancho = c.pixelArt ? c.ancho * escala : Math.min(c.ancho, 512);
          // Escalado pixelado solo a escala entera; si el navegador lo reduce, se suaviza
          const pixelado = c.pixelArt && ancho <= 512;
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
                    className={`h-auto max-h-[24rem] max-w-full object-cover object-top ${pixelado ? "[image-rendering:pixelated]" : ""}`}
                  />
                </div>
                <figcaption className="flex flex-col text-sm">
                  {c.href ? (
                    <Link href={c.href} className="text-acento underline underline-offset-2 hover:no-underline">
                      {c.pie}
                    </Link>
                  ) : (
                    <span>{c.pie}</span>
                  )}
                  <span className="text-xs text-texto-secundario">
                    {c.juego} · Imagen: {c.fuente}
                  </span>
                </figcaption>
              </figure>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
