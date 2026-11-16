// Genera datos/mock/*.json a partir del backend local (FE.5).
// Uso: node scripts/generar-mock.mjs [urlBase]   (por defecto http://localhost:8080/api)
// El backend debe estar arrancado y con los 1025 Pokémon importados.
// Los JSON tienen la misma forma que docs/contratos/api.md del backend.

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = (process.argv[2] ?? "http://localhost:8080/api").replace(/\/$/, "");
const DESTINO = join(dirname(fileURLToPath(import.meta.url)), "..", "datos", "mock");
const PARALELO = 8;

async function pedir(ruta) {
  const respuesta = await fetch(`${BASE}${ruta}`);
  if (!respuesta.ok) throw new Error(`${respuesta.status} en ${ruta}`);
  return respuesta.json();
}

/** Recorre todas las páginas de una lista paginada ({ content, page }). */
async function todasLasPaginas(ruta) {
  const separador = ruta.includes("?") ? "&" : "?";
  const elementos = [];
  for (let pagina = 0; ; pagina++) {
    const { content, page } = await pedir(`${ruta}${separador}size=200&page=${pagina}`);
    elementos.push(...content);
    if (pagina + 1 >= page.totalPages) return elementos;
  }
}

/** Ejecuta `tarea` sobre cada elemento, con PARALELO peticiones a la vez. */
async function enParalelo(elementos, tarea) {
  const resultados = new Array(elementos.length);
  let siguiente = 0;
  async function trabajador() {
    while (siguiente < elementos.length) {
      const i = siguiente++;
      resultados[i] = await tarea(elementos[i]);
    }
  }
  await Promise.all(Array.from({ length: PARALELO }, trabajador));
  return resultados;
}

async function guardar(nombre, datos) {
  const texto = JSON.stringify(datos);
  await writeFile(join(DESTINO, nombre), texto);
  console.log(`  ${nombre.padEnd(30)} ${(texto.length / 1024).toFixed(0).padStart(6)} KB`);
}

async function principal() {
  console.log(`Leyendo ${BASE} …`);
  const [pokemons, movimientos, rutas, regiones, tipos] = await Promise.all([
    todasLasPaginas("/pokemons"),
    todasLasPaginas("/movimientos"),
    todasLasPaginas("/rutas"),
    pedir("/rutas/regiones"),
    pedir("/tipos"),
  ]);
  console.log(`  ${pokemons.length} Pokémon, ${movimientos.length} movimientos, ${rutas.length} rutas`);

  // Movimientos que aprende cada Pokémon: solo los ids (el detalle está en movimientos.json)
  const movimientosPorPokemon = {};
  await enParalelo(pokemons, async ({ idPokedex }) => {
    const lista = await pedir(`/pokemons/${idPokedex}/movimientos`);
    movimientosPorPokemon[idPokedex] = lista.map((m) => m.idMovimiento);
  });

  // Cadenas evolutivas: un árbol por cadena (identificado por su etapa base) + índice id → base
  const cadenas = {};
  const indice = {};
  const pendientes = new Set(pokemons.map((p) => p.idPokedex));
  const recorrer = (etapa, base) => {
    indice[etapa.idPokedex] = base;
    pendientes.delete(etapa.idPokedex);
    etapa.evoluciones.forEach((hija) => recorrer(hija, base));
  };
  for (const { idPokedex } of pokemons) {
    if (!pendientes.has(idPokedex)) continue; // ya salió en la cadena de otro
    const arbol = await pedir(`/pokemons/${idPokedex}/evoluciones`);
    cadenas[arbol.idPokedex] = arbol;
    recorrer(arbol, arbol.idPokedex);
  }

  // Pokémon de cada ruta (para /pokemons/ruta/{id}): solo los idPokedex
  const pokemonsPorRuta = {};
  for (const { idPokedex, rutas: suyas } of pokemons) {
    for (const { idRuta } of suyas ?? []) {
      (pokemonsPorRuta[idRuta] ??= []).push(idPokedex);
    }
  }

  await mkdir(DESTINO, { recursive: true });
  console.log(`Escribiendo ${DESTINO}`);
  await guardar("pokemons.json", pokemons);
  await guardar("movimientos.json", movimientos);
  await guardar("movimientos-por-pokemon.json", movimientosPorPokemon);
  await guardar("evoluciones.json", { cadenas, indice });
  await guardar("rutas.json", rutas);
  await guardar("pokemons-por-ruta.json", pokemonsPorRuta);
  await guardar("regiones.json", regiones);
  await guardar("tipos.json", tipos);
  await guardar(
    "info.json",
    {
      generado: new Date().toISOString(),
      fuente: BASE,
      pokemons: pokemons.length,
      movimientos: movimientos.length,
      rutas: rutas.length,
      cadenas: Object.keys(cadenas).length,
    },
  );
  console.log("Listo.");
}

principal().catch((error) => {
  console.error(`Error: ${error.message}. ¿Está arrancado el backend en ${BASE}?`);
  process.exit(1);
});
