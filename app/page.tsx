import type { Metadata } from "next";

export const metadata: Metadata = {
  // La plantilla "%s · Pokedex+" del layout no se aplica a la página de su mismo segmento
  title: { absolute: "Catálogo · Pokedex+" },
};

// Provisional: el catálogo (P1) se implementa en FE.8.
export default function Catalogo() {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold sm:text-4xl">Catálogo</h1>
      <p className="text-texto-secundario">Los 1025 Pokémon de las 9 generaciones.</p>
    </section>
  );
}
