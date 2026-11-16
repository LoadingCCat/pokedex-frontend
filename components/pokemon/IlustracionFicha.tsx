"use client";

import { useState, type ReactNode } from "react";
import ImagenPokemon from "./ImagenPokemon";

/**
 * Ilustración grande de la ficha con el interruptor "Shiny" (toque de nostalgia de P2).
 * El interruptor solo cambia la ilustración y su `alt`; no aparece si falta una de las dos.
 * `children` son los demás controles de la fila (el botón "Escuchar").
 */
export default function IlustracionFicha({
  normal,
  shiny,
  nombre,
  children,
}: {
  normal: string | null;
  shiny: string | null;
  nombre: string;
  children?: ReactNode;
}) {
  const [esShiny, setEsShiny] = useState(false);
  const conShiny = Boolean(normal && shiny);
  const mostrarShiny = conShiny && esShiny;

  return (
    <>
      <div className="rounded-lg bg-fondo p-4">
        <ImagenPokemon
          src={mostrarShiny ? shiny : normal}
          alt={mostrarShiny ? `${nombre} shiny` : nombre}
          sizes="(min-width: 768px) 288px, 80vw"
          prioridad
        />
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
