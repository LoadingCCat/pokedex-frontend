import type { Metadata } from "next";
import { Suspense } from "react";
import FormularioRuta from "@/components/admin/FormularioRuta";
import { EnlaceBoton } from "@/components/ui/Boton";
import Esqueleto from "@/components/ui/Esqueleto";
import EstadoVacio from "@/components/ui/EstadoVacio";
import { listarRegiones, obtenerRuta } from "@/lib/api";
import { leerId } from "@/lib/parametros-url";

export const metadata: Metadata = { title: "Editar ruta" };

export default function EditarRuta({ params }: PageProps<"/admin/rutas/[id]">) {
  return (
    <Suspense fallback={<Esqueleto className="h-72 w-full rounded-lg" />}>
      <Contenido params={params} />
    </Suspense>
  );
}

async function Contenido({ params }: Pick<PageProps<"/admin/rutas/[id]">, "params">) {
  const id = leerId((await params).id);
  const [ruta, regiones] = await Promise.all([id ? obtenerRuta(id) : null, listarRegiones()]);
  if (!ruta) {
    return (
      <EstadoVacio
        titulo="Esa ruta no existe."
        mensaje="Quizá se eliminó. Vuelve al listado."
        accion={<EnlaceBoton href="/admin/rutas">Ir al listado</EnlaceBoton>}
      />
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold sm:text-4xl">Editar {ruta.nombre}</h1>
      <FormularioRuta ruta={ruta} regiones={regiones} />
    </div>
  );
}
