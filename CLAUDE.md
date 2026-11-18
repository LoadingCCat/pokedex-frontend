@AGENTS.md

# CLAUDE.md — Pokedex+ Frontend

Frontend de la Pokédex+ (proyecto universitario en equipo, USTA): una Pokédex web en español con los 1025 Pokémon de las 9 generaciones. Consume la API REST del backend (`../pokedex-backend`). Es de consulta, más un panel de administración (F15: `/login` y `/admin`) que solo funciona con la API local; sin `API_URL` muestra un aviso.

- Next.js 16.4 (App Router, `cacheComponents` y `partialPrefetching` activos) · React 19 · TypeScript · Tailwind CSS 4 · Vitest
- `sharp` (devDependency) solo lo usa `scripts/imagenes.mjs` para convertir las imágenes a WebP; la app no lo importa.
- Publicado en Vercel con datos mock con la misma forma que la API. El backend corre solo en `localhost` hasta la U6.

## Documentación (léela antes de cualquier cambio)

El proyecto sigue Spec-Driven Development (SDD): primero el documento, después el código.

- Pantallas y criterios de aceptación: `docs/pantallas.md`
- Identidad visual (colores, tipografía, tono, componentes y "Toques de nostalgia"): `docs/diseno/identidad-visual.md`
- Capturas de referencia y evaluación con la rúbrica: `docs/diseno/referencias/README.md`
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
npm run test       # vitest: el mock cumple F1–F9 (lib/api/mock.test.ts) y las funciones de lib/ (parámetros, imágenes, enlaces, créditos)
$env:API_URL = "http://localhost:8080/api"; npm run test   # además compara el mock con la API real (contrato.test.ts)
node scripts/generar-mock.mjs        # regenera datos/mock/ desde el backend local (debe estar arrancado)
node scripts/imagenes.mjs           # descarga de WikiDex lo de scripts/imagenes-fuentes.json → public/imagenes/*.webp y datos/imagenes.json
node scripts/enlaces-wikidex.mjs    # verifica los artículos de WikiDex → datos/enlaces-wikidex.json
node scripts/nombres-lugares-es.mjs # nombres en español de los lugares → ../pokedex-backend/src/main/resources/lugares-es.properties
```

- Los tres scripts de WikiDex respetan la wiki: lotes de 50 títulos, como mucho una petición por segundo y un User-Agent que dice quiénes somos. Si responde otra cosa que JSON (un desafío anti-bots), paran: no se intenta saltar. Sus salidas se suben al repositorio; el build no los ejecuta.

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

## Toques de nostalgia (FE.14–FE.32)

Reglas completas en `docs/diseno/identidad-visual.md`. **El dato manda y la nostalgia lo acompaña.** Al tocar cualquiera de estas piezas:

1. **Un solo efecto destacado por pantalla:** el sprite animado al pasar el ratón por una tarjeta (P1 y tarjetas de P5) y las barras de estadísticas en la ficha (P2). P3, P4, P5 y Créditos no tienen ninguno: mapas, capturas, discos de MT y el sprite clásico son contenido, no efecto. Los controles que activa el usuario (Escuchar, Shiny) no cuentan.
2. **Menos de 300 ms**, con `ease-out`, y nada en bucle salvo el GIF del sprite.
3. **Todo se apaga con `prefers-reduced-motion`**: sin sprite animado, barras ya llenas, sin transiciones.
4. **Nada de 3D real** (ni Three.js, ni WebGL, ni inclinaciones 3D con CSS) y nada de disfrazar la interfaz: sin tipografías pixeladas, marcos de Game Boy ni colores "retro".
5. **Las imágenes nunca tapan el dato:** nombre, número, tipos y estadísticas siempre visibles; nunca texto sobre una imagen. Mapas y capturas van en su propio bloque (`FiguraCreditada`), con proporción fija, `alt` y crédito corto debajo.
6. **El sonido solo suena al pulsar "Escuchar"**, al 50 %.
7. **Pixel art nítido:** `image-rendering: pixelated`, escala entera (2× el sprite clásico y las capturas de hasta 256 px) y `next/image` con `unoptimized`, para que no se reescale.
8. **Si falta el recurso, no queda hueco:** el control o el bloque no aparece. Nunca una imagen rota.

**Imágenes de terceros:**
- Los sprites, ilustraciones y gritos se sirven desde los repos de la PokeAPI (`lib/recursos-pokemon.ts`).
- Los mapas y capturas de WikiDex se **descargan** a `public/imagenes/` en WebP (nunca se enlazan desde otra web). Nunca se agrega una a mano: se elige en `scripts/imagenes-fuentes.json` y se regenera con `imagenes.mjs`, que registra su origen en `datos/imagenes.json`; `/creditos` la lista sola.
- El pixel art se guarda sin pérdida solo si el original es PNG (un JPG sin pérdida se inflaría).
- Fuera: el logo de Pokémon y su tipografía oficial.

**Enlaces a WikiDex:** salen de `datos/enlaces-wikidex.json` por `lib/enlaces-wikidex.ts` y se pintan con `EnlaceExterno` (otra pestaña, `rel="noopener noreferrer"`, aviso para el lector de pantalla). "Exacto" → "Ver en WikiDex ↗"; si no hay artículo verificado → su búsqueda ("Buscar en WikiDex ↗"; en la lista de lugares, la versión corta "WikiDex ↗" / "Buscar ↗"). Nunca un enlace a un artículo sin verificar.

## Estructura

```
app/                      # páginas y layouts (rutas en español: /pokemon/[id], /movimientos, /regiones, /rutas/[id], /creditos), error.tsx y not-found.tsx
components/ui/            # piezas genéricas (Boton, Tarjeta, Chip, Paginacion, EstadoVacio, Esqueleto, EnlaceExterno, FiguraCreditada)
components/admin/         # panel (F15): FormularioLogin, BotonCerrarSesion, AvisoSinApi, Formulario{Pokemon,Movimiento,Ruta},
                          #   BotonEliminar (diálogo), useEnvioFormulario, CampoSelect, CampoArea, FilaAdmin, AvisoGuardado
