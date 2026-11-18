import type { Metadata } from "next";
import { Suspense } from "react";
import FormularioRuta from "@/components/admin/FormularioRuta";
import Esqueleto from "@/components/ui/Esqueleto";
import { listarRegiones } from "@/lib/api";

export const metadata: Metadata = { title: "Crear ruta" };

export default function NuevaRuta() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold sm:text-4xl">Crear ruta</h1>
      <Suspense fallback={<Esqueleto className="h-72 w-full rounded-lg" />}>
        <Formulario />
      </Suspense>
    </div>
  );
}

async function Formulario() {
  return <FormularioRuta ruta={null} regiones={await listarRegiones()} />;
}
