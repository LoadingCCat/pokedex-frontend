/**
 * Los 18 tipos: etiqueta en español y colores de la insignia.
 * Único lugar con los HEX de los tipos; cada par fondo/texto cumple AA (4,5:1).
 * Fuente: tabla "Colores de tipo" de docs/diseno/identidad-visual.md.
 */

export type InfoTipo = {
  etiqueta: string;
  fondo: string;
  texto: string;
};

const OSCURO = "#14171F";
const BLANCO = "#FFFFFF";

/** Clave = `nombre` del tipo en la API (slug en inglés). */
export const TIPOS_POKEMON: Record<string, InfoTipo> = {
  normal: { etiqueta: "Normal", fondo: "#9FA19F", texto: OSCURO },
  fire: { etiqueta: "Fuego", fondo: "#D92523", texto: BLANCO },
  water: { etiqueta: "Agua", fondo: "#2980EF", texto: OSCURO },
  electric: { etiqueta: "Eléctrico", fondo: "#FAC000", texto: OSCURO },
  grass: { etiqueta: "Planta", fondo: "#3FA129", texto: OSCURO },
  ice: { etiqueta: "Hielo", fondo: "#3DCEF3", texto: OSCURO },
  fighting: { etiqueta: "Lucha", fondo: "#FF8000", texto: OSCURO },
  poison: { etiqueta: "Veneno", fondo: "#9141CB", texto: BLANCO },
  ground: { etiqueta: "Tierra", fondo: "#915121", texto: BLANCO },
  flying: { etiqueta: "Volador", fondo: "#81B9EF", texto: OSCURO },
  psychic: { etiqueta: "Psíquico", fondo: "#EF4179", texto: OSCURO },
  bug: { etiqueta: "Bicho", fondo: "#91A119", texto: OSCURO },
  rock: { etiqueta: "Roca", fondo: "#AFA981", texto: OSCURO },
  ghost: { etiqueta: "Fantasma", fondo: "#704170", texto: BLANCO },
  dragon: { etiqueta: "Dragón", fondo: "#5060E1", texto: BLANCO },
  dark: { etiqueta: "Siniestro", fondo: "#624D4E", texto: BLANCO },
  steel: { etiqueta: "Acero", fondo: "#60A1B8", texto: OSCURO },
  fairy: { etiqueta: "Hada", fondo: "#EF70EF", texto: OSCURO },
};

/** Info de un tipo; uno desconocido usa el estilo de `normal` con su nombre tal cual. */
export function infoTipo(clave: string): InfoTipo {
  const tipo = TIPOS_POKEMON[clave.toLowerCase()];
  return tipo ?? { ...TIPOS_POKEMON.normal, etiqueta: clave };
}
