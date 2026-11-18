import type { Metadata } from "next";
import { Suspense } from "react";
import FormularioPokemon from "@/components/admin/FormularioPokemon";
import Esqueleto from "@/components/ui/Esqueleto";
import { listarTipos } from "@/lib/api";

export const metadata: Metadata = { title: "Crear Pokémon" };

export default function NuevoPokemon() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold sm:text-4xl">Crear Pokémon</h1>
      <Suspense fallback={<Esqueleto className="h-[40rem] w-full rounded-lg" />}>
        <Formulario />
      </Suspense>
    </div>
  );
}

async function Formulario() {
  return <FormularioPokemon pokemon={null} tipos={await listarTipos()} />;
}
