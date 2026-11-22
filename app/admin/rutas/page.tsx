import type { Metadata } from "next";
import { Suspense } from "react";
import { eliminarRuta } from "@/app/admin/acciones";
import AvisoGuardado from "@/components/admin/AvisoGuardado";
import BotonEliminar from "@/components/admin/BotonEliminar";
import FilaAdmin from "@/components/admin/FilaAdmin";
import { EnlaceBoton, clasesBoton } from "@/components/ui/Boton";
import { CLASES_CAMPO } from "@/components/ui/Campo";
import Esqueleto from "@/components/ui/Esqueleto";
import EstadoVacio from "@/components/ui/EstadoVacio";
import Paginacion from "@/components/ui/Paginacion";
import { listarRegiones, rutasDeRegion, type Pagina, type Ruta } from "@/lib/api";
import { textoAviso } from "@/lib/avisos-admin";
import { leerPagina, primero } from "@/lib/parametros-url";

export const metadata: Metadata = { title: "Rutas" };

const hrefListado = (region: string, pagina: number) => {
  const p = new URLSearchParams({ region: region.toLowerCase() });
  if (pagina > 1) p.set("page", String(pagina));
  return `/admin/rutas?${p}`;
};

/**
 * P8 · Rutas: listado paginado por región (la API no busca rutas por nombre), Crear, Editar y
 * Eliminar. El número de cada ruta es el que se escribe en el formulario de Pokémon.
 */
export default function AdminRutas({ searchParams }: PageProps<"/admin/rutas">) {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">Rutas</h1>
        <EnlaceBoton href="/admin/rutas/nueva" variante="principal">
          Crear ruta
        </EnlaceBoton>
      </header>
      <Suspense fallback={<Esqueleto className="h-96 w-full rounded-lg" />}>
        <Listado searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Listado({ searchParams }: Pick<PageProps<"/admin/rutas">, "searchParams">) {
  const parametros = await searchParams;
  const pagina = leerPagina(parametros);

  let regiones: string[];
  let datos: Pagina<Ruta>;
  let region: string;
  try {
    regiones = await listarRegiones();
    const pedida = primero(parametros.region)?.toLowerCase();
    region = regiones.find((r) => r.toLowerCase() === pedida) ?? regiones[0] ?? "Kanto";
    datos = await rutasDeRegion(region, { page: pagina - 1, size: 20 });
  } catch (error) {
    console.error("Panel: no se pudo cargar el listado de rutas", error);
    return <EstadoVacio tipo="error" titulo="No se pudieron cargar las rutas." mensaje="Comprueba que el backend esté arrancado y vuelve a intentarlo." />;
  }

  return (
    <>
      <AvisoGuardado texto={textoAviso(parametros)} />
      <form action="/admin/rutas" className="flex flex-wrap items-end gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <label htmlFor="admin-region" className="text-sm font-semibold text-texto">
            Región
          </label>
          <select id="admin-region" name="region" defaultValue={region.toLowerCase()} className={`${CLASES_CAMPO} border-borde`}>
            {regiones.map((r) => (
              <option key={r} value={r.toLowerCase()}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={clasesBoton("secundario")}>
          Ver
        </button>
      </form>
      <p className="text-sm text-texto-secundario">
        <span className="font-datos tabular-nums text-texto">{datos.page.totalElements}</span> rutas en {region}.
      </p>
      {datos.content.length === 0 ? (
        <EstadoVacio titulo={`No hay rutas en ${region}.`} mensaje="Crea una con el botón «Crear ruta»." />
      ) : (
        <ul className="rounded-lg border border-borde-suave bg-superficie px-3">
          {datos.content.map((r) => (
            <FilaAdmin
              key={r.idRuta}
              acciones={
                <>
                  <EnlaceBoton href={`/admin/rutas/${r.idRuta}`} className="px-3">
                    Editar<span className="sr-only"> {r.nombre}</span>
                  </EnlaceBoton>
                  <BotonEliminar nombre={r.nombre} accion={eliminarRuta.bind(null, r.idRuta)} listado={hrefListado(region, 1)} />
                </>
              }
            >
              <span className="font-datos tabular-nums text-texto-secundario">N.º {r.idRuta}</span>
              <span className="font-semibold">{r.nombre}</span>
              <span className="text-sm text-texto-secundario">{r.idPokeapi == null ? "Creada a mano" : "Importada"}</span>
            </FilaAdmin>
          ))}
        </ul>
      )}
      <Paginacion pagina={datos.page.number} totalPaginas={datos.page.totalPages} hrefPagina={(n) => hrefListado(region, n + 1)} />
    </>
  );
}
