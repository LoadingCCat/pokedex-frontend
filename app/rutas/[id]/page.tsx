import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import TarjetaPokemon, { TarjetaPokemonEsqueleto } from "@/components/pokemon/TarjetaPokemon";
import { EnlaceBoton } from "@/components/ui/Boton";
import Esqueleto from "@/components/ui/Esqueleto";
import EstadoVacio from "@/components/ui/EstadoVacio";
import Paginacion from "@/components/ui/Paginacion";
import { listarRegiones, obtenerRuta, pokemonsDeRuta } from "@/lib/api";
import { conPagina, leerId, leerPagina } from "@/lib/parametros-url";
import { imagenDeLugar } from "@/lib/imagenes";
import FiguraCreditada from "@/components/ui/FiguraCreditada";
import EnlaceExterno from "@/components/ui/EnlaceExterno";
import { enlaceDeLugar } from "@/lib/enlaces-wikidex";

const TAMANO = 20;

export async function generateMetadata({ params }: PageProps<"/rutas/[id]">): Promise<Metadata> {
  const id = leerId((await params).id);
  const ruta = id ? await obtenerRuta(id) : null;
  return { title: ruta ? `${ruta.nombre} (${ruta.region})` : "Lugar no encontrado" };
}

/** P5 · Ruta (docs/pantallas.md): un lugar de los juegos y los Pokémon que aparecen en él. */
export default function PaginaRuta({ params, searchParams }: PageProps<"/rutas/[id]">) {
  return (
    <Suspense fallback={<RutaEsqueleto />}>
      <ContenidoRuta params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ContenidoRuta({ params, searchParams }: Pick<PageProps<"/rutas/[id]">, "params" | "searchParams">) {
  const [{ id: segmento }, parametros] = await Promise.all([params, searchParams]);
  const id = leerId(segmento);
  if (!id) notFound();
  const [ruta, regiones] = await Promise.all([obtenerRuta(id), listarRegiones()]);
  if (!ruta) notFound();
  const pagina = leerPagina(parametros);
  // Hay rutas de regiones que no son de origen (p. ej. Orre): sin página de región a la que enlazar
  const regionConPagina = regiones.some((r) => r.toLowerCase() === ruta.region.toLowerCase());
  const imagen = imagenDeLugar(ruta.idPokeapi);
  // Vistas de ruta muy apaisadas (p. ej. 1200 × 400): a todo el ancho, no en la columna lateral
  const panoramica = imagen !== null && imagen.ancho / imagen.alto > 1.9;

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Ruta de navegación" className="text-sm text-texto-secundario">
        <Link href="/regiones" className="text-acento underline-offset-2 hover:underline">
          Regiones
        </Link>{" "}
        <span aria-hidden="true">/</span>{" "}
        {regionConPagina ? (
          <Link href={`/regiones/${ruta.region.toLowerCase()}`} className="text-acento underline-offset-2 hover:underline">
            {ruta.region}
          </Link>
        ) : (
          ruta.region
        )}{" "}
        <span aria-hidden="true">/</span> {ruta.nombre}
      </nav>
      <div
        className={
          imagen && !panoramica ? "grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]" : "flex flex-col gap-6"
        }
      >
        <header className="flex flex-col gap-2">
          <p className="text-sm text-texto-secundario">Lugar de {ruta.region}</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{ruta.nombre}</h1>
          {ruta.descripcion && <p className="max-w-prose text-texto-secundario">{ruta.descripcion}</p>}
          <p>
            <EnlaceExterno enlace={enlaceDeLugar(ruta.idPokeapi, ruta.nombre, ruta.region)} />
          </p>
        </header>
        {/* Captura del lugar (Fase 2): al lado en escritorio, debajo en móvil; las vistas
            panorámicas de ruta van a todo el ancho. Sin captura, la cabecera queda como antes */}
        {imagen && (
          <FiguraCreditada
            imagen={imagen}
            sizes={panoramica ? "(min-width: 1200px) 1150px, 100vw" : "(min-width: 768px) 384px, 100vw"}
            // Las capturas pequeñas (Let's Go, 396 px) no se agrandan
            imagenClassName={`h-auto w-full ${imagen.ancho < 640 ? "max-w-[396px]" : ""}`}
            prioridad
          />
        )}
      </div>
      <Suspense key={`pokemons:${pagina}`} fallback={<GrillaEsqueleto />}>
        <PokemonsDeLaRuta idRuta={ruta.idRuta} pagina={pagina} />
      </Suspense>
    </div>
  );
}

async function PokemonsDeLaRuta({ idRuta, pagina }: { idRuta: number; pagina: number }) {
  const base = `/rutas/${idRuta}`;
  let resultado;
  try {
    resultado = await pokemonsDeRuta(idRuta, { page: pagina - 1, size: TAMANO });
  } catch (error) {
    console.error("No se pudieron cargar los Pokémon de la ruta", error);
    return (
      <EstadoVacio
        tipo="error"
        titulo="No se pudieron cargar los Pokémon de este lugar."
        mensaje="Vuelve a intentarlo en unos segundos."
        accion={<EnlaceBoton href={conPagina(base, pagina)}>Reintentar</EnlaceBoton>}
      />
    );
  }

  const { totalElements, totalPages } = resultado.page;
  if (totalElements === 0) {
    return <EstadoVacio titulo="No hay Pokémon registrados en este lugar." />;
  }
  if (resultado.content.length === 0) {
    return (
      <EstadoVacio
        titulo={`La página ${pagina} no existe.`}
        mensaje={`Hay ${totalPages} ${totalPages === 1 ? "página" : "páginas"}.`}
        accion={<EnlaceBoton href={base}>Ir a la página 1</EnlaceBoton>}
      />
    );
  }

  return (
    <section aria-labelledby="titulo-pokemons" className="flex flex-col gap-4">
      <h2 id="titulo-pokemons" className="text-xl font-bold">
        Pokémon que aparecen aquí{" "}
        <span className="font-datos text-base font-medium text-texto-secundario tabular-nums">({totalElements})</span>
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {resultado.content.map((pokemon, i) => (
          <li key={pokemon.idPokedex}>
            <TarjetaPokemon pokemon={pokemon} prioridad={i < 4} />
          </li>
        ))}
      </ul>
      <Paginacion pagina={pagina - 1} totalPaginas={totalPages} hrefPagina={(n) => conPagina(base, n + 1)} />
    </section>
  );
}

function GrillaEsqueleto() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" aria-busy="true" aria-label="Cargando Pokémon">
      {Array.from({ length: 10 }, (_, i) => (
        <TarjetaPokemonEsqueleto key={i} />
      ))}
    </div>
  );
}

function RutaEsqueleto() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando lugar">
      <Esqueleto className="h-4 w-48" />
      <Esqueleto className="h-12 w-72" />
      <GrillaEsqueleto />
    </div>
  );
}
