import type { Metadata } from "next";
import { Suspense } from "react";
import FormularioPokemon from "@/components/admin/FormularioPokemon";
import { EnlaceBoton } from "@/components/ui/Boton";
import Esqueleto from "@/components/ui/Esqueleto";
import EstadoVacio from "@/components/ui/EstadoVacio";
import { listarTipos, obtenerPokemon } from "@/lib/api";
import { nombreVisible, numeroPokedex } from "@/lib/formato";
import { leerId } from "@/lib/parametros-url";

export const metadata: Metadata = { title: "Editar Pokémon" };

export default function EditarPokemon({ params }: PageProps<"/admin/pokemon/[id]">) {
  return (
    <Suspense fallback={<Esqueleto className="h-[40rem] w-full rounded-lg" />}>
      <Contenido params={params} />
    </Suspense>
  );
}

async function Contenido({ params }: Pick<PageProps<"/admin/pokemon/[id]">, "params">) {
  const id = leerId((await params).id);
  const [pokemon, tipos] = await Promise.all([id ? obtenerPokemon(id) : null, listarTipos()]);
  if (!pokemon) {
    return (
      <EstadoVacio
        titulo="Ese Pokémon no existe."
        mensaje="Quizá se eliminó. Vuelve al listado."
        accion={<EnlaceBoton href="/admin/pokemon">Ir al listado</EnlaceBoton>}
      />
    );
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold sm:text-4xl">
        Editar {nombreVisible(pokemon)} <span className="font-datos text-xl text-texto-secundario">{numeroPokedex(pokemon.idPokedex)}</span>
      </h1>
      <FormularioPokemon pokemon={pokemon} tipos={tipos} />
    </div>
  );
}
