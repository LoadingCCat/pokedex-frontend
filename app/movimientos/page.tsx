import type { Metadata } from "next";
import { Suspense } from "react";
import FiltrosMovimientos from "@/components/pokemon/FiltrosMovimientos";
import TablaMovimientos from "@/components/pokemon/TablaMovimientos";
import { EnlaceBoton } from "@/components/ui/Boton";
import Esqueleto from "@/components/ui/Esqueleto";
import EstadoVacio from "@/components/ui/EstadoVacio";
import Paginacion from "@/components/ui/Paginacion";
import { listarMovimientos, type Movimiento, type Pagina } from "@/lib/api";
import {
  VISTAS_MOVIMIENTO,
  aFiltrosMovimiento,
  hrefMovimientos,
  leerMovimientos,
  type EstadoMovimientos,
} from "@/lib/parametros-movimientos";

export const metadata: Metadata = {
  title: "Movimientos",
};

/** P3 · Movimientos (docs/pantallas.md). El estado vive en la URL. */
export default function Movimientos({ searchParams }: PageProps<"/movimientos">) {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold sm:text-4xl">Movimientos</h1>
        <p className="text-texto-secundario">Busca un movimiento o filtra por categoría y por los competitivos.</p>
      </header>
      <Suspense fallback={<Esqueleto className="h-40 w-full rounded-lg sm:h-24" />}>
        <ContenidoMovimientos searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ContenidoMovimientos({ searchParams }: Pick<PageProps<"/movimientos">, "searchParams">) {
  const estado = leerMovimientos(await searchParams);
  const urlActual = hrefMovimientos(estado, { pagina: estado.pagina });
  return (
    <>
      <FiltrosMovimientos key={`filtros:${urlActual}`} estado={estado} />
      <Suspense key={`resultados:${urlActual}`} fallback={<TablaEsqueleto />}>
        <Resultados estado={estado} />
      </Suspense>
    </>
  );
}

function descripcionBusqueda(estado: EstadoMovimientos): string {
  if (estado.nombre) return `que coinciden con «${estado.nombre}»`;
  if (estado.vista === "competitivos") return "competitivos (potencia mayor a 80)";
  const vista = VISTAS_MOVIMIENTO.find((v) => v.valor === estado.vista);
  return vista?.valor ? `de categoría ${vista.etiqueta}` : "en total";
}

async function Resultados({ estado }: { estado: EstadoMovimientos }) {
  let pagina: Pagina<Movimiento>;
  try {
    pagina = await listarMovimientos(aFiltrosMovimiento(estado));
  } catch (error) {
    console.error("No se pudieron cargar los movimientos", error);
    return (
      <EstadoVacio
        tipo="error"
        titulo="No se pudieron cargar los movimientos."
        mensaje="Vuelve a intentarlo en unos segundos."
        accion={<EnlaceBoton href={hrefMovimientos(estado, { pagina: estado.pagina })}>Reintentar</EnlaceBoton>}
      />
    );
  }

  const { totalElements, totalPages } = pagina.page;
  if (totalElements === 0) {
    return (
      <EstadoVacio
        titulo={estado.nombre ? `Sin resultados para «${estado.nombre}».` : "No hay movimientos en esta vista."}
        mensaje="Prueba con otro nombre, con o sin tildes."
        accion={<EnlaceBoton href="/movimientos">Ver todos</EnlaceBoton>}
      />
    );
  }
  if (pagina.content.length === 0) {
    return (
      <EstadoVacio
        titulo={`La página ${estado.pagina} no existe.`}
        mensaje={`Hay ${totalPages} ${totalPages === 1 ? "página" : "páginas"}.`}
        accion={<EnlaceBoton href={hrefMovimientos(estado)}>Ir a la página 1</EnlaceBoton>}
      />
    );
  }

  return (
    <section aria-labelledby="titulo-resultados" className="flex flex-col gap-4">
      <h2 id="titulo-resultados" className="sr-only">
        Resultados
      </h2>
      <p className="text-sm text-texto-secundario" role="status">
        <span className="font-datos tabular-nums text-texto">{totalElements}</span>{" "}
        {totalElements === 1 ? "movimiento" : "movimientos"} {descripcionBusqueda(estado)}
        {totalPages > 1 && ` · página ${estado.pagina} de ${totalPages}`}
      </p>
      <TablaMovimientos movimientos={pagina.content} titulo="Movimientos" />
      <Paginacion
        pagina={estado.pagina - 1}
        totalPaginas={totalPages}
        hrefPagina={(n) => hrefMovimientos(estado, { pagina: n + 1 })}
      />
    </section>
  );
}

function TablaEsqueleto() {
  return (
    <div className="flex flex-col gap-2" aria-busy="true" aria-label="Cargando movimientos">
      <Esqueleto className="h-4 w-56" />
      {Array.from({ length: 10 }, (_, i) => (
        <Esqueleto key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}
