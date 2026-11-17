// Descarga los mapas de región, las capturas de lugares (FE.19–FE.20) y las capturas del juego de la
// ficha (FE.23–FE.24) elegidos en scripts/imagenes-fuentes.json, los convierte a WebP y escribe
// datos/imagenes.json.
//
// Uso: node scripts/imagenes.mjs
//
// - Fuente: WikiDex (API de MediaWiki). Se piden miniaturas del ancho máximo, no los originales.
// - Respeta la wiki: una consulta por lote de 50 archivos y como mucho una descarga por segundo.
// - WebP con sharp (calidad 80, o sin pérdida si ocupa menos, como en el pixel art); nunca agranda la imagen.
// - Se puede repetir: vuelve a generar todo a partir de la lista.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://www.wikidex.net/api.php";
const CABECERAS = { "User-Agent": "Pokedex-plus-proyecto-universitario/1.0 (sin fines de lucro)" };
const CALIDAD = 80;

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (texto) =>
  texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

async function pedirJson(url) {
  const respuesta = await fetch(url, { headers: CABECERAS });
  const texto = await respuesta.text();
  // Si la wiki responde con otra cosa (p. ej. un desafío anti-bots), se para: no se intenta saltar
  if (!respuesta.ok || !texto.startsWith("{")) throw new Error(`Respuesta inesperada (${respuesta.status}) de ${url}`);
  return JSON.parse(texto);
}

/** Datos de los archivos en WikiDex, con la URL de una miniatura de `ancho` px. */
async function informacion(archivos, ancho) {
  const salida = new Map();
  for (let i = 0; i < archivos.length; i += 50) {
    const lote = archivos.slice(i, i + 50);
    const titulos = lote.map((a) => `Archivo:${a}`).join("|");
    const datos = await pedirJson(
      `${API}?action=query&titles=${encodeURIComponent(titulos)}&prop=imageinfo&iiprop=url|size&iiurlwidth=${ancho}&format=json&formatversion=2`,
    );
    for (const pagina of datos.query.pages) {
      const info = pagina.imageinfo?.[0];
      if (!info) throw new Error(`No existe en WikiDex: ${pagina.title}`);
      salida.set(pagina.title.replace(/^Archivo:/, "").replace(/ /g, "_"), info);
    }
    await esperar(1000);
  }
  return salida;
}

/** Descarga la miniatura, la convierte a WebP y devuelve su ruta pública y su tamaño final. */
async function procesar(info, anchoMaximo, rutaPublica) {
  const fuente = info.thumburl ?? info.url;
  const respuesta = await fetch(fuente, { headers: CABECERAS });
  if (!respuesta.ok) throw new Error(`No se pudo descargar ${fuente} (${respuesta.status})`);
  const original = Buffer.from(await respuesta.arrayBuffer());
  const redimensionada = sharp(original).resize({ width: anchoMaximo, withoutEnlargement: true });
  // El pixel art (vistas de ruta) ocupa menos y se ve mejor sin pérdida: se queda el WebP más pequeño
  const [conPerdida, sinPerdida] = await Promise.all([
    redimensionada.clone().webp({ quality: CALIDAD }).toBuffer({ resolveWithObject: true }),
    redimensionada.clone().webp({ lossless: true, effort: 6 }).toBuffer({ resolveWithObject: true }),
  ]);
  const webp = sinPerdida.data.length <= conPerdida.data.length ? sinPerdida : conPerdida;
  const destino = join(RAIZ, "public", rutaPublica);
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, webp.data);
  await esperar(1000);
  return {
    archivo: `/${rutaPublica}`,
    ancho: webp.info.width,
    alto: webp.info.height,
    kb: Math.round(webp.data.length / 1024),
    kbDescargados: Math.round(original.length / 1024),
  };
}

const credito = (info, archivo, juego) => ({
  juego,
  fuente: "WikiDex",
  archivoOriginal: archivo,
  origen: info.descriptionurl,
  licencia: "Uso legítimo (fair use), sin fines de lucro. Pokémon © Nintendo / Creatures / Game Freak",
});

