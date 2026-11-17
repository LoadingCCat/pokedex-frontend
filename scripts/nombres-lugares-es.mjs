// Genera los nombres en español de los lugares para el backend (B.28) a partir de los títulos
// verificados de WikiDex de datos/enlaces-wikidex.json (FE.21). No hace peticiones.
//
// Uso: node scripts/nombres-lugares-es.mjs [archivoSalida]
//      (por defecto ../pokedex-backend/src/main/resources/lugares-es.properties)
//
// - Solo los lugares "exacto" (artículo verificado); los de búsqueda se quedan con su nombre.
// - Se quita la región o el juego entre paréntesis: "Ruta 10 (Kanto)" → "Ruta 10".
// - Con dos nombres, Hispanoamérica/España ("Pilares Lanza/Columnas Lanza"), se usa el de España,
//   el de los textos de los juegos (docs/decisiones.md, 2026-11-17).
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = process.argv[2] ?? join(RAIZ, "..", "pokedex-backend", "src", "main", "resources", "lugares-es.properties");
const REGIONES = "Kanto|Johto|Hoenn|Sinnoh|Teselia|Kalos|Alola|Galar|Paldea|Orre";

const sinParentesis = (t) => t.replace(new RegExp(` \\((${REGIONES}|Pokémon [^)]*)\\)$`), "").trim();
export function nombreEspanol(titulo) {
  const partes = titulo.split("/").map(sinParentesis);
  return partes[partes.length - 1];
}

// Artículos de dos lugares de versión (Sol/Luna), no de dos traducciones: no dan un nombre único,
// así que esos lugares conservan el suyo (la PokeAPI ya los tiene en español)
const PAREJAS_DE_VERSION = new Set(["Altar del Sol/de la Luna", "Lago Corosol/Coroluna"]);

const enlaces = JSON.parse(await readFile(join(RAIZ, "datos", "enlaces-wikidex.json"), "utf8"));
const filas = Object.entries(enlaces.lugares)
  .filter(([, e]) => e.tipo === "exacto" && !PAREJAS_DE_VERSION.has(e.titulo))
  .map(([id, e]) => [Number(id), nombreEspanol(e.titulo)])
  .sort((a, b) => a[0] - b[0]);
// .properties en UTF-8 (Java lo lee con un Reader UTF-8); "=" y ":" no aparecen en los nombres
if (filas.some(([, n]) => /[=:\\]/.test(n))) throw new Error("Un nombre tiene un carácter reservado de .properties");
const texto = [
  "# Nombres en español de los lugares por idPokeapi (B.28). Generado por pokedex-frontend/scripts/nombres-lugares-es.mjs",
  "# desde los títulos verificados de WikiDex. No editar a mano.",
  ...filas.map(([id, n]) => `${id}=${n}`),
].join("\n") + "\n";
await writeFile(SALIDA, texto, "utf8");
console.log(`${filas.length} nombres → ${SALIDA}`);
