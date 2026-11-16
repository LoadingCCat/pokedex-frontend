import type { Metadata } from "next";
import { EnlaceBoton } from "@/components/ui/Boton";
import EstadoVacio from "@/components/ui/EstadoVacio";

export const metadata: Metadata = {
  title: { absolute: "Página no encontrada · Pokedex+" },
};

/** 404 propio: Pokémon, ruta o región inexistente, o una URL que no existe. */
export default function NoEncontrado() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold sm:text-4xl">No encontramos esta página</h1>
      <EstadoVacio
        titulo="Lo que buscas no existe en la Pokédex."
        mensaje="Revisa el número o el enlace, o vuelve al catálogo para buscarlo por nombre."
        accion={
          <EnlaceBoton href="/" variante="principal">
            Ir al catálogo
          </EnlaceBoton>
        }
      />
    </div>
  );
}
