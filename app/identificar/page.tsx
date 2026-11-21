import type { Metadata } from "next";
import AvisoIdentificarNoDisponible from "@/components/pokemon/AvisoIdentificarNoDisponible";
import IdentificadorFoto from "@/components/pokemon/IdentificadorFoto";
import { AVISO_PRIVACIDAD } from "@/lib/identificar-mensajes";
import { apiDisponible } from "@/lib/sesion-comun";

export const metadata: Metadata = {
  title: "Identificar por foto",
  description: "Sube o toma una foto de un Pokémon y descubre cuál es, con 3 parecidos.",
};

/** P9 · Identificar (docs/pantallas.md). Sin API (modo mock) solo muestra el aviso. */
export default function Identificar() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex max-w-prose flex-col gap-2">
        <h1 className="text-3xl font-bold sm:text-4xl">Identificar por foto</h1>
        <p className="text-texto-secundario">
          Toma o elige una foto de un Pokémon (una carta, una pantalla, un peluche) y te decimos cuál es, con 3 parecidos.
        </p>
        <p className="text-sm text-texto-secundario">{AVISO_PRIVACIDAD}</p>
      </header>
      {apiDisponible() ? <IdentificadorFoto /> : <AvisoIdentificarNoDisponible />}
    </div>
  );
}
