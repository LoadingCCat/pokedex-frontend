/**
 * T-15 (interventoría 4.2): `lib/api/http.ts` sin API real, con `fetch` simulado. Antes solo lo
 * cubría `contrato.test.ts`, que únicamente corre con `API_URL`.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { TIEMPO_ESPERA_IDENTIFICAR_MS, TIEMPO_ESPERA_MS, crearFuenteHttp, pedirApi } from "./http";
import { ErrorApi } from "./tipos";

const URL_BASE = "http://api.prueba/api";
const pagina = { content: [], page: { size: 20, number: 0, totalElements: 0, totalPages: 0 } };

type LlamadaFetch = Parameters<typeof fetch>;

function simularFetch(respuesta: () => Response | Promise<Response>) {
  const simulado = vi.fn<typeof fetch>(async () => respuesta());
  vi.stubGlobal("fetch", simulado);
  return simulado;
}

/** La URL a la que se hizo la llamada n (la primera por defecto). */
const urlLlamada = (simulado: { mock: { calls: unknown[][] } }, n = 0) => String((simulado.mock.calls[n] as LlamadaFetch)[0]);

/** El error con el que falla la promesa (y si no falla, la prueba falla). */
async function fallo(promesa: Promise<unknown>): Promise<ErrorApi> {
  try {
    await promesa;
  } catch (e) {
    return e as ErrorApi;
  }
  throw new Error("La llamada debía fallar y no falló");
}

afterEach(() => vi.unstubAllGlobals());

describe("pedirApi", () => {
  it("quita la barra final de la base, pide JSON con tope de espera y devuelve el cuerpo", async () => {
    const fetchSimulado = simularFetch(() => Response.json({ ok: 1 }));

    const datos = await pedirApi<{ ok: number }>(`${URL_BASE}/`, "/tipos");

    expect(datos).toEqual({ ok: 1 });
    expect(urlLlamada(fetchSimulado)).toBe(`${URL_BASE}/tipos`);
    const opciones = (fetchSimulado.mock.calls[0] as LlamadaFetch)[1]!;
    expect(opciones.headers).toEqual({ Accept: "application/json" });
    expect(opciones.signal).toBeInstanceOf(AbortSignal);
  });

  it("un error de la API lanza ErrorApi con el status y el `mensaje` del cuerpo", async () => {
    simularFetch(() => Response.json({ mensaje: "El parámetro 'sort' no es válido" }, { status: 400 }));

    const error = await fallo(pedirApi(URL_BASE, "/pokemons"));

    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.status).toBe(400);
    expect(error.message).toBe("El parámetro 'sort' no es válido");
  });

  it("si el cuerpo del error no es JSON, el mensaje es «Error {status}»", async () => {
    simularFetch(() => new Response("<html>boom</html>", { status: 502 }));

    const error = await fallo(pedirApi(URL_BASE, "/pokemons"));

    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.status).toBe(502);
    expect(error.message).toBe("Error 502");
  });

  it("los topes de espera dejan margen para el arranque en frío y el de identificar es mayor", () => {
    expect(TIEMPO_ESPERA_MS).toBe(180_000);
    expect(TIEMPO_ESPERA_IDENTIFICAR_MS).toBeGreaterThan(TIEMPO_ESPERA_MS);
    expect(TIEMPO_ESPERA_IDENTIFICAR_MS).toBeLessThan(300_000); // maxDuration de Vercel
  });
});

describe("crearFuenteHttp · parámetros de consulta", () => {
  it("dos tipos viajan como parámetro repetido y los vacíos o indefinidos no se envían", async () => {
    const fetchSimulado = simularFetch(() => Response.json(pagina));

    await crearFuenteHttp(URL_BASE).listarPokemons({
      tipo: ["fire", "flying"],
      nombre: "",
      region: undefined,
      generacion: 1,
      page: 2,
      size: 20,
      sort: "nombre,asc",
    });

    const url = new URL(urlLlamada(fetchSimulado));
    expect(url.pathname).toBe("/api/pokemons");
    expect(url.searchParams.getAll("tipo")).toEqual(["fire", "flying"]);
    expect(url.searchParams.get("generacion")).toBe("1");
    expect(url.searchParams.get("page")).toBe("2");
    expect(url.searchParams.get("sort")).toBe("nombre,asc");
    expect(url.searchParams.has("nombre")).toBe(false);
    expect(url.searchParams.has("region")).toBe(false);
  });

  it("sin filtros no añade «?» a la URL", async () => {
    const fetchSimulado = simularFetch(() => Response.json(pagina));

    await crearFuenteHttp(URL_BASE).listarPokemons();

    expect(urlLlamada(fetchSimulado)).toBe(`${URL_BASE}/pokemons`);
  });

  it("escapa lo que va en el segmento de la ruta", async () => {
    const fetchSimulado = simularFetch(() => Response.json(pagina));

    await crearFuenteHttp(URL_BASE).rutasDeRegion(" Kanto/Johto ");

    expect(urlLlamada(fetchSimulado)).toBe(`${URL_BASE}/rutas/region/Kanto%2FJohto`);
  });
});

