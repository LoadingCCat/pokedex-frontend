/** Secciones de la navegación principal (docs/pantallas.md, "Comunes a todas las pantallas"). */
export const ENLACES_PRINCIPALES = [
  { href: "/", etiqueta: "Catálogo" },
  { href: "/movimientos", etiqueta: "Movimientos" },
  { href: "/regiones", etiqueta: "Regiones" },
  { href: "/naturalezas", etiqueta: "Naturalezas" },
] as const;

/** Una sección está activa en su ruta y en sus subrutas; el catálogo también en la ficha. */
export function esEnlaceActivo(href: string, ruta: string): boolean {
  if (href === "/") return ruta === "/" || ruta.startsWith("/pokemon/");
  if (href === "/regiones") return ruta.startsWith("/regiones") || ruta.startsWith("/rutas/");
  return ruta === href || ruta.startsWith(`${href}/`);
}
