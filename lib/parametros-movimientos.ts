/**
 * Estado de /movimientos (P3) en la URL. La API tiene un endpoint por caso y no los combina:
 * o se busca por `nombre`, o se elige una `vista` (categoría o competitivos). `page` empieza en 1.
 */
import type { FiltrosMovimiento } from "./api/tipos";
import type { ParametrosUrl } from "./parametros-catalogo";

export const VISTAS_MOVIMIENTO = [
  { valor: "", etiqueta: "Todos" },
  { valor: "fisico", etiqueta: "Físico" },
  { valor: "especial", etiqueta: "Especial" },
  { valor: "estado", etiqueta: "Estado" },
  { valor: "competitivos", etiqueta: "Competitivos (potencia > 80)" },
] as const;

export type EstadoMovimientos = {
  nombre?: string;
  /** fisico | especial | estado | competitivos */
  vista?: string;
  pagina: number;
};

export const TAMANO_PAGINA_MOVIMIENTOS = 20;

const CATEGORIA_POR_VISTA: Record<string, string> = { fisico: "Físico", especial: "Especial", estado: "Estado" };

function primero(valor: string | string[] | undefined): string | undefined {
  const texto = (Array.isArray(valor) ? valor[0] : valor)?.trim();
  return texto ? texto : undefined;
}

export function leerMovimientos(parametros: ParametrosUrl): EstadoMovimientos {
  const nombre = primero(parametros.nombre);
  const vista = primero(parametros.vista)?.toLowerCase();
  const pagina = Number(primero(parametros.page));
  return {
    nombre,
    // Si viene nombre, manda la búsqueda (como la API: un solo caso a la vez)
    vista: !nombre && vista && VISTAS_MOVIMIENTO.some((v) => v.valor && v.valor === vista) ? vista : undefined,
    pagina: Number.isInteger(pagina) && pagina >= 1 ? pagina : 1,
  };
}

export function aFiltrosMovimiento(estado: EstadoMovimientos): FiltrosMovimiento {
  return {
    nombre: estado.nombre,
    categoria: estado.vista ? CATEGORIA_POR_VISTA[estado.vista] : undefined,
    competitivos: estado.vista === "competitivos" || undefined,
    // Por el nombre en español que se muestra (el slug dejaría "Roca Veloz" entre "Absorber" y "Ácido")
    sort: "nombreEs",
    page: estado.pagina - 1,
    size: TAMANO_PAGINA_MOVIMIENTOS,
  };
}

export function hrefMovimientos(estado: EstadoMovimientos, cambios: Partial<EstadoMovimientos> = {}): string {
  const final: EstadoMovimientos = { ...estado, pagina: 1, ...cambios };
  const consulta = new URLSearchParams();
  if (final.nombre) consulta.set("nombre", final.nombre);
  else if (final.vista) consulta.set("vista", final.vista);
  if (final.pagina > 1) consulta.set("page", String(final.pagina));
  const texto = consulta.toString();
  return texto ? `/movimientos?${texto}` : "/movimientos";
}
