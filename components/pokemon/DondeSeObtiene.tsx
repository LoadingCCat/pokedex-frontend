import Link from "next/link";
import type { Pokemon, Ruta } from "@/lib/api/tipos";

/** Agrupa las rutas por región, en el orden en que aparecen las regiones. */
function porRegion(rutas: Ruta[]): [string, Ruta[]][] {
  const grupos = new Map<string, Ruta[]>();
  for (const ruta of rutas) {
    const lista = grupos.get(ruta.region) ?? [];
    lista.push(ruta);
    grupos.set(ruta.region, lista);
  }
  return [...grupos.entries()].map(([region, lista]) => [
    region,
    lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
  ]);
}

/** Forma de obtención (tipoObtencion + formaObtencion) y lugares donde aparece en estado salvaje. */
export default function DondeSeObtiene({ pokemon, regiones }: { pokemon: Pokemon; regiones: string[] }) {
  const grupos = porRegion(pokemon.rutas).sort(
    ([a], [b]) => (regiones.indexOf(a) + 1 || 99) - (regiones.indexOf(b) + 1 || 99),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {pokemon.tipoObtencion && (
          <p>
            <span className="inline-flex items-center rounded-full border border-borde px-2.5 py-0.5 text-xs font-semibold">
              {pokemon.tipoObtencion}
            </span>
          </p>
        )}
        <p className="max-w-prose">
          {pokemon.formaObtencion ?? "La PokeAPI no tiene datos de captura para este Pokémon."}
        </p>
      </div>

      {grupos.length === 0 ? (
        // Si formaObtencion ya lo dice ("No aparece en estado salvaje: …"), no se repite
        !/no aparece en estado salvaje/i.test(pokemon.formaObtencion ?? "") && (
          <p className="text-texto-secundario">Este Pokémon no aparece en estado salvaje.</p>
        )
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-texto-secundario">
            Aparece en{" "}
            <span className="font-datos tabular-nums text-texto">{pokemon.rutas.length}</span>{" "}
            {pokemon.rutas.length === 1 ? "lugar" : "lugares"}:
          </p>
          {grupos.map(([region, rutas]) => (
            <div key={region} className="flex flex-col gap-1">
              <h3 className="text-sm font-semibold">{region}</h3>
              <ul className="flex flex-wrap gap-x-1 gap-y-1 text-sm">
                {rutas.map((ruta, i) => (
                  <li key={ruta.idRuta}>
                    <Link href={`/rutas/${ruta.idRuta}`} className="text-acento underline-offset-2 hover:underline">
                      {ruta.nombre}
                    </Link>
                    {i < rutas.length - 1 && <span aria-hidden="true">,</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
