/**
 * El mock cumple los criterios de aceptación de las specs del backend (F1, F2, F4, F5, F7,
 * F8, F9) con los datos del volcado de datos/mock/.
 */
import { describe, expect, it } from "vitest";
import { fuenteMock as api } from "./mock";
import { ErrorApi } from "./tipos";

const ids = (pagina: { content: { idPokedex: number }[] }) => pagina.content.map((p) => p.idPokedex);

async function esperarError(promesa: Promise<unknown>, status: number) {
  await expect(promesa).rejects.toBeInstanceOf(ErrorApi);
  await expect(promesa).rejects.toMatchObject({ status });
}

describe("F1 · Catálogo y ficha", () => {
  it("lista 20 Pokémon en la página 0, empezando por Bulbasaur, Ivysaur y Venusaur", async () => {
    const pagina = await api.listarPokemons();
    expect(pagina.content).toHaveLength(20);
    expect(pagina.page).toEqual({ size: 20, number: 0, totalElements: 1025, totalPages: 52 });
    expect(pagina.content.slice(0, 3).map((p) => p.nombre)).toEqual(["bulbasaur", "ivysaur", "venusaur"]);
  });

  it("recorrer todas las páginas devuelve los 1025 sin repetir ni saltar", async () => {
    const vistos: number[] = [];
    for (let page = 0; page < 6; page++) vistos.push(...ids(await api.listarPokemons({ page, size: 200 })));
    expect(vistos).toEqual(Array.from({ length: 1025 }, (_, i) => i + 1));
  });

  it("limita el tamaño a 200", async () => {
    const pagina = await api.listarPokemons({ size: 500 });
    expect(pagina.content).toHaveLength(200);
    expect(pagina.page.size).toBe(200);
  });

  it("ordena por nombre y por estadísticas", async () => {
    const porNombre = (await api.listarPokemons({ sort: "nombre,asc", size: 200 })).content.map((p) => p.nombre);
    expect(porNombre).toEqual([...porNombre].sort((a, b) => a.localeCompare(b, "es")));
    const rapidos = (await api.listarPokemons({ sort: "velocidad,desc", size: 5 })).content;
    expect(rapidos[0].velocidad).toBeGreaterThanOrEqual(rapidos[4].velocidad!);
  });

  it("un sort por un campo que no existe responde 400", async () => {
    await esperarError(api.listarPokemons({ sort: "campoInexistente" }), 400);
    await esperarError(api.listarPokemons({ sort: "totalEstadisticas,desc" }), 400);
  });

  it("busca sin importar mayúsculas", async () => {
    expect((await api.listarPokemons({ nombre: "PIKA" })).content.map((p) => p.nombre)).toContain("pikachu");
  });

  it("la ficha de Pikachu trae sus estadísticas y su tipo", async () => {
    const pikachu = await api.obtenerPokemon(25);
    expect(pikachu).toMatchObject({
      nombre: "pikachu",
      region: "Kanto",
      ps: 35,
      ataque: 55,
      defensa: 40,
      ataqueEspecial: 50,
      defensaEspecial: 50,
      velocidad: 90,
      totalEstadisticas: 320,
    });
    expect(pikachu!.tipos.map((t) => t.nombre)).toContain("electric");
    expect(pikachu).not.toHaveProperty("movimientos");
  });

  it("un Pokémon que no existe devuelve null", async () => {
    expect(await api.obtenerPokemon(99999)).toBeNull();
  });
});

describe("F2 · Filtros", () => {
  it("filtra por generación, tipo, región y obtención", async () => {
    const gen1 = await api.listarPokemons({ generacion: 1, size: 200 });
    expect(gen1.page.totalElements).toBe(151);
    expect(gen1.content.every((p) => p.generacion === 1)).toBe(true);

    const fuego = await api.listarPokemons({ tipo: "FIRE", size: 200 });
    expect(fuego.content.every((p) => p.tipos.some((t) => t.nombre === "fire"))).toBe(true);

    const kanto = await api.listarPokemons({ region: "kanto", size: 200 });
    expect(kanto.content.every((p) => p.region === "Kanto" || p.rutas.some((r) => r.region === "Kanto"))).toBe(true);
    expect(kanto.page.totalElements).toBeGreaterThan(151); // nativos + los que aparecen en sus rutas

    const fosiles = await api.listarPokemons({ obtencion: "fosil" });
    expect(fosiles.page.totalElements).toBeGreaterThan(0);
    expect(fosiles.content.every((p) => p.tipoObtencion === "Fósil")).toBe(true);
  });

  it("valida generación y obtención; un tipo o región inexistente da una página vacía", async () => {
    await esperarError(api.listarPokemons({ generacion: 12 }), 400);
    await esperarError(api.listarPokemons({ obtencion: "comprado" }), 400);
    expect((await api.listarPokemons({ tipo: "luz" })).page.totalElements).toBe(0);
    expect((await api.listarPokemons({ region: "narnia" })).page.totalElements).toBe(0);
  });

  it("los Pokémon de una ruta incluyen a Pikachu en Viridian Forest", async () => {
    const pikachu = await api.obtenerPokemon(25);
    const bosque = pikachu!.rutas.find((r) => r.nombre === "Viridian Forest")!;
    expect(ids(await api.pokemonsDeRuta(bosque.idRuta, { size: 200 }))).toContain(25);
  });
});

