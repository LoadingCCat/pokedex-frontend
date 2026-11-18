import type { Metadata } from "next";
import { Suspense } from "react";
import FormularioMovimiento from "@/components/admin/FormularioMovimiento";
import Esqueleto from "@/components/ui/Esqueleto";
import { listarTipos } from "@/lib/api";

export const metadata: Metadata = { title: "Crear movimiento" };

export default function NuevoMovimiento() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold sm:text-4xl">Crear movimiento</h1>
      <Suspense fallback={<Esqueleto className="h-80 w-full rounded-lg" />}>
        <Formulario />
      </Suspense>
    </div>
  );
}

async function Formulario() {
  return <FormularioMovimiento movimiento={null} tipos={await listarTipos()} />;
}
