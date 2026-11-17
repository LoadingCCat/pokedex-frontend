/**
 * Qué capturas muestra "Cómo se consigue en el juego" en la ficha (Fase 5, FE.29–FE.30):
 * - las propias del Pokémon (elegidas a mano: legendarios, singulares, iniciales), si tiene;
 * - si no, hasta 2 capturas de lugares donde aparece ("Aparece en Bosque Verde"), enlazadas a su
 *   página: primero los de su región de origen, las capturas del juego antes que las vistas desde
 *   arriba y, a igualdad, por nombre.
 * Función pura para poder probarla sin Next.
 */
import type { CapturaJuego, ImagenCreditada, ImagenLugar } from "./imagenes";

export type CapturaFicha = ImagenCreditada & { pixelArt: boolean; pie: string; href: string | null };
export type CapturasFicha = { tipo: "propias" | "lugares"; capturas: CapturaFicha[] };

type RutaMinima = { idRuta: number; idPokeapi: number | null; nombre: string; region: string };
type PokemonMinimo = { region: string | null; rutas: RutaMinima[] };

const MAX_LUGARES = 2;

export function elegirCapturasFicha(
  pokemon: PokemonMinimo,
  propias: CapturaJuego[],
  imagenDeLugar: (idPokeapi: number | null) => ImagenLugar | null,
): CapturasFicha | null {
  if (propias.length > 0) {
    return { tipo: "propias", capturas: propias.map((c) => ({ ...c, href: null })) };
  }
  const origen = pokemon.region?.toLowerCase();
  const candidatas = pokemon.rutas
    .map((ruta) => ({ ruta, imagen: imagenDeLugar(ruta.idPokeapi) }))
    .filter((x): x is { ruta: RutaMinima; imagen: ImagenLugar } => x.imagen !== null);
  // Una misma imagen puede venir de dos rutas (la PokeAPI repite algún lugar): se muestra una vez
  const vistas = new Set<string>();
  const capturas = candidatas
    .sort(
      (a, b) =>
        Number(b.ruta.region.toLowerCase() === origen) - Number(a.ruta.region.toLowerCase() === origen) ||
        Number(a.imagen.pixelArt === true) - Number(b.imagen.pixelArt === true) ||
        a.ruta.nombre.localeCompare(b.ruta.nombre, "es"),
    )
    .filter(({ imagen }) => !vistas.has(imagen.archivo) && vistas.add(imagen.archivo))
    .slice(0, MAX_LUGARES)
    .map(({ ruta, imagen }) => ({
      ...imagen,
      pixelArt: imagen.pixelArt === true,
      pie: `Aparece en ${ruta.nombre}`,
      href: `/rutas/${ruta.idRuta}`,
    }));
  return capturas.length > 0 ? { tipo: "lugares", capturas } : null;
}
