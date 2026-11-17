/**
 * Mapas de región y capturas de lugares (Fase 2), y capturas del juego de la ficha (Fase 5). Los datos los genera scripts/imagenes.mjs en
 * datos/imagenes.json; los archivos están en public/imagenes/. Si una región o un lugar no tiene
 * imagen, se devuelve null y la pantalla queda como antes (docs/pantallas.md, "Ampliación").
 */
import datos from "@/datos/imagenes.json";

export type ImagenCreditada = {
  archivo: string;
  ancho: number;
  alto: number;
  alt: string;
  juego: string;
  fuente: string;
  archivoOriginal: string;
  origen: string;
  licencia: string;
};

export type ImagenLugar = ImagenCreditada & { lugar: string };

/** Captura del juego en la ficha (Fase 5). `pixelArt`: GB, GBA o DS, guardada a su tamaño real. */
export type CapturaJuego = ImagenCreditada & { pixelArt: boolean; pokemon: string; pie: string };

const regiones = datos.regiones as Record<string, ImagenCreditada>;
const lugares = datos.lugares as Record<string, ImagenLugar>;
const pokemon = (datos.pokemon ?? {}) as Record<string, CapturaJuego[]>;

/** Mapa de la región ("Kanto" o "kanto") o null. */
export function mapaDeRegion(region: string): ImagenCreditada | null {
  const clave = Object.keys(regiones).find((r) => r.toLowerCase() === region.trim().toLowerCase());
  return clave ? regiones[clave] : null;
}

/** Captura del lugar por su `idPokeapi` (las rutas creadas a mano lo tienen en null) o null. */
export function imagenDeLugar(idPokeapi: number | null): ImagenLugar | null {
  return idPokeapi == null ? null : (lugares[String(idPokeapi)] ?? null);
}

/** Capturas del juego de un Pokémon (hasta 3); lista vacía si no tiene. */
export function capturasDePokemon(idPokedex: number): CapturaJuego[] {
  return pokemon[String(idPokedex)] ?? [];
}

/** Todas las imágenes, para /creditos. */
export function todasLasImagenes(): {
  regiones: [string, ImagenCreditada][];
  lugares: [number, ImagenLugar][];
  pokemon: [number, CapturaJuego][];
} {
  return {
    regiones: Object.entries(regiones),
    lugares: Object.entries(lugares).map(([id, imagen]) => [Number(id), imagen]),
    pokemon: Object.entries(pokemon).flatMap(([id, capturas]) => capturas.map((c): [number, CapturaJuego] => [Number(id), c])),
  };
}
