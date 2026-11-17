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

export function crearFuenteHttp(urlBase: string): FuenteDatos {
  const base = urlBase.replace(/\/$/, "");

  /** GET que lanza ErrorApi si la respuesta no es 2xx. */
  async function pedir<T>(ruta: string): Promise<T> {
    const respuesta = await fetch(`${base}${ruta}`, { headers: { Accept: "application/json" } });
    if (!respuesta.ok) {
      let mensaje = `Error ${respuesta.status}`;
      try {
        const cuerpo = (await respuesta.json()) as { mensaje?: string };
        if (cuerpo.mensaje) mensaje = cuerpo.mensaje;
      } catch {
        // cuerpo vacío o no JSON: se queda el mensaje genérico
      }
      throw new ErrorApi(respuesta.status, mensaje);
    }
    return (await respuesta.json()) as T;
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
