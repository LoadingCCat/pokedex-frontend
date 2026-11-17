/**
 * Estado del catálogo (P1) en la URL: lectura, validación y armado de enlaces.
 * Los nombres son los de la API (nombre, generacion, tipo, region, obtencion, sort, page);
 * `tipo` se puede repetir hasta 2 veces (F14: `?tipo=fire&tipo=flying`);
 * `page` en la URL empieza en 1 (la API empieza en 0).
 * Un valor inválido se ignora, como si no se hubiera enviado (docs/pantallas.md, P1).
 */
import { TIPOS_OBTENCION, type FiltrosPokemon } from "./api/tipos";

export type ParametrosUrl = Record<string, string | string[] | undefined>;

export type EstadoCatalogo = {
  nombre?: string;
  generacion?: number;
  tipo?: string;
  /** Segundo tipo (F14): solo con `tipo`, y distinto de él. Se filtran los que tienen los dos */
  tipo2?: string;
  region?: string;
  /** Valor oficial: "Fósil", "Sin datos"… */
  obtencion?: string;
  /** Uno de OPCIONES_ORDEN (sin `sort` = por número) */
  sort?: string;
  /** Empieza en 1 */
  pagina: number;
};

export const TAMANO_PAGINA = 20;

/** Opciones de orden del catálogo: número, nombre y cada estadística base de mayor a menor. */
export const OPCIONES_ORDEN = [
  { valor: "", etiqueta: "Número" },
  { valor: "nombre", etiqueta: "Nombre (A–Z)" },
  { valor: "ps,desc", etiqueta: "PS" },
  { valor: "ataque,desc", etiqueta: "Ataque" },
  { valor: "defensa,desc", etiqueta: "Defensa" },
  { valor: "ataqueEspecial,desc", etiqueta: "Ataque especial" },
  { valor: "defensaEspecial,desc", etiqueta: "Defensa especial" },
  { valor: "velocidad,desc", etiqueta: "Velocidad" },
] as const;

const GENERACIONES = 9;

function primero(valor: string | string[] | undefined): string | undefined {
  const texto = (Array.isArray(valor) ? valor[0] : valor)?.trim();
  return texto ? texto : undefined;
}

export function sinTildes(texto: string): string {
  return texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

/** "fosil" o "Fósil" → "Fósil"; inválido → undefined. */
export function obtencionOficial(valor: string | undefined): string | undefined {
  if (!valor) return undefined;
  return TIPOS_OBTENCION.find((t) => sinTildes(t) === sinTildes(valor));
}

/** "Fósil" → "fosil", "Sin datos" → "sin-datos" (para la URL). */
export function obtencionEnUrl(oficial: string): string {
  return sinTildes(oficial).replace(/\s+/g, "-");
}

/** Todos los valores no vacíos de un parámetro repetido (`?tipo=fire&tipo=flying`). */
function todos(valor: string | string[] | undefined): string[] {
  const lista = Array.isArray(valor) ? valor : valor === undefined ? [] : [valor];
  return lista.map((v) => v.trim()).filter(Boolean);
}

/** Hasta 2 tipos válidos y distintos, en minúsculas; un tercero o uno inventado se ignora. */
function tiposValidos(valor: string | string[] | undefined, validos: string[]): [string?, string?] {
  const tipos = [...new Set(todos(valor).map((t) => t.toLowerCase()))].filter((t) => validos.includes(t));
  return [tipos[0], tipos[1]];
}

function entero(valor: string | undefined): number | undefined {
  if (!valor || !/^\d+$/.test(valor)) return undefined;
  return Number(valor);
}

/** Lee y valida la URL. `tipos` y `regiones` válidos se pasan para descartar valores inventados. */
export function leerCatalogo(
  parametros: ParametrosUrl,
  validos: { tipos: string[]; regiones: string[] },
): EstadoCatalogo {
  const generacion = entero(primero(parametros.generacion));
  const [tipo, tipo2] = tiposValidos(parametros.tipo, validos.tipos);
  const region = primero(parametros.region)?.toLowerCase();
  const obtencion = primero(parametros.obtencion);
  const sort = primero(parametros.sort);
  const pagina = entero(primero(parametros.page));

  return {
    nombre: primero(parametros.nombre),
    generacion: generacion && generacion >= 1 && generacion <= GENERACIONES ? generacion : undefined,
    tipo,
    tipo2,
    region: region && validos.regiones.some((r) => r.toLowerCase() === region) ? region : undefined,
    obtencion: obtencionOficial(obtencion?.replace(/-/g, " ")),
    sort: OPCIONES_ORDEN.some((o) => o.valor && o.valor === sort) ? sort : undefined,
    pagina: pagina && pagina >= 1 ? pagina : 1,
  };
}

/** Lo que se pide a lib/api. */
export function aFiltrosApi(estado: EstadoCatalogo): FiltrosPokemon {
  return {
    nombre: estado.nombre,
    generacion: estado.generacion,
    tipo: estado.tipo && estado.tipo2 ? [estado.tipo, estado.tipo2] : estado.tipo,
    region: estado.region,
    obtencion: estado.obtencion,
    sort: estado.sort,
    page: estado.pagina - 1,
    size: TAMANO_PAGINA,
  };
}

/**
 * Enlace al catálogo con el estado dado más los `cambios`. Omite lo vacío y la página 1.
 * Cambiar un filtro o el orden vuelve a la página 1 (se pasa `pagina: 1` o se omite).
 */
export function hrefCatalogo(estado: EstadoCatalogo, cambios: Partial<EstadoCatalogo> = {}): string {
  const final: EstadoCatalogo = { ...estado, pagina: 1, ...cambios };
  // Sin el primer tipo, el segundo pasa a ser el único; dos iguales cuentan como uno
  if (!final.tipo) [final.tipo, final.tipo2] = [final.tipo2, undefined];
  if (final.tipo2 === final.tipo) final.tipo2 = undefined;
  const consulta = new URLSearchParams();
  if (final.nombre) consulta.set("nombre", final.nombre);
  if (final.generacion) consulta.set("generacion", String(final.generacion));
  if (final.tipo) consulta.append("tipo", final.tipo);
  if (final.tipo2) consulta.append("tipo", final.tipo2);
  if (final.region) consulta.set("region", final.region);
  if (final.obtencion) consulta.set("obtencion", obtencionEnUrl(final.obtencion));
  if (final.sort) consulta.set("sort", final.sort);
  if (final.pagina > 1) consulta.set("page", String(final.pagina));
  const texto = consulta.toString();
  return texto ? `/?${texto}` : "/";
}

export function hayFiltros(estado: EstadoCatalogo): boolean {
  return Boolean(estado.nombre || estado.generacion || estado.tipo || estado.region || estado.obtencion);
}