describe("crearFuenteHttp · movimientos", () => {
  it("elige el endpoint según el filtro: búsqueda, categoría, competitivos o listado", async () => {
    const fetchSimulado = simularFetch(() => Response.json(pagina));
    const fuente = crearFuenteHttp(URL_BASE);

    await fuente.listarMovimientos({ nombre: " trueno ", categoria: "Físico" });
    await fuente.listarMovimientos({ categoria: "Físico" });
    await fuente.listarMovimientos({ competitivos: true });
    await fuente.listarMovimientos({});

    const rutas = fetchSimulado.mock.calls.map((_, n) => new URL(urlLlamada(fetchSimulado, n)));
    expect(rutas.map((u) => u.pathname)).toEqual([
      "/api/movimientos/buscar",
      "/api/movimientos/categoria/F%C3%ADsico",
      "/api/movimientos/competitivos",
      "/api/movimientos",
    ]);
    expect(rutas[0].searchParams.get("nombre")).toBe("trueno");
  });
});

describe("crearFuenteHttp · 404 y 400 devuelven null", () => {
  it.each([404, 400])("obtenerPokemon con un %i responde null", async (status) => {
    simularFetch(() => Response.json({ mensaje: "no existe" }, { status }));

    expect(await crearFuenteHttp(URL_BASE).obtenerPokemon(99999)).toBeNull();
  });

  it("evolucionesDe, movimientosDePokemon y obtenerRuta también", async () => {
    simularFetch(() => Response.json({ mensaje: "no existe" }, { status: 404 }));
    const fuente = crearFuenteHttp(URL_BASE);

    expect(await fuente.evolucionesDe(1)).toBeNull();
    expect(await fuente.movimientosDePokemon(1)).toBeNull();
    expect(await fuente.obtenerRuta(1)).toBeNull();
  });

  it("un 500 no se esconde: lanza ErrorApi", async () => {
    simularFetch(() => Response.json({ mensaje: "Fallo interno" }, { status: 500 }));

    const error = await fallo(crearFuenteHttp(URL_BASE).obtenerPokemon(1));

    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.status).toBe(500);
  });
});

describe("crearFuenteHttp · identificar (F20)", () => {
  const foto = new Blob([new Uint8Array([0xff, 0xd8, 0xff])], { type: "image/jpeg" });

  it("envía la foto como multipart en el campo `foto` y devuelve la identificación", async () => {
    const fetchSimulado = simularFetch(() => Response.json({ confianza: 0.93 }));

    const r = await crearFuenteHttp(URL_BASE).identificar(foto);

    expect(r).toEqual({ confianza: 0.93 });
    expect(urlLlamada(fetchSimulado)).toBe(`${URL_BASE}/pokemons/identificar`);
    const opciones = (fetchSimulado.mock.calls[0] as LlamadaFetch)[1]!;
    expect(opciones.method).toBe("POST");
    expect((opciones.body as FormData).get("foto")).toBeInstanceOf(Blob);
    expect(opciones.headers).not.toHaveProperty("Authorization"); // es público: sin token
  });

  it("las cabeceras de proxy (N-01) viajan al backend junto con las de siempre", async () => {
    const fetchSimulado = simularFetch(() => Response.json({ confianza: 0.93 }));

    await crearFuenteHttp(URL_BASE).identificar(foto, { "X-Cliente-IP": "203.0.113.7", "X-Proxy-Secreto": "s" });

    const opciones = (fetchSimulado.mock.calls[0] as LlamadaFetch)[1]!;
    expect(opciones.headers).toMatchObject({ Accept: "application/json", "X-Cliente-IP": "203.0.113.7", "X-Proxy-Secreto": "s" });
  });

  it("un error de la API (422) se lanza como ErrorApi con su status", async () => {
    simularFetch(() => Response.json({ mensaje: "No reconocimos un Pokémon" }, { status: 422 }));

    const error = await fallo(crearFuenteHttp(URL_BASE).identificar(foto));

    expect(error).toBeInstanceOf(ErrorApi);
    expect(error.status).toBe(422);
  });

  it("un tiempo agotado es un 504 y un fallo de red es el status 0", async () => {
    const agotado = Object.assign(new Error("timeout"), { name: "TimeoutError" });
    vi.stubGlobal("fetch", vi.fn(async () => { throw agotado; }));
    const porTiempo = await fallo(crearFuenteHttp(URL_BASE).identificar(foto));
    expect(porTiempo).toBeInstanceOf(ErrorApi);
    expect(porTiempo.status).toBe(504);

    vi.stubGlobal("fetch", vi.fn(async () => { throw new TypeError("fetch failed"); }));
    const porRed = await fallo(crearFuenteHttp(URL_BASE).identificar(foto));
    expect(porRed).toBeInstanceOf(ErrorApi);
    expect(porRed.status).toBe(0);
  });
});
