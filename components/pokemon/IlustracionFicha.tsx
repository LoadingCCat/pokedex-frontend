"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import ImagenPokemon from "./ImagenPokemon";

/**
 * Ilustración grande de la ficha con el interruptor "Shiny" (toque de nostalgia de P2) y, al
 * lado, el sprite clásico pixelado a 2× (FE.32). El interruptor cambia la ilustración y el sprite
 * (y sus `alt`); no aparece si falta la ilustración shiny.
 * `children` son los demás controles de la fila (el botón "Escuchar").
 */
export default function IlustracionFicha({
  normal,
  shiny,
  nombre,
  sprite = null,
  spriteShiny = null,
  children,
}: {
  normal: string | null;
  shiny: string | null;
  nombre: string;
  /** Sprite clásico de 96 px (FE.32) */
  sprite?: string | null;
  spriteShiny?: string | null;
  children?: ReactNode;
}) {
  const [esShiny, setEsShiny] = useState(false);
  const conShiny = Boolean(normal && shiny);
  const mostrarShiny = conShiny && esShiny;

  const spriteVisible = mostrarShiny && spriteShiny ? spriteShiny : sprite;

  return (
    <>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <div className="rounded-lg bg-fondo p-4 lg:w-72 lg:shrink-0">
          <ImagenPokemon
            src={mostrarShiny ? shiny : normal}
            alt={mostrarShiny ? `${nombre} shiny` : nombre}
            sizes="(min-width: 768px) 288px, 80vw"
            prioridad
          />
        </div>
        {spriteVisible && (
          // Sprite clásico a 2× exacto (96 → 192 px) y sin suavizar; estático, así que también se
          // ve con "reducir movimiento"
          <figure className="flex flex-col items-center gap-1 self-center lg:self-start">
            <div className="rounded-lg border border-borde-suave bg-fondo p-2">
              <Image
                src={spriteVisible}
                alt={`Sprite clásico de ${nombre}${mostrarShiny && spriteShiny ? " shiny" : ""}`}
                width={192}
                height={192}
                unoptimized
                className="size-48 [image-rendering:pixelated]"
              />
            </div>
            <figcaption className="text-xs text-texto-secundario">Sprite clásico</figcaption>
          </figure>
        )}
      </div>
      {(children || conShiny) && (
        <div className="flex flex-wrap items-start gap-2">
          {children}
          {conShiny && (
            <button
              type="button"
              role="switch"
              aria-checked={esShiny}
              onClick={() => setEsShiny((valor) => !valor)}
              className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors duration-150 motion-reduce:transition-none sm:min-h-10 ${
                esShiny ? "border-acento bg-acento text-white" : "border-borde bg-superficie text-texto hover:bg-fondo"
              }`}
            >
              {/* Indicador del interruptor: carril con una perilla que se desplaza */}
              <span
                aria-hidden="true"
                className={`relative inline-block h-4 w-7 rounded-full border transition-colors duration-150 motion-reduce:transition-none ${
                  esShiny ? "border-white bg-white/30" : "border-borde bg-fondo"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-2.5 rounded-full transition-[left] duration-150 motion-reduce:transition-none ${
                    esShiny ? "left-3.5 bg-white" : "left-0.5 bg-texto-secundario"
                  }`}
                />
              </span>
              Shiny
            </button>
          )}
        </div>
      )}
    </>
  );
}
