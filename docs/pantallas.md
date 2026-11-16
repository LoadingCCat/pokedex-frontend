# Pantallas · Pokedex+ Frontend

Una spec por pantalla, con criterios de aceptación. Cada pantalla usa las funcionalidades del backend (F1–F10, en `../pokedex-backend/docs/specs/`) a través de `lib/api`. El aspecto sigue `docs/diseno/identidad-visual.md`.

**Alcance:** solo consulta. Fuera de U3: crear, editar o borrar movimientos y rutas (los `POST`, `PUT` y `DELETE` de la API), la importación (uso interno), el modo oscuro, los favoritos y las cuentas.

## Comunes a todas las pantallas

- Cabecera con el nombre "Pokedex+" (enlace a `/`) y la navegación **Catálogo · Movimientos · Regiones**. El enlace activo se marca con algo más que color (subrayado o peso).
- Todo lo que carga datos tiene estado de **cargando** (esqueleto), **vacío** y **error**, con los textos del tono de voz.
- El nombre que se muestra es `nombreEs` o, si es `null`, el slug formateado (`thunder-punch` → "Thunder Punch").
- Las listas paginadas muestran "Página N de M" y botones Anterior/Siguiente, deshabilitados en los extremos.
- El estado de filtros, orden y página vive en la URL: recargar o compartir el enlace muestra lo mismo.
- Funciona a 375 px sin scroll horizontal y se puede recorrer solo con el teclado, con el foco visible.
- Cada página tiene su título (`<title>`): "Catálogo · Pokedex+", "Pikachu · Pokedex+"…

---

## P1 · Catálogo — `/`
**Usa:** F1, F2, F6, F8, F9 · `listarPokemons`, `listarTipos`, `listarRegiones`

**Historia:** como fan de Pokémon, quiero recorrer, buscar y filtrar los 1025 Pokémon para encontrar rápido el que busco.

**Comportamiento**
1. Cuadrícula de tarjetas: imagen, `#025`, nombre y tipos. Cada tarjeta enlaza a su ficha.
2. Buscador por nombre y filtros: generación (1–9), tipo (de `/tipos`, con la etiqueta en español), región (de `/rutas/regiones`) y forma de obtención (los 9 valores). Se combinan con Y.
3. Orden: número (por defecto), nombre, y cada estadística base de mayor a menor. `totalEstadisticas` no se ofrece: lo calcula el servidor y no se puede ordenar por él.
4. 20 por página. Cambiar un filtro o el orden vuelve a la página 1.
5. Los filtros activos se ven como chips con "×" para quitarlos, y hay un botón "Quitar filtros".
6. Parámetros de la URL: `nombre`, `generacion`, `tipo`, `region`, `obtencion`, `sort`, `page` (los mismos nombres que la API). En la URL `page` empieza en 1 (`page=2` es la segunda página), `region` va en minúsculas y `obtencion` sin tildes y con guiones (`fosil`, `sin-datos`). Se leen y validan en `lib/parametros-catalogo.ts`.
7. Una página fuera de rango (`?page=99`) muestra "La página 99 no existe" con un enlace a la página 1.

