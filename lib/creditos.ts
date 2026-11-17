/**
 * Filas de "Mapas y capturas" en /creditos (P6): una por imagen de datos/imagenes.json. Los
 * lugares se agrupan por la región de su ruta y enlazan a su página; si una captura no tiene
 * ruta en los datos, va al grupo "Otros lugares", sin enlace, pero nunca se pierde.
 */
import type { ImagenCreditada, ImagenLugar } from "./imagenes";

export type FilaCredito = { muestra: string; href: string | null; imagen: ImagenCreditada };
export type GrupoCreditos = { titulo: string; filas: FilaCredito[] };

type RutaMinima = { idRuta: number; idPokeapi: number | null; region: string };

export function agruparCreditos(
  imagenes: { regiones: [string, ImagenCreditada][]; lugares: [number, ImagenLugar][] },
  rutas: RutaMinima[],
): GrupoCreditos[] {
  const porIdPokeapi = new Map(rutas.filter((r) => r.idPokeapi != null).map((r) => [r.idPokeapi as number, r]));
  const mapas: GrupoCreditos = {
    titulo: "Mapas de región",
    filas: imagenes.regiones.map(([region, imagen]) => ({ muestra: region, href: `/regiones/${region.toLowerCase()}`, imagen })),
  };
  const lugares = new Map<string, FilaCredito[]>();
  for (const [idPokeapi, imagen] of imagenes.lugares) {
    const ruta = porIdPokeapi.get(idPokeapi);
    const titulo = ruta ? `Lugares de ${ruta.region}` : "Otros lugares";
    const filas = lugares.get(titulo) ?? [];
    filas.push({ muestra: imagen.lugar, href: ruta ? `/rutas/${ruta.idRuta}` : null, imagen });
    lugares.set(titulo, filas);
  }
  const ordenados = [...lugares.entries()]
    .sort(([a], [b]) => (a === "Otros lugares" ? 1 : b === "Otros lugares" ? -1 : a.localeCompare(b, "es")))
    .map(([titulo, filas]) => ({ titulo, filas: filas.sort((a, b) => a.muestra.localeCompare(b.muestra, "es")) }));
  return [mapas, ...ordenados];
}
