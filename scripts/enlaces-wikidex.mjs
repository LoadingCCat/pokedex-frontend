// Genera enlaces verificados a WikiDex para cada Pokémon, lugar y región (FE.21).
//
// Uso: node scripts/enlaces-wikidex.mjs [archivoSalida]   (por defecto datos/enlaces-wikidex.json)
//
// Para cada elemento se prueban títulos candidatos en la API de MediaWiki de WikiDex (lotes de
// 50 títulos, como mucho una petición por segundo), siguiendo redirecciones. Un enlace es
// "exacto" solo si el artículo existe, no es una desambiguación y es del tipo correcto:
//   - Pokémon: está en la categoría "Lista de Pokémon por número".
//   - Lugar: alguna de sus categorías nombra su región ("Rutas de Teselia", "Ciudades de Kanto"…)
//     o el título la lleva entre paréntesis ("Ruta 1 (Alola)").
//   - Región: está en la categoría "Regiones".
// Si no, el enlace va a la búsqueda de WikiDex (fulltext), que nunca es una página inexistente.
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = process.env.RAIZ_FRONT ?? join(dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = process.argv[2] ?? join(RAIZ, "datos", "enlaces-wikidex.json");
const API = "https://www.wikidex.net/api.php";
const WIKI = "https://www.wikidex.net/wiki/";
const CABECERAS = { "User-Agent": "Pokedex-plus-proyecto-universitario/1.0 (sin fines de lucro)" };
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
let peticiones = 0;

async function pedirJson(url, intento = 1) {
  peticiones++;
  let respuesta;
  try {
    respuesta = await fetch(url, { headers: CABECERAS });
  } catch (error) {
    // Corte de red: se espera cada vez más antes de reintentar (máximo 3 intentos)
    if (intento >= 3) throw error;
    await esperar(10000 * intento);
    return pedirJson(url, intento + 1);
  }
  if ((respuesta.status === 429 || respuesta.status >= 500) && intento < 3) {
    await esperar(10000 * intento);
    return pedirJson(url, intento + 1);
  }
  const texto = await respuesta.text();
  // Si la wiki responde con otra cosa (p. ej. un desafío anti-bots), se para: no se intenta saltar
  if (!respuesta.ok || !texto.startsWith("{")) throw new Error(`Respuesta inesperada (${respuesta.status}) de WikiDex`);
  await esperar(1000);
  return JSON.parse(texto);
}

/**
 * Resuelve títulos (con redirecciones) y devuelve, por título pedido, el artículo final con su
 * marca de desambiguación y sus categorías; null si no existe.
 */
const memoria = new Map();
async function resolver(titulos) {
  const nuevos = [...new Set(titulos)].filter((t) => !memoria.has(t));
  for (let i = 0; i < nuevos.length; i += 50) {
    const lote = nuevos.slice(i, i + 50);
    const paginas = new Map();
    let mapa = {};
    let continuar = {};
    do {
      const parametros = new URLSearchParams({
        action: "query", titles: lote.join("|"), redirects: "1", prop: "categories|pageprops",
        cllimit: "max", ppprop: "disambiguation|description", format: "json", formatversion: "2", ...continuar,
      });
      const r = await pedirJson(`${API}?${parametros}`);
      for (const n of [...(r.query.normalized ?? []), ...(r.query.redirects ?? [])]) mapa[n.from] = n.to;
      for (const p of r.query.pages) {
        const previa = paginas.get(p.title) ?? { ...p, categories: [] };
        previa.categories.push(...(p.categories ?? []));
        paginas.set(p.title, previa);
      }
      continuar = r.continue ?? {};
    } while (Object.keys(continuar).length);
    for (const t of lote) {
      let final = t;
      for (let saltos = 0; mapa[final] && saltos < 3; saltos++) final = mapa[final];
      const p = paginas.get(final);
      memoria.set(t, p && !p.missing && !p.invalid
        ? {
            titulo: final,
            desambiguacion: p.pageprops?.disambiguation !== undefined,
            descripcion: p.pageprops?.description ?? "",
            categorias: p.categories.map((c) => c.title.replace(/^Categoría:/, "")),
          }
        : null);
    }
  }
  return (t) => memoria.get(t) ?? null;
}

const urlArticulo = (titulo) => WIKI + encodeURIComponent(titulo.replace(/ /g, "_")).replace(/%2F/g, "/").replace(/%3A/g, ":");
const urlBusqueda = (texto) => `https://www.wikidex.net/index.php?search=${encodeURIComponent(texto)}&fulltext=1`;
const exacto = (a) => ({ tipo: "exacto", titulo: a.titulo, url: urlArticulo(a.titulo) });
const busqueda = (texto) => ({ tipo: "busqueda", busqueda: texto, url: urlBusqueda(texto) });

const leer = async (archivo) => JSON.parse(await readFile(join(RAIZ, "datos", "mock", archivo), "utf8"));
const [pokemons, rutas, regiones] = await Promise.all([leer("pokemons.json"), leer("rutas.json"), leer("regiones.json")]);
const salida = { generado: new Date().toISOString(), pokemon: {}, lugares: {}, regiones: {} };

// --- Regiones
let r = await resolver(regiones);
for (const region of regiones) {
  const a = r(region);
  salida.regiones[region] = a && !a.desambiguacion && a.categorias.includes("Regiones") ? exacto(a) : busqueda(`${region} región`);
}

// --- Pokémon
const esPokemon = (a) => a && !a.desambiguacion && a.categorias.includes("Lista de Pokémon por número");
const nombrePokemon = (p) => p.nombreEs ?? p.nombre.split("-").map((s) => s[0].toUpperCase() + s.slice(1)).join(" ");
r = await resolver(pokemons.map(nombrePokemon));
const pendientesPokemon = pokemons.filter((p) => !esPokemon(r(nombrePokemon(p))));
r = await resolver(pendientesPokemon.map((p) => `${nombrePokemon(p)} (Pokémon)`));
for (const p of pokemons) {
  const nombre = nombrePokemon(p);
  const a = [r(nombre), r(`${nombre} (Pokémon)`)].find(esPokemon);
  salida.pokemon[p.idPokedex] = a ? exacto(a) : busqueda(nombre);
}

// --- Lugares
const sinTildes = (t) => t.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
// WikiDex no pone las Islas Sete (Rojo Fuego y Verde Hoja) en Kanto sino en la categoría "Archi7",
// aunque la PokeAPI las da como lugares de Kanto
const CATEGORIAS_EXTRA = { kanto: ["Archi7"] };
const esLugarDe = (a, region) => {
  if (!a || a.desambiguacion || a.categorias.includes("Lista de Pokémon por número")) return false;
  const n = sinTildes(region);
  return (
    sinTildes(a.titulo).includes(`(${n})`) ||
    a.categorias.some((c) => sinTildes(c).endsWith(` de ${n}`) || sinTildes(c).includes(` de ${n} `)) ||
    (CATEGORIAS_EXTRA[n] ?? []).some((c) => a.categorias.includes(c))
  );
};
function candidatos(ruta) {
  const n = ruta.nombre;
  const numero = n.match(/^(?:Sea )?Route (\d+)$/i) ?? n.match(/^Ruta (\d+)$/i);
  // Las rutas con número repetido entre regiones llevan la región ("Ruta 1 (Alola)"); las únicas, no ("Ruta 29")
  return numero ? [`Ruta ${numero[1]} (${ruta.region})`, `Ruta ${numero[1]}`] : [n, `${n} (${ruta.region})`];
}
const lugares = rutas.filter((x) => x.idPokeapi != null);
r = await resolver(lugares.flatMap(candidatos));
// Segunda ronda: si un nombre llevó a una desambiguación ("Calle Victoria"), se prueba su versión
// con región. Cada lugar solo usa los títulos que salen de sus propios candidatos.
const segunda = new Map();
for (const l of lugares) {
  const propios = [];
  for (const t of candidatos(l)) {
    const a = r(t);
    if (a?.desambiguacion) for (const base of new Set([a.titulo, ...a.titulo.split("/")])) propios.push(`${base} (${l.region})`);
  }
  segunda.set(l.idPokeapi, propios);
}
r = await resolver([...segunda.values()].flat());
const hallado = (l) => [...candidatos(l), ...(segunda.get(l.idPokeapi) ?? [])].map(r).find((x) => esLugarDe(x, l.region));

// Tercera ronda, solo para los nombres en inglés que no se resolvieron ("Ilex Forest"): se busca
// el nombre entre comillas y se acepta un resultado solo si su descripción dice
// "(Ilex Forest en inglés…)" y es un lugar de la región. Una búsqueda por lugar.
const tercera = new Map();
const pendientes = lugares.filter((l) => !hallado(l) && /^[\x20-\x7E]+$/.test(l.nombre) && !/^(Ruta|Route|Sea Route) \d+$/i.test(l.nombre));
for (const l of pendientes) {
  const parametros = new URLSearchParams({ action: "query", list: "search", srsearch: `"${l.nombre}"`, srnamespace: "0", srlimit: "5", format: "json", formatversion: "2" });
  const resultados = (await pedirJson(`${API}?${parametros}`)).query.search.map((s) => s.title);
  tercera.set(l.idPokeapi, resultados);
}
r = await resolver([...tercera.values()].flat());
const confirmaIngles = (a, nombre) => a && sinTildes(a.descripcion).includes(`${sinTildes(nombre)} en ingles`);
for (const l of lugares) {
  const a = hallado(l) ?? (tercera.get(l.idPokeapi) ?? []).map(r).find((x) => esLugarDe(x, l.region) && confirmaIngles(x, l.nombre));
  salida.lugares[l.idPokeapi] = a ? exacto(a) : busqueda(`${l.nombre} ${l.region}`);
}

await writeFile(SALIDA, JSON.stringify(salida, null, 1) + "\n");
const contar = (o) => {
  const v = Object.values(o);
  return `${v.filter((e) => e.tipo === "exacto").length} exactos / ${v.filter((e) => e.tipo === "busqueda").length} en búsqueda`;
};
console.log(`Pokémon: ${contar(salida.pokemon)} · Lugares: ${contar(salida.lugares)} · Regiones: ${contar(salida.regiones)} · ${peticiones} peticiones a WikiDex`);
