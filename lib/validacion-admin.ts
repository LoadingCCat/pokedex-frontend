/**
 * Validación en el cliente de los formularios del panel (F15 · RF-12, P8 punto 5). Las mismas
 * reglas que el backend (DatosPokemon y los controllers), para no enviar lo que va a dar 400.
 * Cada validador devuelve los errores por campo (con el nombre del campo de la API) y, si no
 * hay ninguno, el cuerpo JSON listo para enviar.
 */

export type Errores = Record<string, string>;

/** Lo que devuelven las server actions del panel. */
export type ResultadoAccion = { ok: true } | { ok: false; mensaje: string; campos?: Errores };

export type Validacion<C> = { errores: Errores; cuerpo?: C };

export const ESTADISTICAS_ADMIN = [
  { campo: "ps", etiqueta: "PS" },
  { campo: "ataque", etiqueta: "Ataque" },
  { campo: "defensa", etiqueta: "Defensa" },
  { campo: "ataqueEspecial", etiqueta: "Ataque especial" },
  { campo: "defensaEspecial", etiqueta: "Defensa especial" },
  { campo: "velocidad", etiqueta: "Velocidad" },
] as const;

type CampoEstadistica = (typeof ESTADISTICAS_ADMIN)[number]["campo"];

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Entero entre min y max; "abc", "1.5", "-3" o vacío dan el error que verá el usuario. */
function entero(texto: string, min: number, max: number): { valor?: number; error?: string } {
  const limpio = texto.trim();
  if (!limpio) return { error: "Es obligatorio." };
  if (/^-\d+$/.test(limpio)) return { error: "No puede ser negativo." };
  if (!/^\d{1,10}$/.test(limpio)) return { error: "Debe ser un número entero." };
  const valor = Number(limpio);
  if (valor < min || valor > max) {
    return { error: max === Number.MAX_SAFE_INTEGER ? `Debe ser mayor o igual a ${min}.` : `Debe estar entre ${min} y ${max}.` };
  }
  return { valor };
}

/** Número ≥ 0 con decimales (acepta coma o punto). */
function decimal(texto: string): { valor?: number; error?: string } {
  const limpio = texto.trim().replace(",", ".");
  if (!limpio) return { error: "Es obligatorio." };
  if (/^-/.test(limpio)) return { error: "No puede ser negativo." };
  if (!/^\d+(\.\d+)?$/.test(limpio)) return { error: "Debe ser un número (por ejemplo, 0,4)." };
  return { valor: Number(limpio) };
}

// ── Pokémon ──────────────────────────────────────────────────────────────────

export type ValoresPokemon = {
  idPokedex: string;
  nombre: string;
  generacion: string;
  nombreEs: string;
  descripcion: string;
  tipoObtencion: string;
  formaObtencion: string;
  altura: string;
  peso: string;
  tipo1: string;
  tipo2: string;
  /** Ids de rutas separados por comas */
  rutas: string;
} & Record<CampoEstadistica, string>;

export type CuerpoPokemon = {
  idPokedex?: number;
  nombre?: string;
  generacion?: number;
  nombreEs: string;
  descripcion: string | null;
  tipoObtencion: string;
  formaObtencion: string | null;
  altura: number;
  peso: number;
  tipos: string[];
  rutas: number[];
} & Record<CampoEstadistica, number>;

/** Al crear también se piden idPokedex, nombre (slug) y generación. */
export function validarPokemon(v: ValoresPokemon, creando: boolean): Validacion<CuerpoPokemon> {
  const errores: Errores = {};
  const cuerpo: Partial<CuerpoPokemon> = {};

  if (creando) {
    const id = entero(v.idPokedex, 1, Number.MAX_SAFE_INTEGER);
    if (id.error) errores.idPokedex = id.error;
    cuerpo.idPokedex = id.valor;

    const nombre = v.nombre.trim().toLowerCase();
    if (!nombre) errores.nombre = "Es obligatorio.";
    else if (!SLUG.test(nombre)) errores.nombre = "Usa minúsculas, números y guiones (por ejemplo, mi-pokemon).";
    cuerpo.nombre = nombre;

    const generacion = entero(v.generacion, 1, 9);
    if (generacion.error) errores.generacion = generacion.error;
    cuerpo.generacion = generacion.valor;
  }

  const nombreEs = v.nombreEs.trim();
  if (!nombreEs) errores.nombreEs = "Es obligatorio.";
  cuerpo.nombreEs = nombreEs;

  for (const { campo } of ESTADISTICAS_ADMIN) {
    const stat = entero(v[campo], 1, 255);
    if (stat.error) errores[campo] = stat.error;
    cuerpo[campo] = stat.valor;
  }

  const altura = decimal(v.altura);
  if (altura.error) errores.altura = altura.error;
  cuerpo.altura = altura.valor;
  const peso = decimal(v.peso);
  if (peso.error) errores.peso = peso.error;
  cuerpo.peso = peso.valor;

  if (!v.tipoObtencion.trim()) errores.tipoObtencion = "Elige la forma de obtención.";
  cuerpo.tipoObtencion = v.tipoObtencion.trim();

  if (!v.tipo1) errores.tipos = "Elige al menos un tipo.";
  else if (v.tipo2 && v.tipo2 === v.tipo1) errores.tipos = "Los dos tipos deben ser distintos.";
  cuerpo.tipos = [v.tipo1, v.tipo2].filter(Boolean);

  const textoRutas = v.rutas.trim();
  const partes = textoRutas ? textoRutas.split(/[\s,;]+/).filter(Boolean) : [];
  if (partes.some((p) => !/^[1-9]\d*$/.test(p))) {
    errores.rutas = "Escribe números de ruta separados por comas (por ejemplo, 3, 7).";
  }
  cuerpo.rutas = [...new Set(partes.map(Number))];

  cuerpo.descripcion = v.descripcion.trim() || null;
  cuerpo.formaObtencion = v.formaObtencion.trim() || null;

  return Object.keys(errores).length > 0 ? { errores } : { errores, cuerpo: cuerpo as CuerpoPokemon };
}
