import type { Metadata } from "next";
import { Suspense } from "react";
import { eliminarMovimiento } from "@/app/admin/acciones";
import AvisoGuardado from "@/components/admin/AvisoGuardado";
import BotonEliminar from "@/components/admin/BotonEliminar";
import BuscadorAdmin from "@/components/admin/BuscadorAdmin";
import FilaAdmin from "@/components/admin/FilaAdmin";
import InsigniaTipo from "@/components/pokemon/InsigniaTipo";
import { EnlaceBoton } from "@/components/ui/Boton";
import Esqueleto from "@/components/ui/Esqueleto";
import EstadoVacio from "@/components/ui/EstadoVacio";
import Paginacion from "@/components/ui/Paginacion";
import { listarMovimientos, type Movimiento, type Pagina } from "@/lib/api";
import { textoAviso } from "@/lib/avisos-admin";
import { nombreVisible } from "@/lib/formato";
import { leerPagina, primero } from "@/lib/parametros-url";

export const metadata: Metadata = { title: "Movimientos" };

const hrefListado = (nombre: string | undefined, pagina: number) => {
  const p = new URLSearchParams();
  if (nombre) p.set("nombre", nombre);
  if (pagina > 1) p.set("page", String(pagina));
  const q = p.toString();
  return q ? `/admin/movimientos?${q}` : "/admin/movimientos";
};

/** P8 · Movimientos: listado paginado con búsqueda, Crear, Editar y Eliminar. */
export default function AdminMovimientos({ searchParams }: PageProps<"/admin/movimientos">) {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">Movimientos</h1>
        <EnlaceBoton href="/admin/movimientos/nuevo" variante="principal">
          Crear movimiento
        </EnlaceBoton>
      </header>
      <Suspense fallback={<Esqueleto className="h-96 w-full rounded-lg" />}>
        <Listado searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Listado({ searchParams }: Pick<PageProps<"/admin/movimientos">, "searchParams">) {
  const parametros = await searchParams;
  const nombre = primero(parametros.nombre)?.slice(0, 100);
  const pagina = leerPagina(parametros);

  let datos: Pagina<Movimiento>;
  try {
    datos = await listarMovimientos({ nombre, page: pagina - 1, size: 20 });
  } catch (error) {
    console.error("Panel: no se pudo cargar el listado de movimientos", error);
    return <EstadoVacio tipo="error" titulo="No se pudieron cargar los movimientos." mensaje="Comprueba que el backend esté arrancado y vuelve a intentarlo." />;
  }

  return (
    <>
      <AvisoGuardado texto={textoAviso(parametros)} />
      <BuscadorAdmin accion="/admin/movimientos" valor={nombre} etiqueta="Buscar por nombre" />
      <p className="text-sm text-texto-secundario">
        <span className="font-datos tabular-nums text-texto">{datos.page.totalElements}</span> movimientos
        {nombre ? ` que coinciden con «${nombre}»` : ""}.
      </p>
      {datos.content.length === 0 ? (
        <EstadoVacio titulo="No hay movimientos con ese nombre." mensaje="Prueba con otro nombre, con o sin tildes." />
      ) : (
        <ul className="rounded-lg border border-borde-suave bg-superficie px-3">
          {datos.content.map((m) => {
            const nombreM = nombreVisible(m);
            return (
              <FilaAdmin
                key={m.idMovimiento}
                acciones={
                  <>
                    <EnlaceBoton href={`/admin/movimientos/${m.idMovimiento}`} className="px-3">
                      Editar<span className="sr-only"> {nombreM}</span>
                    </EnlaceBoton>
                    <BotonEliminar nombre={nombreM} accion={eliminarMovimiento.bind(null, m.idMovimiento)} listado="/admin/movimientos" />
                  </>
                }
              >
                <span className="font-semibold">{nombreM}</span>
                {m.tipo && <InsigniaTipo tipo={m.tipo} />}
                <span className="text-sm text-texto-secundario">
                  {m.categoria} · Potencia <span className="font-datos tabular-nums">{m.potencia ?? "—"}</span>
                </span>
              </FilaAdmin>
            );
          })}
        </ul>
      )}
      <Paginacion pagina={datos.page.number} totalPaginas={datos.page.totalPages} hrefPagina={(n) => hrefListado(nombre, n + 1)} />
    </>
  );
}
