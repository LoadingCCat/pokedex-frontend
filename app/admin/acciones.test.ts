/**
 * T-12 / T-15 (interventoría 4.2) · F15: las server actions del panel. Cubren el criterio «un 400 del
 * servidor aparece junto a su campo» (la acción devuelve `campos`), la sesión vencida (401 → login)
 * y la validación de los argumentos antes de llamar a la API.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  escribirApi: vi.fn(),
  leerSesion: vi.fn(),
  borrarSesion: vi.fn(),
  refresh: vi.fn(),
  redirect: vi.fn((destino: string) => {
    throw new Error(`REDIRECT:${destino}`);
  }),
}));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ refresh: mocks.refresh }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/api/admin", () => ({ escribirApi: mocks.escribirApi }));
vi.mock("@/lib/sesion", () => ({ leerSesion: mocks.leerSesion, borrarSesion: mocks.borrarSesion }));

import {
  eliminarMovimiento,
  eliminarPokemon,
  eliminarRuta,
  guardarMovimiento,
  guardarPokemon,
  guardarRuta,
} from "./acciones";
import { AVISO_SIN_API } from "@/lib/sesion-comun";

describe("server actions del panel", () => {
  beforeEach(() => {
    vi.stubEnv("API_URL", "http://api.prueba/api");
    Object.values(mocks).forEach((m) => m.mockClear());
    mocks.leerSesion.mockResolvedValue({ token: "tok", usuario: "admin" });
    mocks.escribirApi.mockResolvedValue({ ok: true, status: 200 });
  });
  afterEach(() => vi.unstubAllEnvs());

  it("éxito: llama a la API con el token, refresca y devuelve ok", async () => {
    const r = await guardarPokemon(25, { nombreEs: "Pikachu" });

    expect(r).toEqual({ ok: true });
    expect(mocks.escribirApi).toHaveBeenCalledWith("tok", "PUT", "/pokemons/25", { nombreEs: "Pikachu" });
    expect(mocks.refresh).toHaveBeenCalledOnce();
  });

  it("id null crea (POST) y un id edita (PUT), en cada recurso", async () => {
    await guardarPokemon(null, {});
    await guardarMovimiento(null, {});
    await guardarMovimiento(9, {});
    await guardarRuta(null, {});
    await guardarRuta(3, {});

    expect(mocks.escribirApi.mock.calls.map((c) => [c[1], c[2]])).toEqual([
      ["POST", "/pokemons"],
      ["POST", "/movimientos"],
      ["PUT", "/movimientos/9"],
      ["POST", "/rutas"],
      ["PUT", "/rutas/3"],
    ]);
  });

  it("eliminar usa DELETE sin cuerpo", async () => {
    await eliminarPokemon(25);
    await eliminarMovimiento(9);
    await eliminarRuta(3);

    expect(mocks.escribirApi.mock.calls.map((c) => [c[1], c[2], c[3]])).toEqual([
      ["DELETE", "/pokemons/25", undefined],
      ["DELETE", "/movimientos/9", undefined],
      ["DELETE", "/rutas/3", undefined],
    ]);
  });

  it("un 400 del servidor con `campos` los devuelve para pintarlos junto a su campo", async () => {
    mocks.escribirApi.mockResolvedValue({
      ok: false,
      status: 400,
      mensaje: "El campo ps debe estar entre 1 y 255",
      campos: { ps: "Debe estar entre 1 y 255" },
    });

    const r = await guardarPokemon(25, { ps: 300 });

    expect(r).toEqual({ ok: false, mensaje: "Revisa los campos marcados.", campos: { ps: "Debe estar entre 1 y 255" } });
    expect(mocks.refresh).not.toHaveBeenCalled();
  });

  it("un 400 sin campos muestra el mensaje del servidor", async () => {
    mocks.escribirApi.mockResolvedValue({ ok: false, status: 400, mensaje: "Cuerpo inválido" });

    expect(await guardarRuta(null, {})).toMatchObject({ ok: false, mensaje: "Cuerpo inválido" });
  });

  it.each([
    [0, /No se pudo conectar con la API/],
    [403, /no tiene permiso/],
    [404, /Ya no existe/],
    [500, /No se pudo guardar/],
  ])("el status %i se traduce a un texto para el usuario", async (status, texto) => {
    mocks.escribirApi.mockResolvedValue({ ok: false, status });

    const r = await eliminarPokemon(1);

    expect(r.ok).toBe(false);
    expect(r.ok === false && r.mensaje).toMatch(texto);
  });

  it("un 409 usa el mensaje del servidor (o uno propio si no viene)", async () => {
    mocks.escribirApi.mockResolvedValue({ ok: false, status: 409, mensaje: "Ese número ya está ocupado" });
    expect(await guardarPokemon(null, {})).toMatchObject({ mensaje: "Ese número ya está ocupado" });

    mocks.escribirApi.mockResolvedValue({ ok: false, status: 409 });
    expect(await guardarPokemon(null, {})).toMatchObject({ mensaje: "Ya existe un registro con esos datos." });
  });

  it("sin sesión redirige a /login con el destino de vuelta, sin llamar a la API", async () => {
    mocks.leerSesion.mockResolvedValue(null);

    await expect(guardarPokemon(25, {})).rejects.toThrow("REDIRECT:/login?volver=%2Fadmin%2Fpokemon%2F25");
    expect(mocks.escribirApi).not.toHaveBeenCalled();
  });

  it("un 401 (sesión vencida) borra la cookie y redirige a /login", async () => {
    mocks.escribirApi.mockResolvedValue({ ok: false, status: 401 });

    await expect(eliminarRuta(3)).rejects.toThrow("REDIRECT:/login?volver=%2Fadmin%2Frutas");
    expect(mocks.borrarSesion).toHaveBeenCalledOnce();
  });

  it("sin API_URL devuelve el aviso y no toca la sesión ni la API", async () => {
    vi.stubEnv("API_URL", "");

    expect(await guardarPokemon(25, {})).toEqual({ ok: false, mensaje: AVISO_SIN_API });
    expect(mocks.leerSesion).not.toHaveBeenCalled();
    expect(mocks.escribirApi).not.toHaveBeenCalled();
  });

  it("argumentos inválidos (id no entero, cuerpo que no es un objeto) responden «no son válidos» sin llamar a la API", async () => {
    const invalido = { ok: false, mensaje: "Los datos no son válidos." };

    expect(await guardarPokemon(0, {})).toEqual(invalido);
    expect(await guardarPokemon(1.5, {})).toEqual(invalido);
    expect(await guardarPokemon(25, null)).toEqual(invalido);
    expect(await guardarMovimiento(25, [])).toEqual(invalido);
    expect(await guardarRuta(25, "texto")).toEqual(invalido);
    expect(await eliminarPokemon(-1)).toEqual(invalido);
    expect(await eliminarMovimiento(Number.NaN)).toEqual(invalido);
    expect(await eliminarRuta("3" as unknown as number)).toEqual(invalido);
    expect(mocks.escribirApi).not.toHaveBeenCalled();
  });
});