const fuentes = JSON.parse(await readFile(join(RAIZ, "scripts", "imagenes-fuentes.json"), "utf8"));
const salida = { generado: new Date().toISOString(), regiones: {}, lugares: {}, pokemon: {} };
let kbFinal = 0;
let kbDescarga = 0;

const infoRegiones = await informacion(fuentes.regiones.map((r) => r.archivoWikidex), 1600);
for (const r of fuentes.regiones) {
  const info = infoRegiones.get(r.archivoWikidex);
  const imagen = await procesar(info, r.anchoMaximo, `imagenes/regiones/${slug(r.region)}.webp`);
  kbFinal += imagen.kb;
  kbDescarga += imagen.kbDescargados;
  const { kb, kbDescargados, ...resto } = imagen;
  salida.regiones[r.region] = { ...resto, alt: `Mapa de la región de ${r.region} en ${r.juego}`, ...credito(info, r.archivoWikidex, r.juego) };
  console.log(`  ${r.region.padEnd(9)} ${imagen.ancho}×${imagen.alto}  ${kbDescargados} KB → ${kb} KB`);
}

const infoLugares = await informacion(fuentes.lugares.map((l) => l.archivoWikidex), 1200);
for (const l of fuentes.lugares) {
  const info = infoLugares.get(l.archivoWikidex);
  const imagen = await procesar(info, l.anchoMaximo, `imagenes/lugares/${l.idPokeapi}.webp`);
  kbFinal += imagen.kb;
  kbDescarga += imagen.kbDescargados;
  const { kb, kbDescargados, ...resto } = imagen;
  const alt = l.vista === "desde arriba" ? `Vista desde arriba de ${l.lugar} en ${l.juego}` : `${l.lugar} en ${l.juego}`;
  salida.lugares[l.idPokeapi] = { ...resto, lugar: l.lugar, alt, ...credito(info, l.archivoWikidex, l.juego) };
  console.log(`  ${String(l.idPokeapi).padStart(4)} ${l.lugar.padEnd(22)} ${imagen.ancho}×${imagen.alto}  ${kbDescargados} KB → ${kb} KB`);
}

// Capturas del juego en la ficha: el pixel art (GB, GBA, DS: hasta 256 px) se guarda a su tamaño, sin
// pérdida, y la ficha lo muestra a 2× pixelado; las capturas en HD se reducen a 1024 px como mucho
const PIXEL_ART = 256;
const capturas = (fuentes.pokemon ?? []).flatMap((p) => p.capturas.map((c, i) => ({ ...c, p, i })));
const infoCapturas = await informacion(capturas.map((c) => c.archivoWikidex), 1024);
for (const c of capturas) {
  const info = infoCapturas.get(c.archivoWikidex);
  const pixelArt = info.width <= PIXEL_ART;
  const imagen = await procesar(info, pixelArt ? info.width : 1024, `imagenes/pokemon/${c.p.idPokedex}-${c.i + 1}.webp`);
  kbFinal += imagen.kb;
  kbDescarga += imagen.kbDescargados;
  const { kb, kbDescargados, ...resto } = imagen;
  (salida.pokemon[c.p.idPokedex] ??= []).push({ ...resto, pixelArt, pokemon: c.p.nombre, pie: c.pie, alt: c.pie, ...credito(info, c.archivoWikidex, c.juego) });
  console.log(`  #${String(c.p.idPokedex).padStart(4, "0")} ${c.archivoWikidex.slice(0, 40).padEnd(40)} ${imagen.ancho}×${imagen.alto}  ${kbDescargados} KB → ${kb} KB`);
}

await writeFile(join(RAIZ, "datos", "imagenes.json"), JSON.stringify(salida, null, 2) + "\n");
console.log(`Listo: ${Object.keys(salida.regiones).length} mapas, ${Object.keys(salida.lugares).length} lugares y ${capturas.length} capturas de ${Object.keys(salida.pokemon).length} Pokémon. Descargado ${kbDescarga} KB → WebP ${kbFinal} KB.`);
