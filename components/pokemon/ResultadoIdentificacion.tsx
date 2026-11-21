import type { Ref } from "react";
import type { Identificacion } from "@/lib/api/tipos";
import TarjetaPokemon from "./TarjetaPokemon";

/**
 * F20: el Pokémon identificado y sus 3 similares, cada uno con su motivo. Todas las tarjetas
 * llevan a su ficha. `refTitulo` deja mover el foco al resultado cuando llega.
 */
export default function ResultadoIdentificacion({
  datos,
  refTitulo,
}: {
  datos: Identificacion;
  refTitulo?: Ref<HTMLHeadingElement>;
}) {
  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="titulo-identificado" className="flex flex-col gap-3">
        <h2 id="titulo-identificado" ref={refTitulo} tabIndex={-1} className="text-xl font-bold sm:text-2xl">
          Pokémon identificado
        </h2>
        <div className="w-full max-w-xs">
          <TarjetaPokemon pokemon={datos.identificado} />
        </div>
      </section>
      <section aria-labelledby="titulo-similares" className="flex flex-col gap-3">
        <h2 id="titulo-similares" className="text-xl font-bold sm:text-2xl">
          Pokémon similares
        </h2>
        <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:grid-cols-3">
          {datos.similares.map((similar) => (
            <li key={similar.idPokedex}>
              <TarjetaPokemon pokemon={similar} pie={similar.motivo} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
