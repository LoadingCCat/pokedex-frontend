import type { Metadata } from "next";
import { Suspense } from "react";
import FormularioMovimiento from "@/components/admin/FormularioMovimiento";
import { EnlaceBoton } from "@/components/ui/Boton";
import Esqueleto from "@/components/ui/Esqueleto";
import EstadoVacio from "@/components/ui/EstadoVacio";
import { listarTipos } from "@/lib/api";
import { obtenerMovimiento } from "@/lib/api/admin";
import { nombreVisible } from "@/lib/formato";
import { leerId } from "@/lib/parametros-url";
import { adminDisponible } from "@/lib/sesion-comun";

export const metadata: Metadata = { title: "Editar movimiento" };

export default function EditarMovimiento({ params }: PageProps<"/admin/movimientos/[id]">) {
  return (
    <Suspense fallback={<Esqueleto className="h-80 w-full rounded-lg" />}>
      <Contenido params={params} />
    </Suspense>
  );
}

async function Contenido({ params }: Pick<PageProps<"/admin/movimientos/[id]">, "params">) {
  const id = leerId((await params).id);
  // Sin API el layout ya muestra el aviso; aquí no se pide nada
  if (!adminDisponible()) return null;
  const [movimiento, tipos] = await Promise.all([id ? obtenerMovimiento(id) : null, listarTipos()]);
  if (!movimiento) {
    return (
      <EstadoVacio
        titulo="Ese movimiento no existe."
        mensaje="Quizá se eliminó. Vuelve al listado."
        accion={<EnlaceBoton href="/admin/movimientos">Ir al listado</EnlaceBoton>}
      />
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold sm:text-4xl">Editar {nombreVisible(movimiento)}</h1>
      <FormularioMovimiento movimiento={movimiento} tipos={tipos} />
    </div>
  );
}
