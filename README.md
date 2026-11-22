# Pokedex+ · Frontend

Pokédex web en español con los 1025 Pokémon de las 9 generaciones: catálogo con búsqueda y filtros combinados, ficha con estadísticas, dónde y cómo se obtiene cada Pokémon, cadena evolutiva y movimientos, y las regiones con sus lugares.

Sobre esa base «Laboratorio», unos **toques de nostalgia** sacados de los juegos: el sprite animado de Negro/Blanco al pasar el ratón, el grito y la versión shiny en la ficha, el sprite clásico pixelado junto a la ilustración, los mapas de las 9 regiones, capturas del juego de 348 lugares y de cómo se consiguen 801 Pokémon, discos de MT del color de cada tipo y enlaces verificados a WikiDex.

Proyecto universitario en equipo (Universidad Santo Tomás, USTA). Consume la API REST de [`pokedex-backend`](https://github.com/LoadingCCat/pokedex-backend). La versión publicada está conectada a la API de producción en Render (base de datos en Neon); sin `API_URL`, el sitio usa datos mock con la misma forma que la API.

**Publicado en Vercel:** <https://pokedex-frontend-seven.vercel.app/> (cada push a `master` vuelve a desplegar). Production usa la API de producción, <https://pokedex-backend-5bcq.onrender.com>, y Preview la de desarrollo, <https://pokedex-backend-dev.onrender.com> (`API_URL`). El plan gratuito de Render se duerme tras 15 minutos: la primera visita puede tardar hasta 2–3 minutos. El panel de administración (`/login`, `/admin`) y la identificación por foto funcionan en producción. Paso a paso y variables en [`pokedex-backend/docs/despliegue.md`](https://github.com/LoadingCCat/pokedex-backend/blob/main/docs/despliegue.md). El CI de GitHub Actions corre lint, pruebas y build en cada push a `master`.

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Vitest · sharp (solo para preparar imágenes)

## Instalación

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>. No hace falta el backend: por defecto los datos salen de `datos/mock/`.

### Con la API real

Con el backend arrancado en `http://localhost:8080` (ver su README), define `API_URL` antes de arrancar:

```powershell
$env:API_URL = "http://localhost:8080/api"; npm run dev
```

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en el puerto 3000 |
| `npm run build` | Build de producción (genera las 151 fichas de Kanto; las demás, en la primera visita; funciona sin backend y con `API_URL`, sin llamar a la API) |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm run test` | Pruebas con Vitest: el mock cumple los criterios de las specs y los parámetros de la URL se leen bien |
| `node scripts/generar-mock.mjs` | Regenera `datos/mock/` desde el backend local (debe estar arrancado con los datos importados) |
| `node scripts/imagenes.mjs` | Descarga de WikiDex los mapas y capturas elegidos en `scripts/imagenes-fuentes.json`, los convierte a WebP en `public/imagenes/` y escribe `datos/imagenes.json` |
| `node scripts/enlaces-wikidex.mjs` | Verifica en WikiDex un artículo por Pokémon, lugar y región y escribe `datos/enlaces-wikidex.json` (exacto o búsqueda) |
| `node scripts/nombres-lugares-es.mjs` | Escribe los nombres en español de los lugares para el backend (`../pokedex-backend/src/main/resources/lugares-es.properties`) a partir de los enlaces verificados |

Los tres últimos hacen peticiones a WikiDex (como mucho una por segundo) o leen sus resultados: solo hace falta volver a ejecutarlos si cambia la lista de imágenes o de lugares. Sus salidas están en el repositorio, así que `npm run build` no los necesita.

Con `API_URL` definida, `npm run test` también compara el mock con la API real (`lib/api/contrato.test.ts`).

## Pantallas

| Ruta | Pantalla |
|---|---|
| `/` | Catálogo: búsqueda sin tildes, filtros (generación, tipo, región, obtención), orden y paginación en la URL |
| `/pokemon/[id]` | Ficha: datos, estadísticas base, dónde se obtiene, cadena evolutiva y movimientos que aprende |
| `/movimientos` | Movimientos: búsqueda y vistas por categoría o competitivos |
| `/regiones` | Las 9 regiones de origen |
| `/regiones/[region]` | Lugares de una región |
| `/rutas/[id]` | Un lugar: su captura del juego, los Pokémon que aparecen en él y su enlace a WikiDex |
| `/creditos` | De dónde salen los datos, las imágenes y los enlaces, con cada mapa y captura y su archivo original |

## Imágenes y enlaces externos

- **Sprites, ilustraciones (normal y shiny) y gritos:** se cargan desde los repositorios `PokeAPI/sprites` y `PokeAPI/cries` de GitHub; sus URL se arman con el número del Pokémon en `lib/recursos-pokemon.ts`.
- **Mapas y capturas del juego:** de [WikiDex](https://www.wikidex.net), descargados a `public/imagenes/` en WebP (`regiones/`, `lugares/` y `pokemon/`, unos 22 MB; cada imagen solo se descarga en su página) y servidos con `next/image`. El pixel art se guarda sin pérdida y se muestra a escala entera, pixelado. Cada imagen tiene su origen en `datos/imagenes.json` y aparece en `/creditos`.
- **Enlaces a WikiDex:** solo a artículos verificados; si no hay artículo, a su búsqueda ("Buscar ↗"). Nunca a una página inexistente.
- Uso informativo y sin fines de lucro. Las reglas de uso están en [`identidad-visual.md`](docs/diseno/identidad-visual.md) ("Toques de nostalgia").

## Documentación

El proyecto sigue Spec-Driven Development: primero el documento, después el código.

| Documento | Contenido |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Contexto, reglas de trabajo y convenciones (para el equipo y el agente) |
| [`docs/pantallas.md`](docs/pantallas.md) | Spec de cada pantalla con sus criterios de aceptación |
| [`docs/diseno/identidad-visual.md`](docs/diseno/identidad-visual.md) | Identidad visual «Laboratorio»: tono, paleta AA, tipografía, componentes y reglas de los toques de nostalgia |
| [`docs/diseno/referencias/`](docs/diseno/referencias/README.md) | Capturas de referencia (P1, P2, P4 y P5 a 390 y 1280 px) y su evaluación con la rúbrica |
| [`.claude/skills/ui-componentes`](.claude/skills/ui-componentes/SKILL.md) | Cómo se crea un componente o una pantalla |
| [`../pokedex-backend/docs/`](../pokedex-backend/docs) | Producto, specs F1–F10, contrato de la API, tareas y decisiones (compartidos con el backend) |

## Estructura

```
app/                      páginas (rutas en español), /creditos, error.tsx y not-found.tsx
components/ui/            piezas genéricas (Boton, Tarjeta, Chip, Paginacion, EnlaceExterno, FiguraCreditada…)
components/pokemon/       piezas del dominio (TarjetaPokemon, CadenaEvolutiva, TablaMovimientos, DiscoMovimiento…)
lib/api/                  único acceso a datos: mock o API real según API_URL
lib/                      formato, tipos, parámetros de la URL, recursos de la PokeAPI, imágenes, enlaces y créditos
datos/mock/               volcado JSON del backend (los 1025 Pokémon, movimientos, rutas, evoluciones)
datos/imagenes.json       mapas, capturas de lugares y de Pokémon: archivo, tamaño, alt, pie y origen (lo genera imagenes.mjs)
datos/enlaces-wikidex.json  un enlace a WikiDex por Pokémon, lugar y región, exacto o de búsqueda
public/imagenes/          los WebP de regiones/, lugares/ y pokemon/
scripts/                  generar-mock, imagenes (+ imagenes-fuentes.json), enlaces-wikidex, nombres-lugares-es
```

Datos de la [PokeAPI](https://pokeapi.co); mapas y capturas de [WikiDex](https://www.wikidex.net). Pokémon © Nintendo / Game Freak / Creatures. Pokedex+ es un proyecto universitario sin fines de lucro, sin relación con esas empresas (ver `/creditos`).
