import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { EnlaceBoton } from "@/components/ui/Boton";
import Esqueleto from "@/components/ui/Esqueleto";
import EstadoVacio from "@/components/ui/EstadoVacio";
import Paginacion from "@/components/ui/Paginacion";
import { listarRegiones, rutasDeRegion } from "@/lib/api";
import { conPagina, leerPagina } from "@/lib/parametros-url";
import { mapaDeRegion } from "@/lib/imagenes";
import FiguraCreditada from "@/components/ui/FiguraCreditada";
import EnlaceExterno from "@/components/ui/EnlaceExterno";
import { enlaceDeLugar, enlaceDeRegion } from "@/lib/enlaces-wikidex";

const TAMANO = 24;

/** Nombre oficial de la región ("kanto" → "Kanto") o null si no es una de las 9. */
async function regionOficial(segmento: string): Promise<string | null> {
  const buscada = decodeURIComponent(segmento).toLowerCase();
  return (await listarRegiones()).find((r) => r.toLowerCase() === buscada) ?? null;
}

export async function generateMetadata({ params }: PageProps<"/regiones/[region]">): Promise<Metadata> {
  const region = await regionOficial((await params).region);
  return { title: region ?? "Región no encontrada" };
}

/** P4 · Rutas de una región (docs/pantallas.md). */
export default function PaginaRegion({ params, searchParams }: PageProps<"/regiones/[region]">) {
  return (
    <Suspense fallback={<RegionEsqueleto />}>
      <ContenidoRegion params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function ContenidoRegion({ params, searchParams }: Pick<PageProps<"/regiones/[region]">, "params" | "searchParams">) {
  const [{ region: segmento }, parametros, regiones] = await Promise.all([params, searchParams, listarRegiones()]);
  const region = await regionOficial(segmento);
  if (!region) notFound();
  const pagina = leerPagina(parametros);
  const ruta = `/regiones/${region.toLowerCase()}`;
  const generacion = regiones.indexOf(region) + 1;
  const mapa = mapaDeRegion(region);

  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Ruta de navegación" className="text-sm text-texto-secundario">
        <Link href="/regiones" className="text-acento underline-offset-2 hover:underline">
          Regiones
        </Link>{" "}
        <span aria-hidden="true">/</span> {region}
      </nav>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="font-datos text-sm text-texto-secundario">Generación {generacion}</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{region}</h1>
          <EnlaceExterno enlace={enlaceDeRegion(region)} className="self-start" />
        </div>
        <EnlaceBoton href={`/?region=${region.toLowerCase()}`} variante="principal">
          Ver Pokémon de {region}
        </EnlaceBoton>
      </header>
      {mapa && (
        <FiguraCreditada
          imagen={mapa}
          // Con el alto acotado a 34rem, un mapa apaisado mide como mucho ~780 px de ancho
          sizes="(min-width: 820px) 780px, 100vw"
          // Alto acotado: un mapa vertical (Galar) no empuja la lista de lugares fuera de la pantalla
          imagenClassName="h-auto max-h-[34rem] w-auto max-w-full"
          prioridad
        />
      )}
      <Suspense key={`rutas:${pagina}`} fallback={<ListaEsqueleto />}>
        <RutasDeRegion region={region} pagina={pagina} ruta={ruta} />
      </Suspense>
    </div>
  );
}

async function RutasDeRegion({ region, pagina, ruta }: { region: string; pagina: number; ruta: string }) {
  let resultado;
  try {
    resultado = await rutasDeRegion(region, { page: pagina - 1, size: TAMANO });
  } catch (error) {
    console.error("No se pudieron cargar las rutas", error);
    return (
      <EstadoVacio
        tipo="error"
        titulo="No se pudieron cargar los lugares."
        mensaje="Vuelve a intentarlo en unos segundos."
        accion={<EnlaceBoton href={conPagina(ruta, pagina)}>Reintentar</EnlaceBoton>}
      />
    );
  }

  const { totalElements, totalPages } = resultado.page;
  if (totalElements === 0) {
    return (
      <EstadoVacio
        titulo={`La PokeAPI no tiene lugares registrados en ${region}.`}
        mensaje="Los Pokémon de esta región se explican en su ficha, en «Dónde se obtiene»."
      />
    );
  }
  if (resultado.content.length === 0) {
    return (
      <EstadoVacio
        titulo={`La página ${pagina} no existe.`}
        mensaje={`Hay ${totalPages} ${totalPages === 1 ? "página" : "páginas"}.`}
        accion={<EnlaceBoton href={ruta}>Ir a la página 1</EnlaceBoton>}
      />
    );
  }

  return (
    <section aria-labelledby="titulo-lugares" className="flex flex-col gap-4">
      <h2 id="titulo-lugares" className="text-xl font-bold">
        Lugares{" "}
        <span className="font-datos text-base font-medium text-texto-secundario tabular-nums">({totalElements})</span>
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {resultado.content.map((r) => (
          <li key={r.idRuta} className="flex items-center gap-3 rounded-md border border-borde-suave bg-superficie pr-3">
            <Link
              href={`/rutas/${r.idRuta}`}
              className="flex min-h-11 min-w-0 flex-1 items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-acento"
            >
              {r.nombre}
            </Link>
            {/* Enlace secundario corto: el nombre del lugar va en su texto accesible */}
            <EnlaceExterno enlace={enlaceDeLugar(r.idPokeapi, r.nombre, region)} compacto de={r.nombre} className="shrink-0" />
          </li>
        ))}
      </ul>
      <Paginacion pagina={pagina - 1} totalPaginas={totalPages} hrefPagina={(n) => conPagina(ruta, n + 1)} />
    </section>
  );
}

function ListaEsqueleto() {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Cargando lugares">
      {Array.from({ length: 12 }, (_, i) => (
        <Esqueleto key={i} className="h-11" />
      ))}
    </div>
  );
}

function RegionEsqueleto() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando región">
      <Esqueleto className="h-4 w-32" />
      <Esqueleto className="h-12 w-60" />
      <ListaEsqueleto />
    </div>
  );
}
