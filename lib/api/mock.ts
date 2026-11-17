/**
 * Fuente de datos mock: lee el volcado de datos/mock/ (FE.5) y reproduce en memoria el
 * contrato de ../pokedex-backend/docs/contratos/api.md (paginación, orden, filtros, errores).
 * No combina más de lo que permite la API, para que http.ts funcione igual.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ErrorApi,
  TIPOS_OBTENCION,
  type Etapa,
  type FiltrosMovimiento,
  type FiltrosPokemon,
  type FuenteDatos,
  type Movimiento,
  type Pagina,
  type Paginacion,
  type Pokemon,
  type Ruta,
  type Tipo,
} from "./tipos";

// ---------- Datos (se leen una vez, al primer uso) ----------

type Volcado = {
  pokemons: Pokemon[];
  pokemonPorId: Map<number, Pokemon>;
  movimientos: Movimiento[];
  movimientoPorId: Map<number, Movimiento>;
  movimientosPorPokemon: Record<string, number[]>;
  cadenas: Record<string, Etapa>;
  indiceCadenas: Record<string, number>;
  rutas: Ruta[];
  rutaPorId: Map<number, Ruta>;
  pokemonsPorRuta: Record<string, number[]>;
  regiones: string[];
  tipos: Tipo[];
};

let volcado: Volcado | null = null;

function leer<T>(archivo: string): T {
  const ruta = join(process.cwd(), "datos", "mock", archivo);
  return JSON.parse(readFileSync(ruta, "utf8")) as T;
}

function datos(): Volcado {
  if (volcado) return volcado;
  const pokemons = leer<Pokemon[]>("pokemons.json");
  const movimientos = leer<Movimiento[]>("movimientos.json");
  const rutas = leer<Ruta[]>("rutas.json");
  const evoluciones = leer<{ cadenas: Record<string, Etapa>; indice: Record<string, number> }>(
    "evoluciones.json",
  );
  volcado = {
    pokemons,
    pokemonPorId: new Map(pokemons.map((p) => [p.idPokedex, p])),
    movimientos,
    movimientoPorId: new Map(movimientos.map((m) => [m.idMovimiento, m])),
    movimientosPorPokemon: leer("movimientos-por-pokemon.json"),
    cadenas: evoluciones.cadenas,
    indiceCadenas: evoluciones.indice,
    rutas,
    rutaPorId: new Map(rutas.map((r) => [r.idRuta, r])),
    pokemonsPorRuta: leer("pokemons-por-ruta.json"),
    regiones: leer("regiones.json"),
    tipos: leer("tipos.json"),
  };
  return volcado;
}

// ---------- Utilidades del contrato ----------

const TAMANO_POR_DEFECTO = 20;
const TAMANO_MAXIMO = 200;

/** Como unaccent + lower de PostgreSQL: sin tildes (también ñ → n) y en minúsculas. */
export function sinTildes(texto: string): string {
  return texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** Un filtro vacío o solo con espacios se ignora (como `limpiar()` del backend). */
function limpiar(valor: string | undefined): string | undefined {
  const texto = valor?.trim();
  return texto ? texto : undefined;
}

const comparadorTexto = new Intl.Collator("es", { sensitivity: "base" });

function comparar(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return comparadorTexto.compare(String(a), String(b));
}

/**
 * Ordena según `sort` ("campo" o "campo,asc|desc"); sin `sort`, por `porDefecto`.
 * Un campo que no existe responde 400, como la API. Los null van al final en asc y al
 * principio en desc (como PostgreSQL). El orden es estable.
 */
function ordenar<T>(elementos: T[], sort: string | undefined, porDefecto: string, campos: readonly string[]): T[] {
  const [campoPedido, direccionPedida] = (limpiar(sort) ?? porDefecto).split(",").map((s) => s.trim());
  if (!campos.includes(campoPedido)) {
    throw new ErrorApi(400, `No se puede ordenar por '${campoPedido}': el campo no existe`);
  }
  const signo = direccionPedida?.toLowerCase() === "desc" ? -1 : 1;
  return [...elementos].sort((x, y) => {
    const a = (x as Record<string, unknown>)[campoPedido];
    const b = (y as Record<string, unknown>)[campoPedido];
    if (a == null && b == null) return 0;
    if (a == null) return signo; // null al final en asc, al principio en desc
    if (b == null) return -signo;
    return signo * comparar(a, b);
  });
}

/** Recorta una página con el formato { content, page }. */
export function paginar<T>(elementos: T[], paginacion: Paginacion = {}): Pagina<T> {
  const numero = Number.isInteger(paginacion.page) && paginacion.page! > 0 ? paginacion.page! : 0;
  const pedido = Number.isInteger(paginacion.size) && paginacion.size! > 0 ? paginacion.size! : TAMANO_POR_DEFECTO;
  const tamano = Math.min(pedido, TAMANO_MAXIMO);
  return {
    content: elementos.slice(numero * tamano, numero * tamano + tamano),
    page: {
      size: tamano,
      number: numero,
      totalElements: elementos.length,
      totalPages: Math.ceil(elementos.length / tamano),
    },
  };
}

const CAMPOS_POKEMON = [
  "idPokedex", "nombre", "nombreEs", "generacion", "region", "tipoObtencion", "altura", "peso",
  "ps", "ataque", "defensa", "ataqueEspecial", "defensaEspecial", "velocidad",
] as const;
const CAMPOS_MOVIMIENTO = ["idMovimiento", "nombre", "nombreEs", "categoria", "potencia", "esCompetitivo"] as const;
const CAMPOS_RUTA = ["idRuta", "nombre", "region", "descripcion", "idPokeapi"] as const;

/** "fosil" → "Fósil"; 400 con la lista de valores válidos si no existe. */
function normalizarObtencion(valor: string): string {
  const encontrado = TIPOS_OBTENCION.find((t) => sinTildes(t) === sinTildes(valor));
  if (!encontrado) {
    throw new ErrorApi(400, `Tipo de obtención inválido. Valores: ${TIPOS_OBTENCION.join(", ")}`);
  }
  return encontrado;
}

// ---------- Operaciones ----------

export const fuenteMock: FuenteDatos = {
  async listarPokemons(filtros: FiltrosPokemon = {}) {
    const { pokemons } = datos();
    const nombre = limpiar(filtros.nombre);
    // Uno o dos tipos (F14), sin vacíos ni repetidos; con dos, el Pokémon debe tener ambos
    const tipos = [
      ...new Set(
        (Array.isArray(filtros.tipo) ? filtros.tipo : [filtros.tipo])
          .map((t) => limpiar(t)?.toLowerCase())
          .filter((t): t is string => Boolean(t)),
      ),
    ];
    if (tipos.length > 2) {
      throw new ErrorApi(400, "Se pueden filtrar como mucho 2 tipos a la vez (por ejemplo ?tipo=fire&tipo=flying)");
    }
    const region = limpiar(filtros.region)?.toLowerCase();
    const obtencion = limpiar(filtros.obtencion);
    const { generacion } = filtros;

    if (generacion != null && (!Number.isInteger(generacion) || generacion < 1 || generacion > 9)) {
      throw new ErrorApi(400, "La generación debe estar entre 1 y 9");
    }
    const obtencionOficial = obtencion ? normalizarObtencion(obtencion) : undefined;
    const patron = nombre ? sinTildes(nombre) : undefined;

    const filtrados = pokemons.filter(
      (p) =>
        (!patron ||
          sinTildes(p.nombre).includes(patron) ||
          (p.nombreEs != null && sinTildes(p.nombreEs).includes(patron))) &&
        (generacion == null || p.generacion === generacion) &&
        tipos.every((tipo) => p.tipos.some((t) => t.nombre.toLowerCase() === tipo)) &&
        (!region ||
          p.region?.toLowerCase() === region ||
          p.rutas.some((r) => r.region.toLowerCase() === region)) &&
        (!obtencionOficial || p.tipoObtencion?.toLowerCase() === obtencionOficial.toLowerCase()),
    );
    return paginar(ordenar(filtrados, filtros.sort, "idPokedex", CAMPOS_POKEMON), filtros);
  },

  async obtenerPokemon(id) {
    return datos().pokemonPorId.get(id) ?? null;
  },

  async movimientosDePokemon(id) {
    const d = datos();
    if (!d.pokemonPorId.has(id)) return null;
    // El volcado guarda los ids en el orden de la API (por nombre)
    return (d.movimientosPorPokemon[id] ?? [])
      .map((idMovimiento) => d.movimientoPorId.get(idMovimiento))
      .filter((m): m is Movimiento => m !== undefined);
  },

  async evolucionesDe(id) {
    const d = datos();
    const pokemon = d.pokemonPorId.get(id);
    if (!pokemon) return null;
    const base = d.indiceCadenas[id];
    if (base !== undefined && d.cadenas[base]) return d.cadenas[base];
    // Cadena no importada: una sola etapa (F7)
    return {
      idPokedex: pokemon.idPokedex,
      nombre: pokemon.nombre,
      nombreEs: pokemon.nombreEs,
      imagenUrl: pokemon.imagenUrl,
      condicion: null,
      evoluciones: [],
    };
  },

  async listarMovimientos(filtros: FiltrosMovimiento = {}) {
    const { movimientos } = datos();
    const nombre = limpiar(filtros.nombre);
    const categoria = limpiar(filtros.categoria);
    let resultado: Movimiento[];
    if (nombre) {
      const patron = sinTildes(nombre);
      resultado = movimientos.filter(
        (m) => sinTildes(m.nombre).includes(patron) || (m.nombreEs != null && sinTildes(m.nombreEs).includes(patron)),
      );
    } else if (categoria) {
      // La API compara sin mayúsculas pero con tildes (findByCategoriaIgnoreCase)
      resultado = movimientos.filter((m) => m.categoria.toLowerCase() === categoria.toLowerCase());
    } else if (filtros.competitivos) {
      resultado = movimientos.filter((m) => m.esCompetitivo);
    } else {
      resultado = movimientos;
    }
    return paginar(ordenar(resultado, filtros.sort, "nombre", CAMPOS_MOVIMIENTO), filtros);
  },

  async listarTipos() {
    return datos().tipos;
  },

  async listarRegiones() {
    return datos().regiones;
  },

  async rutasDeRegion(region, paginacion = {}) {
    const buscada = region.trim().toLowerCase();
    const rutas = datos().rutas.filter((r) => r.region.toLowerCase() === buscada);
    return paginar(ordenar(rutas, paginacion.sort, "nombre", CAMPOS_RUTA), paginacion);
  },

  async obtenerRuta(id) {
    return datos().rutaPorId.get(id) ?? null;
  },

  async pokemonsDeRuta(idRuta, paginacion = {}) {
    const d = datos();
    const pokemons = (d.pokemonsPorRuta[idRuta] ?? [])
      .map((id) => d.pokemonPorId.get(id))
      .filter((p): p is Pokemon => p !== undefined);
    return paginar(ordenar(pokemons, paginacion.sort, "idPokedex", CAMPOS_POKEMON), paginacion);
  },
};
