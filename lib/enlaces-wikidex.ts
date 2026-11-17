/**
 * Enlaces a WikiDex (Fase 3). Los genera scripts/enlaces-wikidex.mjs en datos/enlaces-wikidex.json:
 * "exacto" si el artículo se verificó (existe, no es desambiguación y es del tipo correcto) y
 * "busqueda" si no. Lo que no está en el archivo (rutas creadas a mano, regiones o Pokémon nuevos)
 * recibe un enlace de búsqueda armado aquí, que nunca lleva a una página inexistente.
 */
import datos from "../datos/enlaces-wikidex.json";

export type EnlaceWikidex = { tipo: "exacto" | "busqueda"; url: string };

type Registro = { tipo: string; url: string };
const pokemon = datos.pokemon as Record<string, Registro>;
const lugares = datos.lugares as Record<string, Registro>;
const regiones = datos.regiones as Record<string, Registro>;

/** Búsqueda de texto completo en WikiDex. */
export function busquedaWikidex(texto: string): EnlaceWikidex {
  return { tipo: "busqueda", url: `https://www.wikidex.net/index.php?search=${encodeURIComponent(texto.trim())}&fulltext=1` };
}

const deRegistro = (r: Registro | undefined): EnlaceWikidex | null =>
  r ? { tipo: r.tipo === "exacto" ? "exacto" : "busqueda", url: r.url } : null;

export function enlaceDePokemon(idPokedex: number, nombre: string): EnlaceWikidex {
  return deRegistro(pokemon[String(idPokedex)]) ?? busquedaWikidex(nombre);
}

/** Por `idPokeapi`; las rutas creadas a mano (null) buscan por nombre y región. */
export function enlaceDeLugar(idPokeapi: number | null, nombre: string, region: string): EnlaceWikidex {
  return (idPokeapi == null ? null : deRegistro(lugares[String(idPokeapi)])) ?? busquedaWikidex(`${nombre} ${region}`);
}

/** "Kanto" o "kanto". */
export function enlaceDeRegion(region: string): EnlaceWikidex {
  const clave = Object.keys(regiones).find((r) => r.toLowerCase() === region.trim().toLowerCase());
  return deRegistro(clave ? regiones[clave] : undefined) ?? busquedaWikidex(`${region} región`);
}