**Criterios de aceptación**
- [x] `/` muestra 20 Pokémon empezando por Bulbasaur (#001) y "Página 1 de 52".
- [x] Buscar `pikachú` (con tilde) muestra a Pikachu; buscar `PIKA` también.
- [x] `/?tipo=fire&generacion=1` muestra solo Pokémon de tipo fuego de la generación 1, con el mismo total que `GET /api/pokemons?tipo=fire&generacion=1` (12).
- [x] Ordenar por velocidad muestra primero al Pokémon más rápido del resultado.
- [x] Un filtro sin resultados muestra el estado vacío con la sugerencia de quitar un filtro.
- [x] Recargar `/?region=kanto&page=2` muestra la misma página con el filtro de Kanto marcado.
- [x] Un valor inválido en la URL (`?generacion=12`) no rompe la página: se ignora o se muestra el estado vacío.

## P2 · Ficha — `/pokemon/[id]`
**Usa:** F1, F4, F5, F6, F7 · `obtenerPokemon`, `evolucionesDe`, `movimientosDePokemon`

**Historia:** como fan de Pokémon, quiero ver en una sola página todo lo de un Pokémon: datos, estadísticas, dónde y cómo se obtiene, evoluciones y movimientos.

**Comportamiento**
1. Cabecera: imagen grande, `#id`, nombre, tipos, generación y región de origen.
2. Descripción, altura (m) y peso (kg).
3. Estadísticas base: las 6 en barras horizontales (escala 0–255) con su valor, y el total aparte.
4. "Dónde se obtiene": `tipoObtencion` como etiqueta, `formaObtencion` como texto y la lista de rutas agrupadas por región, enlazadas a P5. Si no hay rutas: "Este Pokémon no aparece en estado salvaje." (salvo que `formaObtencion` ya lo diga).
5. "Cadena evolutiva": el árbol completo desde la etapa base, con la condición en cada paso. El Pokémon actual se resalta y los demás nodos enlazan a su ficha. Un nodo sin datos importados (`nombreEs` e `imagenUrl` en `null`) muestra una silueta y el slug formateado.
6. "Movimientos que aprende (N)": tabla (nombre, categoría, potencia, competitivo) en una sección desplegable (`<details>`, cerrada al cargar), ordenada por el nombre en español que se muestra.
7. Enlaces "← #024" y "#026 →" a los Pokémon vecinos (sin "anterior" en el #001 ni "siguiente" en el #1025).
8. Un id inexistente o no numérico muestra la página 404 propia, con un enlace al catálogo. Las 1025 fichas se generan al compilar; un id inválido llega después de empezar el streaming, así que responde 200 con `noindex` (lo hace Next.js) y la página 404.

**Criterios de aceptación**
- [x] `/pokemon/25` muestra a Pikachu: tipo Eléctrico, Kanto, PS 35 … Velocidad 90 y total 320.
- [x] `/pokemon/1` muestra la cadena Bulbasaur → Ivysaur ("Nivel 16") → Venusaur ("Nivel 32").
- [x] `/pokemon/133` muestra a Eevee con sus 8 evoluciones en ramas, ordenadas por número.
- [x] `/pokemon/128` (Tauros) muestra una sola etapa, sin flechas.
- [x] Un Pokémon sin rutas (Meganium, `/pokemon/154`) muestra su `formaObtencion` y que no aparece en estado salvaje. (Mew sí tiene una ruta en la PokeAPI: Faraway Island.)
- [x] La tabla de movimientos de `/pokemon/25` tiene tantas filas como `GET /api/pokemons/25/movimientos` (109), ordenadas por nombre.
- [x] `/pokemon/99999` y `/pokemon/abc` muestran la página 404 propia.

## P3 · Movimientos — `/movimientos`
**Usa:** F4, F6, F9 · `listarMovimientos`

**Historia:** como fan de Pokémon, quiero buscar movimientos y filtrar por categoría o por los competitivos para conocer las opciones de combate.

**Comportamiento**
1. Tabla paginada (20 por página, ordenada por el nombre en español: `sort=nombreEs`): nombre, categoría, potencia y competitivo.
2. Buscador por nombre (sin tildes, en `nombre` y `nombreEs`) y un selector de vista: Todos, Físico, Especial, Estado o Competitivos (potencia > 80).
3. La API tiene un endpoint por cada caso y no los combina. Por eso, al escribir un nombre, el selector vuelve a "Todos", y al elegir otra vista se borra el nombre.
4. Parámetros de la URL: `nombre` o `vista` (`fisico`, `especial`, `estado`, `competitivos`), y `page`.

**Criterios de aceptación**
- [x] `/movimientos` muestra 20 movimientos ordenados por nombre y el total de páginas (797 movimientos, 40 páginas).
- [x] Buscar `puno` encuentra "Puño Trueno"; buscar `psiquico` encuentra "Psíquico".
- [x] Filtrar por "Especial" muestra solo movimientos de esa categoría.
- [x] La vista "Competitivos" muestra solo movimientos con potencia mayor a 80.
- [x] La categoría y el "competitivo" se leen como texto, no solo por color.

## P4 · Regiones — `/regiones` y `/regiones/[region]`
**Usa:** F2, F5 · `listarRegiones`, `rutasDeRegion`

**Historia:** como fan de Pokémon, quiero explorar las regiones y sus lugares para saber qué hay en cada una.

**Comportamiento**
1. `/regiones`: las 9 regiones en orden de generación, con su número de lugares, cada una enlazada a su página.
2. `/regiones/[region]`: las rutas de la región, paginadas (24 por página, para llenar la cuadrícula de 2 y 3 columnas; por nombre), cada una enlazada a P5. También un enlace "Ver Pokémon de {región}" a P1 con `?region=`.
3. Una región sin lugares (Paldea) explica que la PokeAPI no los tiene y remite a «Dónde se obtiene» de cada ficha.
4. Una región que no existe muestra la página 404 propia.

**Criterios de aceptación**
- [x] `/regiones` muestra las 9 regiones, de Kanto a Paldea.
- [x] `/regiones/kanto` muestra las rutas de Kanto paginadas, con el mismo total que `GET /api/rutas/region/kanto` (88, 4 páginas).
- [x] "Ver Pokémon de Kanto" abre el catálogo con el filtro de Kanto aplicado.
- [x] `/regiones/narnia` muestra la página 404 propia.

## P5 · Ruta — `/rutas/[id]`
**Usa:** F2, F5 · `obtenerRuta`, `pokemonsDeRuta`

**Historia:** como fan de Pokémon, quiero ver qué Pokémon aparecen en un lugar para saber dónde capturarlos.

**Comportamiento**
1. Nombre, región (enlazada a P4) y descripción de la ruta. Hay rutas de regiones que no son de origen (Orre, de los juegos de GameCube): su región se muestra sin enlace.
2. Cuadrícula paginada de los Pokémon que aparecen en ella (20 por página), con las mismas tarjetas de P1.
3. Un id inexistente muestra la página 404 propia.

**Criterios de aceptación**
- [x] La ruta "Viridian Forest" (Kanto) muestra a Pikachu entre sus Pokémon. Muchas rutas conservan el nombre en inglés porque la PokeAPI no tiene el español; se muestran tal cual.
- [x] Desde la ficha de Pikachu (P2), el enlace de una ruta lleva a esta pantalla y Pikachu aparece en ella.
- [x] `/rutas/99999` muestra la página 404 propia.