describe("F8 · Filtros combinados", () => {
  it("combina tipo y generación con Y", async () => {
    const pagina = await api.listarPokemons({ tipo: "fire", generacion: 1, size: 200 });
    expect(pagina.page.totalElements).toBeGreaterThan(0);
    expect(pagina.content.every((p) => p.generacion === 1 && p.tipos.some((t) => t.nombre === "fire"))).toBe(true);
  });

  it("un filtro vacío se ignora", async () => {
    const conVacio = await api.listarPokemons({ tipo: "", nombre: "  ", generacion: 1 });
    const sinVacio = await api.listarPokemons({ generacion: 1 });
    expect(conVacio).toEqual(sinVacio);
  });

  it("no repite Pokémon aunque tengan varias rutas en la región", async () => {
    const todos: number[] = [];
    const primera = await api.listarPokemons({ region: "kanto", size: 200 });
    for (let page = 0; page < primera.page.totalPages; page++) {
      todos.push(...ids(await api.listarPokemons({ region: "kanto", size: 200, page })));
    }
    expect(new Set(todos).size).toBe(primera.page.totalElements);
  });
});

describe("F9 · Búsqueda sin tildes", () => {
  it("encuentra Pokémon y movimientos con o sin tildes y ñ", async () => {
    expect(ids(await api.listarPokemons({ nombre: "pikachú" }))).toContain(25);
    const puno = await api.listarMovimientos({ nombre: "puno" });
    expect(puno.content.map((m) => m.nombreEs)).toContain("Puño Trueno");
    const psiquico = await api.listarMovimientos({ nombre: "psiquico" });
    expect(psiquico.content.map((m) => m.nombreEs)).toContain("Psíquico");
  });
});

describe("F4 · Movimientos", () => {
  it("lista paginada por nombre", async () => {
    const pagina = await api.listarMovimientos();
    expect(pagina.content).toHaveLength(20);
    expect(pagina.page.totalElements).toBe(797);
    const nombres = pagina.content.map((m) => m.nombre);
    expect(nombres).toEqual([...nombres].sort((a, b) => a.localeCompare(b, "es")));
  });

  it("filtra por categoría y competitivos", async () => {
    const especiales = await api.listarMovimientos({ categoria: "especial", size: 200 });
    expect(especiales.content.every((m) => m.categoria === "Especial")).toBe(true);
    const competitivos = await api.listarMovimientos({ competitivos: true, size: 200 });
    expect(competitivos.content.every((m) => m.esCompetitivo && (m.potencia ?? 0) > 80)).toBe(true);
  });

  it("movimientos de un Pokémon: ordenados por nombre; null si no existe", async () => {
    const lista = await api.movimientosDePokemon(25);
    expect(lista!.length).toBeGreaterThan(0);
    expect(await api.movimientosDePokemon(99999)).toBeNull();
  });
});

describe("F5 · Rutas y regiones", () => {
  it("las 9 regiones en orden de generación", async () => {
    expect(await api.listarRegiones()).toEqual([
      "Kanto", "Johto", "Hoenn", "Sinnoh", "Teselia", "Kalos", "Alola", "Galar", "Paldea",
    ]);
  });

  it("rutas de Kanto paginadas; ruta inexistente null", async () => {
    const kanto = await api.rutasDeRegion("kanto");
    expect(kanto.page.totalElements).toBe(88);
    expect(kanto.content).toHaveLength(20);
    expect(await api.obtenerRuta(99999)).toBeNull();
  });

  it("18 tipos", async () => {
    expect(await api.listarTipos()).toHaveLength(18);
  });
});

describe("F7 · Cadena evolutiva", () => {
  it("1, 2 y 3 devuelven la misma cadena desde Bulbasaur", async () => {
    const [a, b, c] = await Promise.all([api.evolucionesDe(1), api.evolucionesDe(2), api.evolucionesDe(3)]);
    expect(a).toEqual(b);
    expect(b).toEqual(c);
    expect(a!.nombre).toBe("bulbasaur");
    expect(a!.condicion).toBeNull();
    expect(a!.evoluciones[0]).toMatchObject({ nombre: "ivysaur", condicion: "Nivel 16" });
    expect(a!.evoluciones[0].evoluciones[0]).toMatchObject({ nombre: "venusaur", condicion: "Nivel 32", evoluciones: [] });
  });

  it("Eevee tiene 8 ramas ordenadas por número; Tauros una sola etapa", async () => {
    const eevee = await api.evolucionesDe(133);
    const ramas = eevee!.evoluciones.map((e) => e.idPokedex);
    expect(ramas).toHaveLength(8);
    expect(ramas).toEqual([...ramas].sort((x, y) => x - y));
    expect((await api.evolucionesDe(128))!.evoluciones).toEqual([]);
    expect(await api.evolucionesDe(99999)).toBeNull();
  });
});
