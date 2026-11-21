import Link from "next/link";
import type { ReactNode } from "react";
import Esqueleto from "@/components/ui/Esqueleto";
import type { Pokemon } from "@/lib/api/tipos";
import { nombreVisible, numeroPokedex } from "@/lib/formato";
import { spriteAnimadoUrl } from "@/lib/recursos-pokemon";
import ImagenPokemon from "./ImagenPokemon";
import SpriteAnimado from "./SpriteAnimado";
import { ListaTipos } from "./InsigniaTipo";

type DatosTarjeta = Pick<Pokemon, "idPokedex" | "nombre" | "nombreEs" | "imagenUrl" | "tipos">;

/**
 * Tarjeta del catálogo: imagen, #número, nombre y tipos. Toda la tarjeta enlaza a la ficha.
 * `pie` es un texto opcional debajo de los tipos (F20: por qué se parece un Pokémon similar).
 */
export default function TarjetaPokemon({
  pokemon,
  prioridad = false,
  pie,
}: {
  pokemon: DatosTarjeta;
  prioridad?: boolean;
  pie?: ReactNode;
}) {
  const nombre = nombreVisible(pokemon);
  const sprite = spriteAnimadoUrl(pokemon.idPokedex);
  return (
    <article className="group relative flex h-full flex-col gap-2 rounded-lg border border-borde-suave bg-superficie p-3 transition-shadow hover:shadow-sm focus-within:shadow-sm">
      <div className="relative rounded-md bg-fondo p-2">
        <ImagenPokemon
          src={pokemon.imagenUrl}
          alt={nombre}
          sizes="(min-width: 1024px) 180px, (min-width: 640px) 25vw, 45vw"
          prioridad={prioridad}
        />
        {/* Toque de nostalgia: sprite animado de Negro/Blanco al pasar el ratón (#001–#649) */}
        {sprite && <SpriteAnimado src={sprite} />}
      </div>
      <p className="font-datos text-xs text-texto-secundario tabular-nums">{numeroPokedex(pokemon.idPokedex)}</p>
      <h3 className="text-base font-semibold">
        {/* El enlace cubre toda la tarjeta con ::after */}
        <Link
          href={`/pokemon/${pokemon.idPokedex}`}
          className="after:absolute after:inset-0 after:rounded-lg group-hover:text-acento"
        >
          {nombre}
        </Link>
      </h3>
      <ListaTipos tipos={pokemon.tipos} />
      {pie && <p className="text-sm text-texto-secundario">{pie}</p>}
    </article>
  );
}

/** Esqueleto con la forma de la tarjeta, para los estados de carga. */
export function TarjetaPokemonEsqueleto() {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-borde-suave bg-superficie p-3">
      <Esqueleto className="aspect-square w-full" />
      <Esqueleto className="h-3 w-10" />
      <Esqueleto className="h-5 w-3/4" />
      <Esqueleto className="h-5 w-16 rounded-full" />
    </div>
  );
}