components/pokemon/       # piezas del dominio (InsigniaTipo, TarjetaPokemon, SpriteAnimado, IlustracionFicha, BotonGrito,
                          #   EstadisticasBase, CapturasDelJuego, CadenaEvolutiva, TablaMovimientos, DiscoMovimiento…)
lib/api/                  # único acceso a datos: tipos.ts, index.ts, mock.ts, http.ts
lib/sesion.ts             # F15: lee y guarda la cookie httpOnly con el token (solo en el servidor)
lib/sesion-comun.ts       # F15: nombre de la cookie, adminDisponible(), destinoSeguro(), datos del token
app/admin/acciones.ts     # F15: server actions del panel (token de la cookie → Authorization; 401 → /login)
lib/api/admin.ts          # F15: escrituras con token y GET /movimientos/{id} (solo con API_URL)
lib/validacion-admin.ts   # F15: validación de los formularios del panel (mismas reglas que el backend)
lib/avisos-admin.ts       # F15: ?aviso=creado|guardado|eliminado del listado
proxy.ts                  # F15: /admin sin cookie → /login?volver=… (en Next 16, `middleware` se llama `proxy`)
lib/formato.ts            # #025, nombre a mostrar, m / kg
lib/tipos-pokemon.ts      # los 18 tipos: etiqueta en español y colores AA
lib/recursos-pokemon.ts   # URL de sprite animado, sprite clásico, ilustración shiny y grito
lib/imagenes.ts           # lee datos/imagenes.json (mapas, lugares, capturas de Pokémon)
lib/capturas-ficha.ts     # qué capturas muestra la ficha: las propias o hasta 2 de lugares
lib/enlaces-wikidex.ts    # enlace exacto o de búsqueda por Pokémon, lugar y región
lib/creditos.ts           # filas de /creditos a partir de datos/imagenes.json
lib/efectividad-tipos.ts  # F19: tabla fija de efectividad (18 × 18) y debilidades de la ficha
lib/naturalezas.ts        # F19: las 25 naturalezas de datos/naturalezas.json (fijo, sin backend)
datos/mock/               # volcado JSON del backend
datos/imagenes.json       # generado por scripts/imagenes.mjs: archivo, tamaño, alt, pie, juego y origen de cada imagen
datos/enlaces-wikidex.json  # generado por scripts/enlaces-wikidex.mjs
public/imagenes/          # WebP de regiones/, lugares/ (por idPokeapi) y pokemon/ (idPokedex-n)
scripts/                  # generar-mock, imagenes (+ imagenes-fuentes.json, la lista elegida a mano), enlaces-wikidex, nombres-lugares-es
docs/                     # pantallas.md, diseno/ (identidad-visual.md, referencias/)
```

## Convenciones de código

- Componentes, props, variables, rutas y textos **en español**. Un componente por archivo, en PascalCase.
- Componentes de servidor por defecto; `'use client'` solo para lo interactivo, y lo más pequeño posible.
- Con `cacheComponents`, lo que lea `searchParams` o `params` va dentro de `<Suspense>` con un esqueleto como `fallback`.
- Estilos solo con los tokens de `app/globals.css`, sin HEX en los componentes.
- Commits con mensajes cortos en español.
