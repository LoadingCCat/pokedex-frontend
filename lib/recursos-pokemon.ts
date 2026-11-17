/**
 * URL de los recursos "de nostalgia" de cada Pokémon, armadas con su idPokedex sobre las
 * rutas fijas de los repos de la PokeAPI (tabla "Recursos" de docs/diseno/identidad-visual.md).
 * No forman parte del contrato de la API: ver decisiones.md (2026-11-16).
 */

const SPRITES = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const GRITOS = "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest";

/** El repo solo tiene sprites animados de Pokémon Negro/Blanco hasta el #649. */
export const ULTIMO_CON_SPRITE_ANIMADO = 649;
export const ULTIMO_POKEMON = 1025;

const valido = (id: number, maximo: number) => Number.isInteger(id) && id >= 1 && id <= maximo;

/** GIF animado de Negro/Blanco (#001–#649) o null. */
export function spriteAnimadoUrl(id: number): string | null {
  return valido(id, ULTIMO_CON_SPRITE_ANIMADO)
    ? `${SPRITES}/versions/generation-v/black-white/animated/${id}.gif`
    : null;
}

/**
 * Sprite clásico pixelado de 96 × 96 (FE.32), normal o shiny. Los 1025 tienen las dos versiones en
 * el repo de la PokeAPI (comprobado el 2026-11-17 con una petición HEAD por archivo).
 */
export function spriteClasicoUrl(id: number, shiny = false): string | null {
  if (!valido(id, ULTIMO_POKEMON)) return null;
  return shiny ? `${SPRITES}/shiny/${id}.png` : `${SPRITES}/${id}.png`;
}

/** Ilustración oficial shiny (#001–#1025) o null. */
export function ilustracionShinyUrl(id: number): string | null {
  return valido(id, ULTIMO_POKEMON) ? `${SPRITES}/other/official-artwork/shiny/${id}.png` : null;
}

/** Grito en OGG (#001–#1025) o null. */
export function gritoUrl(id: number): string | null {
  return valido(id, ULTIMO_POKEMON) ? `${GRITOS}/${id}.ogg` : null;
}
