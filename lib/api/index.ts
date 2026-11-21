/**
 * Único acceso a datos del frontend. Las pantallas importan de aquí, nunca de mock.ts ni
 * http.ts. Sin la variable API_URL se usa el mock (datos/mock/); con ella, la API real
 * (por ejemplo API_URL=http://localhost:8080/api).
 */
import "server-only";
import { crearFuenteHttp } from "./http";
import { fuenteMock } from "./mock";
import type { FuenteDatos } from "./tipos";

const fuente: FuenteDatos = process.env.API_URL ? crearFuenteHttp(process.env.API_URL) : fuenteMock;

export const {
  listarPokemons,
  obtenerPokemon,
  movimientosDePokemon,
  evolucionesDe,
  listarMovimientos,
  listarTipos,
  listarRegiones,
  rutasDeRegion,
  obtenerRuta,
  pokemonsDeRuta,
  identificar,
} = fuente;

export * from "./tipos";
