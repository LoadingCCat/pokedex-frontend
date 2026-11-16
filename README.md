# Pokedex+ · Frontend

Pokédex web en español con los 1025 Pokémon de las 9 generaciones: catálogo con búsqueda y filtros combinados, ficha con estadísticas, dónde y cómo se obtiene cada Pokémon, cadena evolutiva y movimientos, y las regiones con sus lugares.

Proyecto universitario en equipo (Universidad Santo Tomás, USTA). Consume la API REST de [`pokedex-backend`](https://github.com/LoadingCCat/pokedex-backend). La versión publicada usa datos mock con la misma forma que la API.

**Publicado en Vercel:** <https://pokedex-frontend-seven.vercel.app/> (cada push a `master` vuelve a desplegar).

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Vitest

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
| `npm run build` | Build de producción (genera las 1025 fichas; funciona sin backend) |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm run test` | Pruebas con Vitest: el mock cumple los criterios de las specs y los parámetros de la URL se leen bien |
| `node scripts/generar-mock.mjs` | Regenera `datos/mock/` desde el backend local (debe estar arrancado con los datos importados) |

Con `API_URL` definida, `npm run test` también compara el mock con la API real (`lib/api/contrato.test.ts`).

## Pantallas

| Ruta | Pantalla |
|---|---|
| `/` | Catálogo: búsqueda sin tildes, filtros (generación, tipo, región, obtención), orden y paginación en la URL |
| `/pokemon/[id]` | Ficha: datos, estadísticas base, dónde se obtiene, cadena evolutiva y movimientos que aprende |
| `/movimientos` | Movimientos: búsqueda y vistas por categoría o competitivos |
| `/regiones` | Las 9 regiones de origen |
| `/regiones/[region]` | Lugares de una región |
| `/rutas/[id]` | Pokémon que aparecen en un lugar |

## Documentación

El proyecto sigue Spec-Driven Development: primero el documento, después el código.

| Documento | Contenido |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | Contexto, reglas de trabajo y convenciones (para el equipo y el agente) |
| [`docs/pantallas.md`](docs/pantallas.md) | Spec de cada pantalla con sus criterios de aceptación |
| [`docs/diseno/identidad-visual.md`](docs/diseno/identidad-visual.md) | Identidad visual «Laboratorio»: tono, paleta AA, tipografía y componentes |
| [`.claude/skills/ui-componentes`](.claude/skills/ui-componentes/SKILL.md) | Cómo se crea un componente o una pantalla |
| [`../pokedex-backend/docs/`](../pokedex-backend/docs) | Producto, specs F1–F10, contrato de la API, tareas y decisiones (compartidos con el backend) |

## Estructura

```
app/                  páginas (rutas en español), error.tsx y not-found.tsx
components/ui/        piezas genéricas (Boton, Tarjeta, Chip, Paginacion, EstadoVacio…)
components/pokemon/   piezas del dominio (TarjetaPokemon, CadenaEvolutiva, TablaMovimientos…)
lib/api/              único acceso a datos: mock o API real según API_URL
lib/                  formato, colores de los tipos y lectura de parámetros de la URL
datos/mock/           volcado JSON del backend
scripts/              generar-mock.mjs
```

Datos de la [PokeAPI](https://pokeapi.co). Pokémon y sus nombres son marcas de sus respectivos dueños.
