import type { Metadata } from "next";
import { Suspense } from "react";
import FiltrosCatalogo from "@/components/pokemon/FiltrosCatalogo";
import TarjetaPokemon, { TarjetaPokemonEsqueleto } from "@/components/pokemon/TarjetaPokemon";
import { EnlaceBoton } from "@/components/ui/Boton";
import Chip from "@/components/ui/Chip";
import Esqueleto from "@/components/ui/Esqueleto";
import EstadoVacio from "@/components/ui/EstadoVacio";
import Paginacion from "@/components/ui/Paginacion";
import { listarPokemons, listarRegiones, listarTipos, type Pagina, type Pokemon } from "@/lib/api";
import {
  aFiltrosApi,
  hayFiltros,
  hrefCatalogo,
  leerCatalogo,
  TAMANO_PAGINA,
  type EstadoCatalogo,
} from "@/lib/parametros-catalogo";
import { infoTipo } from "@/lib/tipos-pokemon";

export const metadata: Metadata = {
  // La plantilla "%s · Pokedex+" del layout no se aplica a la página de su mismo segmento
  title: { absolute: "Catálogo · Pokedex+" },
};

/** P1 · Catálogo (docs/pantallas.md). El estado vive en la URL. */
export default function Catalogo({ searchParams }: PageProps<"/">) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold sm:text-4xl">Catálogo</h1>
        <p className="text-texto-secundario">Los 1025 Pokémon de las 9 generaciones. Busca y combina filtros.</p>
      </header>
      {/* searchParams solo existe al pedir la página: va dentro de Suspense (cacheComponents) */}
      <Suspense fallback={<CatalogoEsqueleto />}>
        <ContenidoCatalogo searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ContenidoCatalogo({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const [parametros, tipos, regiones] = await Promise.all([searchParams, listarTipos(), listarRegiones()]);
  const estado = leerCatalogo(parametros, { tipos: tipos.map((t) => t.nombre), regiones });
  const urlActual = hrefCatalogo(estado, { pagina: estado.pagina });

  const opcionesTipo = tipos
    .map((t) => ({ valor: t.nombre, etiqueta: infoTipo(t.nombre).etiqueta }))
    .sort((a, b) => a.etiqueta.localeCompare(b.etiqueta, "es"));
  const opcionesRegion = regiones.map((r) => ({ valor: r.toLowerCase(), etiqueta: r }));

  return (
    <>
      {/* Las key con la URL vuelven a montar el formulario y la carga al cambiar la búsqueda */}
      <FiltrosCatalogo key={`filtros:${urlActual}`} estado={estado} tipos={opcionesTipo} regiones={opcionesRegion} />
      <FiltrosActivos estado={estado} regiones={opcionesRegion} />
      <Suspense key={`resultados:${urlActual}`} fallback={<GrillaEsqueleto />}>
        <Resultados estado={estado} />
      </Suspense>
    </>
  );
}

function FiltrosActivos({ estado, regiones }: { estado: EstadoCatalogo; regiones: { valor: string; etiqueta: string }[] }) {
  if (!hayFiltros(estado)) return null;
  const chips: { etiqueta: string; quitar: Partial<EstadoCatalogo> }[] = [];
  if (estado.nombre) chips.push({ etiqueta: `Nombre: «${estado.nombre}»`, quitar: { nombre: undefined } });
  if (estado.generacion) chips.push({ etiqueta: `Generación ${estado.generacion}`, quitar: { generacion: undefined } });
  if (estado.tipo) chips.push({ etiqueta: `Tipo: ${infoTipo(estado.tipo).etiqueta}`, quitar: { tipo: undefined } });
  if (estado.region) {
    const etiqueta = regiones.find((r) => r.valor === estado.region)?.etiqueta ?? estado.region;
    chips.push({ etiqueta: `Región: ${etiqueta}`, quitar: { region: undefined } });
  }
  if (estado.obtencion) chips.push({ etiqueta: `Obtención: ${estado.obtencion}`, quitar: { obtencion: undefined } });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-texto-secundario">Filtros activos:</span>
      <ul className="contents">
        {chips.map((c) => (
          <li key={c.etiqueta}>
            <Chip etiqueta={c.etiqueta} hrefQuitar={hrefCatalogo(estado, c.quitar)} />
          </li>
        ))}
      </ul>
      <EnlaceBoton href={hrefCatalogo({ pagina: 1, sort: estado.sort })} className="min-h-8 px-3 sm:min-h-8">
        Quitar filtros
      </EnlaceBoton>
    </div>
  );
}

async function Resultados({ estado }: { estado: EstadoCatalogo }) {
  let pagina: Pagina<Pokemon>;
  try {
    pagina = await listarPokemons(aFiltrosApi(estado));
  } catch (error) {
    console.error("No se pudo cargar el catálogo", error);
    return (
      <EstadoVacio
        tipo="error"
        titulo="No se pudo cargar el catálogo."
        mensaje="Vuelve a intentarlo en unos segundos."
        accion={<EnlaceBoton href={hrefCatalogo(estado, { pagina: estado.pagina })}>Reintentar</EnlaceBoton>}
      />
    );
  }

  const { totalElements, totalPages } = pagina.page;
  if (totalElements === 0) {
    return (
      <EstadoVacio
        titulo={estado.nombre ? `Sin resultados para «${estado.nombre}».` : "Ningún Pokémon cumple estos filtros."}
        mensaje="Prueba con otro nombre o quita un filtro."
        accion={<EnlaceBoton href={hrefCatalogo({ pagina: 1, sort: estado.sort })}>Quitar filtros</EnlaceBoton>}
      />
    );
  }
  if (pagina.content.length === 0) {
    return (
      <EstadoVacio
        titulo={`La página ${estado.pagina} no existe.`}
        mensaje={`Hay ${totalPages} ${totalPages === 1 ? "página" : "páginas"} con estos filtros.`}
        accion={<EnlaceBoton href={hrefCatalogo(estado)}>Ir a la página 1</EnlaceBoton>}
      />
    );
  }

  return (
    <section aria-labelledby="titulo-resultados" className="flex flex-col gap-4">
      <h2 id="titulo-resultados" className="sr-only">
        Resultados
      </h2>
      <p className="text-sm text-texto-secundario" role="status">
        <span className="font-datos tabular-nums text-texto">{totalElements}</span> Pokémon
        {totalPages > 1 && ` · página ${estado.pagina} de ${totalPages}`}
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {pagina.content.map((pokemon, i) => (
          <li key={pokemon.idPokedex}>
            <TarjetaPokemon pokemon={pokemon} prioridad={i < 4} />
          </li>
        ))}
      </ul>
      <Paginacion
        pagina={estado.pagina - 1}
        totalPaginas={totalPages}
        hrefPagina={(n) => hrefCatalogo(estado, { pagina: n + 1 })}
      />
    </section>
  );
}

function GrillaEsqueleto() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando Pokémon">
      <Esqueleto className="h-4 w-40" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: TAMANO_PAGINA }, (_, i) => (
          <TarjetaPokemonEsqueleto key={i} />
        ))}
      </div>
    </div>
  );
}

function CatalogoEsqueleto() {
  return (
    <div className="flex flex-col gap-6">
      <Esqueleto className="h-36 w-full rounded-lg sm:h-32" />
      <GrillaEsqueleto />
    </div>
  );
}
