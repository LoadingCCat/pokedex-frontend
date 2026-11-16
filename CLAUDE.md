@AGENTS.md

# CLAUDE.md — Pokedex+ Frontend

Frontend de la Pokédex+ (proyecto universitario en equipo, USTA): una Pokédex web en español con los 1025 Pokémon de las 9 generaciones. Consume la API REST del backend (`../pokedex-backend`). **Solo consulta:** no hay pantallas para crear, editar ni borrar.

- Next.js 16.4 (App Router, `cacheComponents` y `partialPrefetching` activos) · React 19 · TypeScript · Tailwind CSS 4
- Publicado en Vercel con datos mock con la misma forma que la API. El backend corre solo en `localhost` hasta la U6.

## Documentación (léela antes de cualquier cambio)

El proyecto sigue Spec-Driven Development (SDD): primero el documento, después el código.

- Pantallas y criterios de aceptación: `docs/pantallas.md`
- Identidad visual (colores, tipografía, tono, componentes): `docs/diseno/identidad-visual.md`
- Procedimiento para crear componentes y pantallas: skill `ui-componentes` (`.claude/skills/`)
- Producto, funcionalidades F1–F10 y contrato de la API (en el backend):
  - `../pokedex-backend/docs/producto.md`
  - `../pokedex-backend/docs/specs/`
  - `../pokedex-backend/docs/contratos/api.md`
- Tareas, decisiones y bitácora (compartidas con el backend):
  - `../pokedex-backend/docs/tareas.md` (sección "Front (U3)")
  - `../pokedex-backend/docs/decisiones.md`
  - `../pokedex-backend/BITACORA_IA.md`
- Next.js 16 cambia APIs: lee la guía en `node_modules/next/dist/docs/01-app/` antes de usar una.

## Reglas de trabajo

- Implementa **una** tarea FE.n de `tareas.md` a la vez y márcala `[x]` al terminar.
- No agregues pantallas ni funciones sin spec en `docs/pantallas.md`. Si el alcance cambia, propón primero el cambio en los docs y espera aprobación.
- Antes de un cambio importante, muestra un plan y espera aprobación.
- No toques archivos que la tarea no requiera. No agregues dependencias sin proponerlo.
- Al terminar: `npm run lint`, `npm run build`, pruebas, revisión en el navegador (375 y 1280 px, solo con el teclado) y explica cómo probarlo.
- Registra las decisiones técnicas en `decisiones.md` y los errores importantes del agente en `BITACORA_IA.md`.
- No hagas `git push` ni despliegues sin preguntar.

## Comandos (desde esta carpeta)

```powershell
npm run dev        # http://localhost:3000
npm run build      # build de producción (debe funcionar sin backend)
npm run lint
npm run test       # vitest (lib/api y helpers), desde FE.6
node scripts/generar-mock.mjs   # regenera datos/mock/ desde el backend local (debe estar arrancado)
```

- El servidor de desarrollo se arranca en la terminal de la app, no desde el Bash del agente.

## Datos

- Las pantallas y componentes **nunca** llaman a `fetch`, al backend ni a la PokeAPI: piden todo a `lib/api`.
- `lib/api` lee el mock (`datos/mock/*.json`) por defecto. Si existe la variable `API_URL` (p. ej. `http://localhost:8080/api`), llama a la API real.
- El mock reproduce el contrato de `api.md`:
  - paginación `{ content, page }` con máximo 200 y orden por defecto
  - filtros combinados con Y, sin importar mayúsculas ni tildes
  - `region` = nativos o que aparecen en sus rutas
- Los tipos de TypeScript de las respuestas están en `lib/api/tipos.ts` y copian `api.md`. Si el contrato cambia, se actualizan los dos.
- `http.ts` solo puede pedir lo que la API ofrece. Por eso `mock.ts` no debe combinar más de lo que permite el contrato (por ejemplo, en movimientos: o búsqueda, o categoría, o competitivos).
- `nombre` es el slug en inglés (identificador). Para mostrar se usa `nombreEs` y, si viene en `null`, el slug formateado (`lib/formato.ts`).

## Estructura

```
app/                  # páginas y layouts (rutas en español: /pokemon/[id], /movimientos, /regiones…)
components/ui/        # piezas genéricas (Boton, Tarjeta, Chip, Paginacion, EstadoVacio, Esqueleto)
components/pokemon/   # piezas del dominio (InsigniaTipo, TarjetaPokemon, CadenaEvolutiva…)
lib/api/              # único acceso a datos: tipos.ts, index.ts, mock.ts, http.ts
lib/formato.ts        # #025, nombre a mostrar, m / kg
lib/tipos-pokemon.ts  # los 18 tipos: etiqueta en español y colores AA
datos/mock/           # volcado JSON del backend
scripts/              # generar-mock.mjs
docs/                 # pantallas.md, diseno/
```

## Convenciones de código

- Componentes, props, variables, rutas y textos **en español**. Un componente por archivo, en PascalCase.
- Componentes de servidor por defecto; `'use client'` solo para lo interactivo, y lo más pequeño posible.
- Con `cacheComponents`, lo que lea `searchParams` o `params` va dentro de `<Suspense>` con un esqueleto como `fallback`.
- Estilos solo con los tokens de `app/globals.css`, sin HEX en los componentes.
- Commits con mensajes cortos en español.
