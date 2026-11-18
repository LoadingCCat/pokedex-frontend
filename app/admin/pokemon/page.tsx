import type { Metadata } from "next";
import { Suspense } from "react";
import { eliminarPokemon } from "@/app/admin/acciones";
import AvisoGuardado from "@/components/admin/AvisoGuardado";
import BotonEliminar from "@/components/admin/BotonEliminar";
import BuscadorAdmin from "@/components/admin/BuscadorAdmin";
import FilaAdmin from "@/components/admin/FilaAdmin";
import { ListaTipos } from "@/components/pokemon/InsigniaTipo";
import { EnlaceBoton } from "@/components/ui/Boton";
import Esqueleto from "@/components/ui/Esqueleto";
import EstadoVacio from "@/components/ui/EstadoVacio";
import Paginacion from "@/components/ui/Paginacion";
import { listarPokemons, type Pagina, type Pokemon } from "@/lib/api";
import { textoAviso } from "@/lib/avisos-admin";
import { nombreVisible, numeroPokedex } from "@/lib/formato";
import { leerPagina, primero } from "@/lib/parametros-url";

export const metadata: Metadata = { title: "Pokémon" };

const hrefListado = (nombre: string | undefined, pagina: number) => {
  const p = new URLSearchParams();
  if (nombre) p.set("nombre", nombre);
  if (pagina > 1) p.set("page", String(pagina));
  const q = p.toString();
  return q ? `/admin/pokemon?${q}` : "/admin/pokemon";
};

/** P8 · Pokémon: listado paginado con búsqueda, Crear, Editar y Eliminar. */
export default function AdminPokemon({ searchParams }: PageProps<"/admin/pokemon">) {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">Pokémon</h1>
        <EnlaceBoton href="/admin/pokemon/nuevo" variante="principal">
          Crear Pokémon
        </EnlaceBoton>
      </header>
      <Suspense fallback={<Esqueleto className="h-96 w-full rounded-lg" />}>
        <Listado searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Listado({ searchParams }: Pick<PageProps<"/admin/pokemon">, "searchParams">) {
  const parametros = await searchParams;
  const nombre = primero(parametros.nombre)?.slice(0, 100);
  const pagina = leerPagina(parametros);

  let datos: Pagina<Pokemon>;
  try {
    datos = await listarPokemons({ nombre, page: pagina - 1, size: 20 });
  } catch (error) {
    console.error("Panel: no se pudo cargar el listado de Pokémon", error);
    return <EstadoVacio tipo="error" titulo="No se pudieron cargar los Pokémon." mensaje="Comprueba que el backend esté arrancado y vuelve a intentarlo." />;
  }

  return (
    <>
      <AvisoGuardado texto={textoAviso(parametros)} />
      <BuscadorAdmin accion="/admin/pokemon" valor={nombre} etiqueta="Buscar por nombre" />
      <p className="text-sm text-texto-secundario">
        <span className="font-datos tabular-nums text-texto">{datos.page.totalElements}</span> Pokémon
        {nombre ? ` que coinciden con «${nombre}»` : ""}.
      </p>
      {datos.content.length === 0 ? (
        <EstadoVacio titulo="No hay Pokémon con ese nombre." mensaje="Prueba con otro nombre, con o sin tildes." />
      ) : (
        <ul className="rounded-lg border border-borde-suave bg-superficie px-3">
          {datos.content.map((p) => {
            const nombreP = nombreVisible(p);
            return (
              <FilaAdmin
                key={p.idPokedex}
                acciones={
                  <>
                    <EnlaceBoton href={`/admin/pokemon/${p.idPokedex}`} className="min-h-9 px-3 sm:min-h-9">
                      Editar<span className="sr-only"> {nombreP}</span>
                    </EnlaceBoton>
                    <BotonEliminar nombre={nombreP} accion={eliminarPokemon.bind(null, p.idPokedex)} listado="/admin/pokemon" />
                  </>
                }
              >
                <span className="font-datos tabular-nums text-texto-secundario">{numeroPokedex(p.idPokedex)}</span>
                <span className="font-semibold">{nombreP}</span>
                <ListaTipos tipos={p.tipos} />
              </FilaAdmin>
            );
          })}
        </ul>
      )}
      <Paginacion pagina={datos.page.number} totalPaginas={datos.page.totalPages} hrefPagina={(n) => hrefListado(nombre, n + 1)} />
    </>
  );
}
