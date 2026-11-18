/** F19 · Las 25 naturalezas, desde el archivo fijo datos/naturalezas.json (sin backend). */
import datos from "../datos/naturalezas.json";

export type Estadistica = "ataque" | "defensa" | "ataqueEspecial" | "defensaEspecial" | "velocidad";

export type Naturaleza = {
  /** Slug en inglés (como los de la PokeAPI) */
  nombre: string;
  nombreEs: string;
  /** null en las 5 neutras */
  sube: Estadistica | null;
  baja: Estadistica | null;
};

export const ETIQUETAS_ESTADISTICA: Record<Estadistica, string> = {
  ataque: "Ataque",
  defensa: "Defensa",
  ataqueEspecial: "Ataque especial",
  defensaEspecial: "Defensa especial",
  velocidad: "Velocidad",
};

export const NATURALEZAS = datos as Naturaleza[];

export const esNeutra = (n: Naturaleza) => n.sube === null;
