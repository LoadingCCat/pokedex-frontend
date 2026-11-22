/**
 * Fuente de datos contra la API real del backend (se usa si existe la variable API_URL).
 * Cada operación llama al endpoint de ../pokedex-backend/docs/contratos/api.md.
 */
import {
  ErrorApi,
  type Etapa,
  type FiltrosMovimiento,
  type FiltrosPokemon,
  type FuenteDatos,
  type Identificacion,
  type Movimiento,
  type Pagina,
  type Paginacion,
  type Pokemon,
  type Ruta,
  type Tipo,
} from "./tipos";

type Parametros = Record<string, string | number | boolean | string[] | undefined>;

function consulta(parametros: Parametros): string {
  const busqueda = new URLSearchParams();
  for (const [clave, valor] of Object.entries(parametros)) {
    // Un arreglo se envía como parámetro repetido (?tipo=fire&tipo=flying)
    for (const v of Array.isArray(valor) ? valor : [valor]) {
      if (v !== undefined && v !== "") busqueda.append(clave, String(v));
    }
  }
  const texto = busqueda.toString();
  return texto ? `?${texto}` : "";
}

const segmento = (valor: string | number) => encodeURIComponent(String(valor));

function paginacion({ page, size, sort }: Paginacion): Parametros {
  return { page, size, sort };
}

/**
 * Tiempo máximo de cada llamada a la API. El backend gratuito de Render se apaga tras 15 minutos sin
 * peticiones. Su arranque en frío, medido en Render producción (`Started PokedexBackendApplication`), pasó de
 * 122,3 s a 47,9 s con el CDS y `TieredStopAtLevel=1` (116 y 134 s en dev, antes). 180 s cubren ese arranque más
 * el despertar de Neon sin colgar la página para siempre, con margen si volviera a tardar como antes, y quedan
 * por debajo de los 300 s que Vercel (Hobby con Fluid Compute) deja vivir a la función.
 */
export const TIEMPO_ESPERA_MS = 180_000;

/**
 * Identificar por foto: puede sumar un arranque en frío completo de Render (hasta ~135 s medidos) y la llamada
 * a Gemini (hasta 20 s). Son 30 s menos que `maxDuration` (300 s) de app/api/identificar/route.ts, para que
 * sea este tiempo el que se agote y el usuario reciba un 504 con mensaje, no un corte de Vercel.
 */
export const TIEMPO_ESPERA_IDENTIFICAR_MS = 270_000;

/** ErrorApi con el `mensaje` del cuerpo de error de la API; si no es JSON, "Error {status}". */
async function errorDe(respuesta: Response): Promise<ErrorApi> {
  let mensaje = `Error ${respuesta.status}`;
  try {
    const cuerpo = (await respuesta.json()) as { mensaje?: string };
    if (cuerpo.mensaje) mensaje = cuerpo.mensaje;
  } catch {
    // cuerpo vacío o no JSON: se queda el mensaje genérico
  }
  return new ErrorApi(respuesta.status, mensaje);
}

export function crearFuenteHttp(urlBase: string): FuenteDatos {
  const base = urlBase.replace(/\/$/, "");

  /** GET que lanza ErrorApi si la respuesta no es 2xx. */
  async function pedir<T>(ruta: string): Promise<T> {
    const respuesta = await fetch(`${base}${ruta}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(TIEMPO_ESPERA_MS),
    });
    if (!respuesta.ok) throw await errorDe(respuesta);
    return (await respuesta.json()) as T;
  }

  /** F20: reenvía la foto como multipart (campo `foto`). Público: sin token. */
  async function identificar(foto: Blob): Promise<Identificacion> {
    const formulario = new FormData();
    formulario.append("foto", foto, "foto.jpg");
    let respuesta: Response;
    try {
      respuesta = await fetch(`${base}/pokemons/identificar`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formulario,
        cache: "no-store",
        signal: AbortSignal.timeout(TIEMPO_ESPERA_IDENTIFICAR_MS),
      });
    } catch (error) {
      const agotado = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
      throw new ErrorApi(agotado ? 504 : 0, agotado ? "La API no respondió a tiempo" : "No se pudo conectar con la API");
    }
    if (!respuesta.ok) throw await errorDe(respuesta);
    return (await respuesta.json()) as Identificacion;
  }

  /** Igual que pedir, pero un 404 (o un id no válido, 400) devuelve null. */
  async function pedirONulo<T>(ruta: string): Promise<T | null> {
    try {
      return await pedir<T>(ruta);
    } catch (error) {
      if (error instanceof ErrorApi && (error.status === 404 || error.status === 400)) return null;
      throw error;
    }
  }

  return {
    identificar,
    listarPokemons(filtros: FiltrosPokemon = {}) {
      const { nombre, generacion, tipo, region, obtencion } = filtros;
      return pedir<Pagina<Pokemon>>(
        `/pokemons${consulta({ nombre, generacion, tipo, region, obtencion, ...paginacion(filtros) })}`,
      );
    },
    obtenerPokemon: (id) => pedirONulo<Pokemon>(`/pokemons/${segmento(id)}`),
    movimientosDePokemon: (id) => pedirONulo<Movimiento[]>(`/pokemons/${segmento(id)}/movimientos`),
    evolucionesDe: (id) => pedirONulo<Etapa>(`/pokemons/${segmento(id)}/evoluciones`),

    listarMovimientos(filtros: FiltrosMovimiento = {}) {
      const nombre = filtros.nombre?.trim();
      const categoria = filtros.categoria?.trim();
      const pag = consulta(paginacion(filtros));
      if (nombre) {
        return pedir<Pagina<Movimiento>>(
          `/movimientos/buscar${consulta({ nombre, ...paginacion(filtros) })}`,
        );
      }
      if (categoria) return pedir<Pagina<Movimiento>>(`/movimientos/categoria/${segmento(categoria)}${pag}`);
      if (filtros.competitivos) return pedir<Pagina<Movimiento>>(`/movimientos/competitivos${pag}`);
      return pedir<Pagina<Movimiento>>(`/movimientos${pag}`);
    },

    listarTipos: () => pedir<Tipo[]>("/tipos"),
    listarRegiones: () => pedir<string[]>("/rutas/regiones"),
    rutasDeRegion: (region, pag = {}) =>
      pedir<Pagina<Ruta>>(`/rutas/region/${segmento(region.trim())}${consulta(paginacion(pag))}`),
    obtenerRuta: (id) => pedirONulo<Ruta>(`/rutas/${segmento(id)}`),
    pokemonsDeRuta: (idRuta, pag = {}) =>
      pedir<Pagina<Pokemon>>(`/pokemons/ruta/${segmento(idRuta)}${consulta(paginacion(pag))}`),
  };
}
