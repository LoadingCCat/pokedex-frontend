/**
 * Tipos de las respuestas de la API, copiados de ../pokedex-backend/docs/contratos/api.md.
 * Si el contrato cambia, se actualizan los dos.
 */

export type Tipo = {
  id: number;
  nombre: string;
};

export type Ruta = {
  idRuta: number;
  nombre: string;
  region: string;
  descripcion: string | null;
  idPokeapi: number | null;
};

export type Pokemon = {
  idPokedex: number;
  nombre: string;
  nombreEs: string | null;
  descripcion: string | null;
  generacion: number | null;
  region: string | null;
  tipoObtencion: string | null;
  formaObtencion: string | null;
  imagenUrl: string | null;
  altura: number | null;
  peso: number | null;
  ps: number | null;
  ataque: number | null;
  defensa: number | null;
  ataqueEspecial: number | null;
  defensaEspecial: number | null;
  velocidad: number | null;
  totalEstadisticas: number | null;
  tipos: Tipo[];
  rutas: Ruta[];
};

export type Movimiento = {
  idMovimiento: number;
  nombre: string;
  nombreEs: string | null;
  /** Tipo del movimiento en inglés ("electric"); null si se creó a mano o aún no se reimportó */
  tipo: string | null;
  categoria: string;
  potencia: number | null;
  esCompetitivo: boolean;
};

/** Una etapa de la cadena evolutiva (GET /pokemons/{id}/evoluciones). */
export type Etapa = {
  idPokedex: number;
  nombre: string;
  nombreEs: string | null;
  imagenUrl: string | null;
  condicion: string | null;
  evoluciones: Etapa[];
};

/** Pokémon identificado por foto (F20). Se lee de PostgreSQL; la IA solo aporta slug y confianza. */
export type PokemonIdentificado = {
  idPokedex: number;
  nombre: string;
  nombreEs: string | null;
  tipos: Tipo[];
  totalEstadisticas: number;
  imagenUrl: string | null;
};

/** Uno de los 3 similares: lo mismo que el identificado, más por qué se parece. */
export type PokemonSimilar = PokemonIdentificado & {
  motivo: string;
};

/** Respuesta 200 de POST /pokemons/identificar (F20). `similares` trae siempre 3. */
export type Identificacion = {
  identificado: PokemonIdentificado;
  /** 0 a 1; el backend ya descarta con un 422 lo menor que 0,6 */
  confianza: number;
  similares: PokemonSimilar[];
};

/** Formato fijo de las listas paginadas. */
export type Pagina<T> = {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};

/** Parámetros de paginación (los mismos nombres que la API). */
export type Paginacion = {
  page?: number;
  size?: number;
  /** "campo" o "campo,asc|desc" */
  sort?: string;
};

export type FiltrosPokemon = Paginacion & {
  nombre?: string;
  generacion?: number;
  /** Uno o dos tipos (F14): con dos, solo los Pokémon que tienen ambos. Más de 2 → 400 */
  tipo?: string | string[];
  region?: string;
  obtencion?: string;
};

/**
 * Filtros de movimientos. La API tiene un endpoint por caso y no los combina:
 * se usa `nombre`, o `categoria`, o `competitivos` (en ese orden de prioridad).
 */
export type FiltrosMovimiento = Paginacion & {
  nombre?: string;
  categoria?: string;
  competitivos?: boolean;
};

export const CATEGORIAS_MOVIMIENTO = ["Físico", "Especial", "Estado"] as const;

export const TIPOS_OBTENCION = [
  "Inicial",
  "Singular",
  "Fósil",
  "Legendario",
  "Salvaje",
  "Regalo",
  "Huevo",
  "Evolución",
  "Sin datos",
] as const;

/** Campos por los que se puede ordenar el catálogo (totalEstadisticas no: se calcula). */
export const ORDENES_POKEMON = [
  "idPokedex",
  "nombre",
  "ps",
  "ataque",
  "defensa",
  "ataqueEspecial",
  "defensaEspecial",
  "velocidad",
  "altura",
  "peso",
] as const;

/** Error de la API con el formato { status, error, mensaje }. */
export class ErrorApi extends Error {
  constructor(
    readonly status: number,
    mensaje: string,
  ) {
    super(mensaje);
    this.name = "ErrorApi";
  }
}

/** Operaciones que usan las pantallas; las implementan mock.ts y http.ts. */
export interface FuenteDatos {
  listarPokemons(filtros?: FiltrosPokemon): Promise<Pagina<Pokemon>>;
  /** null si no existe */
  obtenerPokemon(id: number): Promise<Pokemon | null>;
  /** null si el Pokémon no existe */
  movimientosDePokemon(id: number): Promise<Movimiento[] | null>;
  /** null si el Pokémon no existe */
  evolucionesDe(id: number): Promise<Etapa | null>;
  listarMovimientos(filtros?: FiltrosMovimiento): Promise<Pagina<Movimiento>>;
  listarTipos(): Promise<Tipo[]>;
  listarRegiones(): Promise<string[]>;
  rutasDeRegion(region: string, paginacion?: Paginacion): Promise<Pagina<Ruta>>;
  /** null si no existe */
  obtenerRuta(id: number): Promise<Ruta | null>;
  pokemonsDeRuta(idRuta: number, paginacion?: Paginacion): Promise<Pagina<Pokemon>>;
  /**
   * F20: manda la foto a POST /pokemons/identificar. Lanza ErrorApi con el status del backend
   * (400, 422, 429, 502), 504 si no respondió a tiempo y 0 si no hubo conexión; en modo mock,
   * 503 ("no disponible"). solo se llama desde el servidor: el navegador usa /api/identificar.
   * `cabeceras` (N-01): X-Cliente-IP y X-Proxy-Secreto, ver lib/cliente-proxy.ts.
   */
  identificar(foto: Blob, cabeceras?: Record<string, string>): Promise<Identificacion>;
}

/** Texto del error 503 del modo mock (y de /api/identificar sin API_URL). */
export const MENSAJE_IDENTIFICAR_NO_DISPONIBLE =
  "Identificar por foto no está disponible en este sitio: solo funciona con la API conectada.";
