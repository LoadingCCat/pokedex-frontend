import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Esqueleto from "@/components/ui/Esqueleto";
import CadenaEvolutiva from "@/components/pokemon/CadenaEvolutiva";
import DondeSeObtiene from "@/components/pokemon/DondeSeObtiene";
import EstadisticasBase from "@/components/pokemon/EstadisticasBase";
import { ListaTipos } from "@/components/pokemon/InsigniaTipo";
import Tarjeta from "@/components/ui/Tarjeta";
import TablaMovimientos from "@/components/pokemon/TablaMovimientos";
import {
  evolucionesDe,
  listarRegiones,
  movimientosDePokemon,
  obtenerPokemon,
  type Movimiento,
  type Pokemon,
} from "@/lib/api";
import { formatoAltura, formatoPeso, nombreVisible, numeroPokedex } from "@/lib/formato";
import { leerId } from "@/lib/parametros-url";
import { gritoUrl, ilustracionShinyUrl } from "@/lib/recursos-pokemon";
import BotonGrito from "@/components/pokemon/BotonGrito";
import IlustracionFicha from "@/components/pokemon/IlustracionFicha";
import EnlaceExterno from "@/components/ui/EnlaceExterno";
import { enlaceDePokemon } from "@/lib/enlaces-wikidex";
import CapturasDelJuego from "@/components/pokemon/CapturasDelJuego";
import { capturasDePokemon } from "@/lib/imagenes";

const PRIMERO = 1;
const ULTIMO = 1025;

/** Las 1025 fichas se generan al compilar (datos del mock); un id inválido da 404. */
export function generateStaticParams() {
  return Array.from({ length: ULTIMO }, (_, i) => ({ id: String(i + PRIMERO) }));
}

export async function generateMetadata({ params }: PageProps<"/pokemon/[id]">): Promise<Metadata> {
  const id = leerId((await params).id);
  const pokemon = id ? await obtenerPokemon(id) : null;
  if (!pokemon) return { title: "Pokémon no encontrado" };
  return {
    title: nombreVisible(pokemon),
    description: pokemon.descripcion ?? undefined,
  };
}

/**
 * P2 · Ficha (docs/pantallas.md). `params` se lee dentro de Suspense (cacheComponents): la
 * navegación muestra el esqueleto al instante. Las 1025 fichas válidas son estáticas; un id
 * inválido muestra el 404 propio con estado HTTP 200 + noindex (ya empezó el streaming).
 */
export default function Ficha({ params }: PageProps<"/pokemon/[id]">) {
  return (
    <Suspense fallback={<FichaEsqueleto />}>
      <ContenidoFicha params={params} />
    </Suspense>
  );
}

async function ContenidoFicha({ params }: Pick<PageProps<"/pokemon/[id]">, "params">) {
  const id = leerId((await params).id);
  if (!id) notFound();
  const [pokemon, cadena, regiones, movimientos] = await Promise.all([
    obtenerPokemon(id),
    evolucionesDe(id),
    listarRegiones(),
    movimientosDePokemon(id),
  ]);
  if (!pokemon) notFound();

  const nombre = nombreVisible(pokemon);
  const grito = gritoUrl(pokemon.idPokedex);
  const capturas = capturasDePokemon(pokemon.idPokedex);
  return (
    <article className="flex flex-col gap-6">
      <Vecinos id={id} />

      <Tarjeta className="grid gap-6 p-4 sm:p-6 md:grid-cols-[minmax(0,18rem)_1fr]">
        <div className="mx-auto flex w-full max-w-72 flex-col gap-3">
          <IlustracionFicha normal={pokemon.imagenUrl} shiny={ilustracionShinyUrl(pokemon.idPokedex)} nombre={nombre}>
            {grito && <BotonGrito src={grito} nombre={nombre} />}
          </IlustracionFicha>
        </div>
        <div className="flex flex-col gap-4">
          <header className="flex flex-col gap-2">
            <p className="font-datos text-sm text-texto-secundario tabular-nums">{numeroPokedex(pokemon.idPokedex)}</p>
            <h1 className="text-3xl font-bold sm:text-4xl">{nombre}</h1>
            <ListaTipos tipos={pokemon.tipos} />
          </header>
          {pokemon.descripcion && <p className="max-w-prose">{pokemon.descripcion}</p>}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
            <Dato etiqueta="Generación" valor={pokemon.generacion ?? "—"} />
            <Dato etiqueta="Región" valor={pokemon.region ?? "—"} />
            <Dato etiqueta="Altura" valor={formatoAltura(pokemon.altura)} datos />
            <Dato etiqueta="Peso" valor={formatoPeso(pokemon.peso)} datos />
          </dl>
          <p>
            <EnlaceExterno enlace={enlaceDePokemon(pokemon.idPokedex, nombre)} />
          </p>
        </div>
      </Tarjeta>

      <div className="grid gap-6 lg:grid-cols-2">
        <Seccion id="estadisticas" titulo="Estadísticas base">
          <EstadisticasBase pokemon={pokemon} />
        </Seccion>
        <Seccion id="obtencion" titulo="Dónde se obtiene">
          <DondeSeObtiene pokemon={pokemon} regiones={regiones} />
        </Seccion>
      </div>

      {capturas.length > 0 && (
        <Seccion id="en-el-juego" titulo="Cómo se consigue en el juego">
          <CapturasDelJuego capturas={capturas} />
        </Seccion>
      )}

      <Seccion id="evoluciones" titulo="Cadena evolutiva">
        <CadenaEvolutiva cadena={cadena ?? etapaSola(pokemon)} idActual={pokemon.idPokedex} />
      </Seccion>

      <MovimientosQueAprende movimientos={movimientos ?? []} nombre={nombre} />
    </article>
  );
}

