/**
 * F19 · Tabla fija de efectividad de tipos (vigente desde la 6.ª generación). Clave = `nombre`
 * del tipo en la API. Por cada tipo atacante: contra qué tipos hace ×2, ×½ y ×0; el resto, ×1.
 */

type Fila = { doble: string[]; mitad: string[]; nulo: string[] };

const fila = (doble: string, mitad: string, nulo = ""): Fila => ({
  doble: doble.split(" ").filter(Boolean),
  mitad: mitad.split(" ").filter(Boolean),
  nulo: nulo.split(" ").filter(Boolean),
});

export const ATAQUE: Record<string, Fila> = {
  normal: fila("", "rock steel", "ghost"),
  fire: fila("grass ice bug steel", "fire water rock dragon"),
  water: fila("fire ground rock", "water grass dragon"),
  electric: fila("water flying", "electric grass dragon", "ground"),
  grass: fila("water ground rock", "fire grass poison flying bug dragon steel"),
  ice: fila("grass ground flying dragon", "fire water ice steel"),
  fighting: fila("normal ice rock dark steel", "poison flying psychic bug fairy", "ghost"),
  poison: fila("grass fairy", "poison ground rock ghost", "steel"),
  ground: fila("fire electric poison rock steel", "grass bug", "flying"),
  flying: fila("grass fighting bug", "electric rock steel"),
  psychic: fila("fighting poison", "psychic steel", "dark"),
  bug: fila("grass psychic dark", "fire fighting poison flying ghost steel fairy"),
  rock: fila("fire ice flying bug", "fighting ground steel"),
  ghost: fila("psychic ghost", "dark", "normal"),
  dragon: fila("dragon", "steel", "fairy"),
  dark: fila("psychic ghost", "fighting dark fairy"),
  steel: fila("ice rock fairy", "fire water electric steel"),
  fairy: fila("fighting dragon dark", "fire poison steel"),
};

export const TIPOS = Object.keys(ATAQUE);

/** Multiplicador de un ataque de `atacante` contra un solo tipo. */
export function multiplicador(atacante: string, defensor: string): number {
  const f = ATAQUE[atacante];
  if (!f) return 1;
  if (f.nulo.includes(defensor)) return 0;
  if (f.doble.includes(defensor)) return 2;
  if (f.mitad.includes(defensor)) return 0.5;
  return 1;
}

export const GRUPOS = [
  { valor: 4, titulo: "Muy débil (×4)" },
  { valor: 2, titulo: "Débil (×2)" },
  { valor: 0.5, titulo: "Resiste (×½)" },
  { valor: 0.25, titulo: "Resiste mucho (×¼)" },
  { valor: 0, titulo: "Inmune (×0)" },
] as const;

export type GrupoEfectividad = { valor: number; titulo: string; tipos: string[] };

/**
 * Debilidades y resistencias de un Pokémon con 1 o 2 tipos: el producto de los multiplicadores.
 * Solo los grupos con algún tipo, en el orden de GRUPOS; los ×1 no se incluyen. Tipos desconocidos
 * se ignoran.
 */
export function efectividadContra(tiposDefensor: string[]): GrupoEfectividad[] {
  const defensores = tiposDefensor.map((t) => t.toLowerCase()).filter((t) => t in ATAQUE);
  if (defensores.length === 0) return [];
  return GRUPOS.map((g) => ({
    valor: g.valor,
    titulo: g.titulo,
    tipos: TIPOS.filter((a) => defensores.reduce((m, d) => m * multiplicador(a, d), 1) === g.valor),
  })).filter((g) => g.tipos.length > 0);
}
