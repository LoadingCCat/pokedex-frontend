/**
 * Compara el mock con la API real: mismas consultas, mismas respuestas.
 * Solo corre si existe API_URL (con el backend arrancado), por ejemplo:
 *   $env:API_URL = "http://localhost:8080/api"; npm run test
 */
import { describe, expect, it } from "vitest";
import { crearFuenteHttp } from "./http";
import { fuenteMock } from "./mock";
import type { FiltrosMovimiento, FiltrosPokemon, Pagina } from "./tipos";

const API_URL = process.env.API_URL;

describe.skipIf(!API_URL)("El mock responde igual que la API real", () => {
  const real = crearFuenteHttp(API_URL ?? "");

  const resumen = <T>(pagina: Pagina<T>, clave: (x: T) => number) => ({
    page: pagina.page,
    ids: pagina.content.map(clave),
  });

  const consultasPokemon: FiltrosPokemon[] = [
    {},
    { page: 3 },
    { size: 500 },
    { nombre: "pikachú" },
    { nombre: "saur", generacion: 1 },
    { tipo: "fire", generacion: 1 },
    { region: "kanto", size: 200 },
    { region: "teselia", page: 2 },
    { obtencion: "fosil" },
    { obtencion: "Sin datos", size: 200 },
    { tipo: "", generacion: 4 },
    { tipo: "luz" },
    { tipo: ["fire", "flying"] },
    { tipo: ["flying", "fire"], generacion: 1, sort: "idPokedex,desc" },
    { tipo: ["fire", "fire"] },
  ];

  it.each(consultasPokemon)("listarPokemons(%o)", async (filtros) => {
    const [mock, api] = await Promise.all([fuenteMock.listarPokemons(filtros), real.listarPokemons(filtros)]);
    expect(resumen(mock, (p) => p.idPokedex)).toEqual(resumen(api, (p) => p.idPokedex));
  });

  it("listarPokemons ordenado por velocidad: mismos totales y mismas velocidades", async () => {
    const filtros = { sort: "velocidad,desc", size: 50 };
    const [mock, api] = await Promise.all([fuenteMock.listarPokemons(filtros), real.listarPokemons(filtros)]);
    expect(mock.page).toEqual(api.page);
    // con empates el orden entre iguales puede variar
    expect(mock.content.map((p) => p.velocidad)).toEqual(api.content.map((p) => p.velocidad));
  });

  const consultasMovimiento: FiltrosMovimiento[] = [
    { size: 200 },
    { nombre: "puno" },
    { categoria: "Especial", size: 200 },
    { competitivos: true, size: 200 },
  ];

  it.each(consultasMovimiento)("listarMovimientos(%o): mismos movimientos", async (filtros) => {
    const [mock, api] = await Promise.all([fuenteMock.listarMovimientos(filtros), real.listarMovimientos(filtros)]);
    expect(mock.page).toEqual(api.page);
    // el orden por nombre depende de la intercalación de PostgreSQL: se comparan como conjunto
    expect(mock.content.map((m) => m.idMovimiento).sort()).toEqual(api.content.map((m) => m.idMovimiento).sort());
  });

  it.each([1, 25, 133, 128, 151, 1025])("ficha, movimientos y evoluciones de %i", async (id) => {
    expect(await fuenteMock.obtenerPokemon(id)).toEqual(await real.obtenerPokemon(id));
    expect(await fuenteMock.movimientosDePokemon(id)).toEqual(await real.movimientosDePokemon(id));
    expect(await fuenteMock.evolucionesDe(id)).toEqual(await real.evolucionesDe(id));
  });

  it("no existe → null en las dos", async () => {
    expect(await real.obtenerPokemon(99999)).toBeNull();
    expect(await real.movimientosDePokemon(99999)).toBeNull();
    expect(await real.evolucionesDe(99999)).toBeNull();
    expect(await real.obtenerRuta(99999)).toBeNull();
  });

  it("regiones, tipos, rutas de Kanto y Pokémon de una ruta", async () => {
    expect(await fuenteMock.listarRegiones()).toEqual(await real.listarRegiones());
    expect(await fuenteMock.listarTipos()).toEqual(await real.listarTipos());
    const [mock, api] = await Promise.all([
      fuenteMock.rutasDeRegion("kanto", { size: 200 }),
      real.rutasDeRegion("kanto", { size: 200 }),
    ]);
    expect(mock.page).toEqual(api.page);
    const idRuta = api.content[0].idRuta;
    expect(await fuenteMock.obtenerRuta(idRuta)).toEqual(await real.obtenerRuta(idRuta));
    const [pm, pa] = await Promise.all([fuenteMock.pokemonsDeRuta(idRuta), real.pokemonsDeRuta(idRuta)]);
    expect(resumen(pm, (p) => p.idPokedex)).toEqual(resumen(pa, (p) => p.idPokedex));
  });

  it("los errores 400 coinciden", async () => {
    for (const filtros of [{ generacion: 12 }, { obtencion: "comprado" }, { sort: "campoInexistente" }]) {
      await expect(fuenteMock.listarPokemons(filtros)).rejects.toMatchObject({ status: 400 });
      await expect(real.listarPokemons(filtros)).rejects.toMatchObject({ status: 400 });
    }
  });
});