/** Sección desplegable (cerrada al cargar: son ~100 filas). Ordenados por el nombre que se muestra. */
function MovimientosQueAprende({ movimientos, nombre }: { movimientos: Movimiento[]; nombre: string }) {
  const ordenados = [...movimientos].sort((a, b) => nombreVisible(a).localeCompare(nombreVisible(b), "es"));
  return (
    <section aria-labelledby="titulo-movimientos">
      <details className="group rounded-lg border border-borde-suave bg-superficie">
        <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 sm:px-6 [&::-webkit-details-marker]:hidden">
          <h2 id="titulo-movimientos" className="text-xl font-bold">
            Movimientos que aprende{" "}
            <span className="font-datos text-base font-medium text-texto-secundario tabular-nums">({movimientos.length})</span>
          </h2>
          <span aria-hidden="true" className="text-texto-secundario transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
          {movimientos.length === 0 ? (
            <p className="text-texto-secundario">No hay movimientos registrados para este Pokémon.</p>
          ) : (
            <TablaMovimientos movimientos={ordenados} titulo={`Movimientos que aprende ${nombre}`} />
          )}
        </div>
      </details>
    </section>
  );
}

function FichaEsqueleto() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando ficha">
      <Esqueleto className="h-10 w-full" />
      <Esqueleto className="h-80 w-full rounded-lg md:h-72" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Esqueleto className="h-64 rounded-lg" />
        <Esqueleto className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

function etapaSola(pokemon: Pokemon) {
  const { idPokedex, nombre, nombreEs, imagenUrl } = pokemon;
  return { idPokedex, nombre, nombreEs, imagenUrl, condicion: null, evoluciones: [] };
}

function Dato({ etiqueta, valor, datos = false }: { etiqueta: string; valor: string | number; datos?: boolean }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs font-semibold text-texto-secundario">{etiqueta}</dt>
      <dd className={datos ? "font-datos tabular-nums" : ""}>{valor}</dd>
    </div>
  );
}

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`titulo-${id}`}>
      <Tarjeta className="flex h-full flex-col gap-4 p-4 sm:p-6">
        <h2 id={`titulo-${id}`} className="text-xl font-bold">
          {titulo}
        </h2>
        {children}
      </Tarjeta>
    </section>
  );
}

/** "← #024 Raichu" · "#026 Raichu →"; sin anterior en el #001 ni siguiente en el #1025. */
async function Vecinos({ id }: { id: number }) {
  const [anterior, siguiente] = await Promise.all([
    id > PRIMERO ? obtenerPokemon(id - 1) : null,
    id < ULTIMO ? obtenerPokemon(id + 1) : null,
  ]);
  const clases = "inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm text-texto-secundario hover:bg-superficie hover:text-texto sm:min-h-10";
  return (
    <nav aria-label="Pokémon vecinos" className="flex items-center justify-between gap-2">
      {anterior ? (
        <Link href={`/pokemon/${anterior.idPokedex}`} className={clases}>
          <span aria-hidden="true">←</span>
          <span className="font-datos tabular-nums">{numeroPokedex(anterior.idPokedex)}</span>
          <span className="hidden sm:inline">{nombreVisible(anterior)}</span>
        </Link>
      ) : (
        <span />
      )}
      <Link href="/" className={clases}>
        Catálogo
      </Link>
      {siguiente ? (
        <Link href={`/pokemon/${siguiente.idPokedex}`} className={clases}>
          <span className="hidden sm:inline">{nombreVisible(siguiente)}</span>
          <span className="font-datos tabular-nums">{numeroPokedex(siguiente.idPokedex)}</span>
          <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
