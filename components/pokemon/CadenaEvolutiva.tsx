import Link from "next/link";
import type { Etapa } from "@/lib/api/tipos";
import { nombreVisible, numeroPokedex } from "@/lib/formato";
import ImagenPokemon from "./ImagenPokemon";

/**
 * Árbol de la cadena evolutiva desde la etapa base (F7). Cada paso muestra la condición
 * sobre la flecha; las ramas (Eevee) se apilan. En móvil la cadena va en vertical.
 */
export default function CadenaEvolutiva({ cadena, idActual }: { cadena: Etapa; idActual: number }) {
  if (cadena.evoluciones.length === 0) {
    return (
      <div className="flex flex-col items-start gap-3">
        <NodoEtapa etapa={cadena} idActual={idActual} />
        <p className="text-texto-secundario">Este Pokémon no evoluciona.</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto">
      <Subarbol etapa={cadena} idActual={idActual} />
    </div>
  );
}

function Subarbol({ etapa, idActual }: { etapa: Etapa; idActual: number }) {
  return (
    <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-3">
      <NodoEtapa etapa={etapa} idActual={idActual} />
      {etapa.evoluciones.length > 0 && (
        <ul className="flex flex-col gap-3 border-l-2 border-borde-suave pl-4 md:border-l-0 md:pl-0">
          {etapa.evoluciones.map((hija) => (
            <li key={hija.idPokedex} className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-3">
              <Flecha condicion={hija.condicion} />
              <Subarbol etapa={hija} idActual={idActual} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Flecha({ condicion }: { condicion: string | null }) {
  return (
    <div className="flex items-center gap-2 text-texto-secundario md:w-36 md:flex-col md:items-center md:gap-0.5 md:text-center">
      <span aria-hidden="true" className="text-lg leading-none">
        <span className="md:hidden">↓</span>
        <span className="hidden md:inline">→</span>
      </span>
      <span className="text-xs">{condicion ?? "Sin datos"}</span>
    </div>
  );
}

function NodoEtapa({ etapa, idActual }: { etapa: Etapa; idActual: number }) {
  const nombre = nombreVisible(etapa);
  const esActual = etapa.idPokedex === idActual;
  // Si la etapa no está importada (sin nombreEs ni imagen) no hay ficha a la que enlazar
  const importada = etapa.imagenUrl !== null || etapa.nombreEs !== null;

  const contenido = (
    <>
      <div className="w-20 rounded-md bg-fondo p-1">
        <ImagenPokemon src={etapa.imagenUrl} alt={nombre} sizes="80px" />
      </div>
      <span className="font-datos text-xs text-texto-secundario tabular-nums">{numeroPokedex(etapa.idPokedex)}</span>
      <span className="text-sm font-semibold">{nombre}</span>
    </>
  );
  const clases = `flex w-28 shrink-0 flex-col items-center gap-0.5 rounded-lg bg-superficie p-2 text-center ${
    esActual ? "border-2 border-acento" : "border border-borde-suave"
  }`;

  if (esActual) {
    return (
      <div className={clases} aria-current="page">
        {contenido}
        <span className="text-xs font-medium text-acento">Este Pokémon</span>
      </div>
    );
  }
  if (!importada) return <div className={clases}>{contenido}</div>;
  return (
    <Link href={`/pokemon/${etapa.idPokedex}`} className={`${clases} hover:border-acento`}>
      {contenido}
    </Link>
  );
}
