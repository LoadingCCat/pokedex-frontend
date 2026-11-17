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
- El pie enlaza a **Créditos** (P6).
- Los "toques de nostalgia", las imágenes de lugares y regiones y los enlaces a WikiDex se describen en "Ampliación: nostalgia, imágenes y WikiDex", al final, y siguen las reglas de `identidad-visual.md`.

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
- [x] La ruta "Bosque Verde" (Kanto; "Viridian Forest" antes de B.28) muestra a Pikachu entre sus Pokémon. Desde B.28 los lugares van en español (de la PokeAPI o del título verificado de WikiDex); unos 90 sin artículo siguen en inglés.
- [x] Desde la ficha de Pikachu (P2), el enlace de una ruta lleva a esta pantalla y Pikachu aparece en ella.
- [x] `/rutas/99999` muestra la página 404 propia.

---

## Ampliación: nostalgia, imágenes y WikiDex (FE.14–FE.22)

Se suma a P1–P5 sin cambiar lo que ya hacen. Reglas: "Toques de nostalgia" en `docs/diseno/identidad-visual.md` (un efecto destacado por pantalla, menos de 300 ms, nada con `prefers-reduced-motion`, las imágenes nunca tapan el dato).

**Datos nuevos (sin tocar el contrato de la API):**
- Sprite animado, ilustración shiny y grito: sus URL se arman con el `idPokedex` en `lib/recursos-pokemon.ts` (rutas fijas de los repos de la PokeAPI; ver la tabla "Recursos" de la identidad).
- Mapas y capturas: `datos/imagenes.json` asocia cada imagen al nombre de la región o al `idPokeapi` del lugar, con su archivo en `public/imagenes/`, su tamaño, su texto alternativo, la fuente (WikiDex), el archivo original y su URL de origen. Lo genera `scripts/imagenes.mjs` a partir de la lista elegida en `scripts/imagenes-fuentes.json`.
- Criterio de calidad de las capturas de lugares: nada de GIF ni minimapas; ancho de 700 px o más, o capturas de *Pokémon: Let's Go* de 396 × 228 (nítidas, y se muestran como mucho a ese tamaño). Primera tanda: 28 de los 88 lugares de Kanto.
- Capturas del juego en la ficha (Fase 5): `datos/imagenes.json` gana un apartado `pokemon` (por `idPokedex`, una lista de hasta 3 capturas, cada una con su pie de foto). Se eligen a mano en `scripts/imagenes-fuentes.json`, a partir de las imágenes de WikiDex que están a la vez en la categoría del Pokémon ("Categoría:Mew") y en una "Capturas de <juego>". Solo juegos de la serie principal y solo cómo se consigue: el encuentro, el lugar o el combate (nada de Smash Bros., Ranger, Mundo misterioso ni demostraciones de movimientos). El pie de foto lo escribimos nosotros en español ("Mew aparece en la Isla Suprema").
  - **Calidad:** a diferencia de los lugares, se aceptan capturas de pixel art de GB, GBA y DS (160–256 px de ancho), que se muestran a 2× con escalado pixelado (`image-rendering: pixelated`), y de 3DS (400 × 240) a su tamaño. Se convierten a WebP sin pérdida.
  - Primera tanda: los legendarios y singulares de la primera generación (Articuno, Zapdos, Moltres, Mewtwo y Mew); después, el resto de legendarios y singulares (94 en total).
  - Resultado (FE.24): 87 capturas de 52 de los 94. Los otros 42 no tienen en WikiDex capturas de cómo se consiguen (solo demostraciones de movimientos, escaneos de revistas o eventos), así que su ficha no muestra la sección. Se descartaron las capturas con texto en japonés y las escenas de la historia que no muestran cómo se consigue.
- Enlaces a WikiDex: `datos/enlaces-wikidex.json`, generado por `scripts/enlaces-wikidex.mjs`, con un enlace por Pokémon (`idPokedex`), lugar (`idPokeapi`) y región, y si es `exacto` (artículo verificado) o `busqueda`.
  - **Exacto** solo si el artículo existe (siguiendo redirecciones), no es una desambiguación y es del tipo correcto: un Pokémon está en "Lista de Pokémon por número"; un lugar lleva su región en el título ("Ruta 1 (Alola)") o en una categoría ("Ciudades de Kanto"; las Islas Sete, en "Archi7"); una región está en "Regiones".
  - Títulos que se prueban para un lugar: "Ruta N (Región)" y "Ruta N"; su nombre y "Nombre (Región)"; si dan una desambiguación ("Calle Victoria"), su versión con región; y, si el nombre está en inglés, una búsqueda que solo se acepta si el artículo dice "(Ilex Forest en inglés…)".
  - **Búsqueda:** `https://www.wikidex.net/index.php?search=Nombre+Región&fulltext=1` (la página de resultados, que siempre existe). El texto del enlace dice "Buscar en WikiDex ↗" en vez de "Ver en WikiDex ↗".
  - Los lugares creados a mano (`idPokeapi` en `null`) no están en el archivo: su enlace de búsqueda se arma en el momento.
  - Resultado de la primera corrida: Pokémon 1025/1025 exactos; lugares 529 exactos y 91 en búsqueda; regiones 9/9.

### Qué aparece en cada pantalla

| Pantalla | Qué se agrega | Si falta |
|---|---|---|
| P1 Catálogo (y tarjetas de P5) | Al pasar el ratón por una tarjeta, el sprite animado de Negro/Blanco (2×, pixelado) reemplaza a la ilustración con un fundido de 150 ms. Solo con ratón, no en táctil | #650 en adelante, sin ratón o con movimiento reducido: se queda la ilustración |
| P2 Ficha | Bajo la ilustración, botón **Escuchar** (grito) e interruptor **Shiny** (cambia la ilustración y su `alt`). Las barras de estadísticas se llenan en 280 ms la primera vez que se ven. En la cabecera, **Ver en WikiDex ↗** | Navegador sin OGG: no hay botón Escuchar. Sin ilustración shiny: no hay interruptor. Movimiento reducido: barras ya llenas. Sin artículo verificado: el enlace va a la búsqueda de WikiDex |
| P2 Ficha (Fase 5) | Sección **Cómo se consigue en el juego**, a todo el ancho entre "Estadísticas base" / "Dónde se obtiene" y "Cadena evolutiva": hasta 3 capturas, dos por fila en escritorio (a 2× no caben tres) y una columna en móvil, cada una con su pie de foto y el crédito corto. Sin efectos | Pokémon sin capturas elegidas: la sección no aparece |
| P4 `/regiones` | Miniatura del mapa en cada tarjeta de región, encima del nombre | Región sin mapa: la tarjeta queda como ahora |
| P4 `/regiones/[region]` | Mapa grande de la región entre la cabecera y la lista de lugares, con su crédito corto. En cada lugar de la lista, un enlace secundario **WikiDex ↗** | Sin mapa: no hay bloque. Sin artículo verificado: el enlace va a la búsqueda |
| P5 `/rutas/[id]` | Captura del lugar junto a la cabecera (al lado en escritorio, debajo en móvil), con su crédito corto. **Ver en WikiDex ↗** en la cabecera | Sin captura: la cabecera queda como ahora. Lugar creado a mano (`idPokeapi` en `null`): enlace a la búsqueda |
| P2 y P3 · tablas de movimientos (Fase 6) | Delante del nombre de cada movimiento, un **disco de MT** pequeño (SVG propio, 20 px; 16 en móvil) del color de su tipo. Nueva columna **Tipo** con la insignia del tipo. En móvil, las columnas Tipo y Competitivo se ocultan y van en texto pequeño bajo el nombre ("Eléctrico · Competitivo") para que la tabla quepa sin desplazarse. El disco es decorativo: el tipo siempre se lee en texto | Movimiento sin `tipo` (creado a mano o sin reimportar): disco gris y "—" |
| P6 `/creditos` | Página nueva (abajo) | — |

### Criterios de aceptación
- [x] En `/`, al pasar el ratón por Pikachu se ve su sprite animado; por Chespin (#650) se queda la ilustración.
- [x] Con `prefers-reduced-motion: reduce`, no hay sprite animado y las barras de la ficha aparecen llenas.
- [x] En `/pokemon/25`, "Escuchar" reproduce el grito de Pikachu solo al pulsarlo; "Shiny" cambia la ilustración y su `alt`, y se puede volver atrás.
- [x] Los controles nuevos se manejan con el teclado y tienen nombre accesible ("Escuchar el grito de Pikachu", interruptor "Shiny" con su estado).
- [x] `/regiones` y `/regiones/kanto` muestran el mapa de Kanto; una región sin mapa se ve como antes.
- [x] `/rutas/62` (Bosque Verde) muestra su captura si se consiguió; un lugar sin captura se ve como antes.
- [x] Todos los enlaces a WikiDex abren en otra pestaña con `rel="noopener noreferrer"`, el lector de pantalla anuncia que salen del sitio y ninguno lleva a un artículo inexistente.
- [x] Ninguna imagen nueva tapa nombre, número, tipos ni estadísticas, y a 390 px no hay scroll horizontal.
- [x] El build sigue funcionando sin backend y no crece de forma desproporcionada (se compara antes y después).
- [x] Fase 5: `/pokemon/151` (Mew) muestra la sección "Cómo se consigue en el juego" con sus capturas a 2×, nítidas (pixeladas, no borrosas), y cada una con pie de foto y crédito; `/pokemon/25` no tiene la sección.
- [x] Fase 5: a 390 px las capturas caben sin scroll horizontal y no tapan ningún dato; todas tienen `alt` igual a su pie de foto.
- [x] Fase 5: cada captura de la ficha aparece en `/creditos`, en un grupo "Capturas de Pokémon" con enlace a la ficha y a su archivo original.
- [x] Fase 6: en `/pokemon/25`, "Movimientos que aprende" muestra Rayo (`thunderbolt`) con un disco amarillo (eléctrico) y el tipo "Eléctrico" en texto; lo mismo en `/movimientos`.
- [x] Fase 6: a 390 px las tablas de movimientos no tienen scroll horizontal; el lector de pantalla no lee el disco y sí el tipo.
- [x] Fase 6: un movimiento con `tipo` en `null` muestra el disco gris y "—", sin romper la tabla.

## P6 · Créditos — `/creditos`
**Historia:** como evaluador o usuario, quiero saber de dónde salen los datos, las imágenes y los enlaces, y bajo qué condiciones se usan.

**Comportamiento**
1. Enlazada desde el pie de todas las páginas.
2. Secciones, en este orden:
   - **Datos:** la PokeAPI (con enlace), de donde salen todos los datos a través de nuestra API.
   - **Ilustraciones, sprites y gritos:** los repositorios `PokeAPI/sprites` y `PokeAPI/cries` (con enlace), que se cargan desde GitHub.
   - **Mapas y capturas:** generada desde `datos/imagenes.json`. Primero los 9 mapas y después los lugares, agrupados por región. Cada fila: qué muestra (región o lugar, enlazado a su página), el juego, la fuente y un enlace "Archivo original" a la página del archivo en WikiDex. WikiDex no da autor por archivo, así que no hay columna de autor. Debajo, la condición de uso que registra el archivo de datos (uso legítimo, sin fines de lucro).
   - **Enlaces externos:** WikiDex; cómo se verifican los artículos y que lo no verificado lleva a su búsqueda.
   - **Aviso:** "Pokémon © Nintendo / Game Freak / Creatures. Pokedex+ es un proyecto universitario sin fines de lucro, sin relación con esas empresas."
3. Página estática, sin efectos ni imágenes (solo texto y enlaces). Los enlaces que salen del sitio siguen el estilo de "Enlace externo" de la identidad.
4. El pie de todas las páginas cambia "Pokémon y sus nombres son marcas de sus respectivos dueños" por un enlace "Créditos y avisos".

**Criterios de aceptación**
- [x] `/creditos` lista cada mapa y captura usados, con un enlace a su origen; ninguno falta respecto a `datos/imagenes.json`.
- [x] Aparece el aviso de Nintendo / Game Freak / Creatures y el de uso sin fines de lucro.
- [x] El pie de todas las páginas enlaza a `/creditos`.

## Pulido y lugares restantes (FE.26–FE.27)

**FE.26 · Mejoras de la evaluación** (`docs/diseno/referencias/README.md`, puntos 1–5, 7 y 8; el 6 son datos de la PokeAPI y queda en el backend):
1. Ficha: las tarjetas "Estadísticas base" y "Dónde se obtiene" ya no se estiran a la misma altura (`items-start`).
2. Ficha: en la cadena evolutiva, la columna de la condición pasa de 144 a 288 px en tableta y 384 px en escritorio, para que las condiciones largas (Leafeon, Sylveon) no se partan en 6–7 líneas.
3. Catálogo en móvil: solo el buscador queda a la vista; el resto de filtros y el orden van en un desplegable **Filtros (n)**, con `n` = filtros activos, abierto si hay alguno. En escritorio, igual que ahora. La barra fija en escritorio que pedía la identidad se descarta (taparía resultados al desplazarse) y se quita de la identidad.
4. Textos de 12 px de la cadena evolutiva (condiciones y número) pasan a 13–14 px.
5. Enlaces a lugares de "Dónde se obtiene" siempre subrayados (no solo al pasar el ratón).
7. Lista de lugares de una región: el enlace corto dice **WikiDex ↗** si el artículo está verificado y **Buscar ↗** si va a la búsqueda.
8. Mapa de la región: el bloque se ajusta al ancho del mapa, sin bandas grises a los lados.

**FE.27 · Capturas de los lugares de Kanto que faltan.** De los 60 sin captura, 45 tienen artículo verificado en WikiDex y dentro hay capturas del juego; los otros 15 no tienen artículo verificado (las cámaras de las Ruinas Sete, Torre Pokémon, Mansión Pokémon, Central Energía…) y se buscarán a mano por su nombre en español. "Roaming Kanto" y "Kanto Pokecenter" no son lugares y se quedan sin captura.
- **Criterio de calidad ampliado** (como en la ficha, Fase 5): además de lo de la Fase 2, se aceptan la pantalla de llegada de Rojo Fuego y Verde Hoja (240 × 160, "Introducción a la Cueva Glaciada") y las vistas desde arriba de pixel art de RFVH y HGSS, guardadas sin pérdida y mostradas a escala entera con escalado pixelado. Siguen fuera los minimapas (192 × 144) y los GIF.
- **Orden de preferencia:** captura de *Let's Go* (396 × 228) → pantalla de llegada de RFVH a 2× → vista desde arriba.
- **Vistas muy altas** (rutas verticales de 384 × 1280 o más): se muestran con un alto máximo de 36rem, recortando por abajo con CSS; el archivo completo se enlaza en `/creditos`. Las muy anchas usan la vista panorámica que ya existe.

**Criterios de aceptación**
- [x] `/pokemon/133` a 1280 px: "Estadísticas base" no deja hueco bajo el total, y las condiciones de Leafeon y Sylveon ocupan 3 líneas o menos.
- [x] `/` a 390 px: el primer resultado asoma en la primera pantalla (844 px de alto); con `?tipo=fire` el botón dice "Filtros (1)" y el panel está abierto.
- [x] En "Dónde se obtiene", los lugares se ven subrayados sin pasar el ratón.
- [x] En `/regiones/kanto`, Four Island dice "Buscar ↗" y Bosque Verde "WikiDex ↗"; su nombre accesible no cambia.
- [x] El mapa de Kanto no deja bandas a los lados a 1280 px.
- [x] Al menos 40 de los 60 lugares de Kanto restantes tienen captura; ninguna es un minimapa ni un GIF, todas aparecen en `/creditos` y ninguna página tiene scroll horizontal a 390 px.

**Resultado (FE.27):** 46 lugares más, 74 de los 88 de Kanto con captura: 7 de *Let's Go* (Cueva Celeste, Calle Victoria —que la PokeAPI tiene dos veces—, Central de Energía, Vía Subterránea, Mansión Pokémon y Torre Pokémon), 6 pantallas de llegada de RFVH a 2× y 33 vistas desde arriba de RFVH y HGSS. Quedan sin captura los 14 que no tienen en WikiDex ni artículo ni capturas útiles: Four Island, Five Island, Canyon Entrance, Memorial Pillar, Three Isle Port (solo minimapas), las 7 cámaras de las Ruinas Sete, "Roaming Kanto" y "Kanto Pokecenter". Las pantallas de 240 px ensanchan la columna lateral a 482 px para verse a 2× exacto.

## Capturas en todas las fichas (FE.29–FE.31)

Amplía "Cómo se consigue en el juego" (Fase 5) a todos los Pokémon posibles. Aprobado por el usuario el 2026-11-17 ("intenta llenar todos los que puedas").

- **FE.29 · Iniciales:** los 29 Pokémon con `tipoObtencion = "Inicial"` (los 27 de las 9 generaciones, Pikachu y Eevee) muestran capturas de la elección del inicial cuando WikiDex las tiene ("Elección de Pokémon inicial ROZA", "Pokémon iniciales de Kanto XY"), elegidas a mano como en FE.24, con pie de foto en español. Una misma captura de los tres iniciales de una región se usa en las tres fichas.
- **FE.30 · Captura del lugar:** un Pokémon sin capturas propias muestra, en la misma sección, hasta 2 capturas de lugares donde aparece (las de `datos/imagenes.json`, sin descargar nada), con el pie "Aparece en Bosque Verde", enlazado a la página del lugar. Primero los lugares de su región de origen y después el resto, por orden de nombre. Las capturas propias (Fase 5 y FE.29) tienen siempre prioridad. Hoy cubre 220 Pokémon con los lugares de Kanto.
- **FE.31 · Lugares de las demás regiones:** el mismo método que FE.27 (artículo verificado en WikiDex; *Let's Go* o captura 3D → pantalla de llegada → vista desde arriba a escala entera), región por región, para que FE.30 llegue a más Pokémon. El techo son los 846 Pokémon que aparecen en algún lugar; los 179 restantes (sin lugares en la PokeAPI) dependen de que tengan capturas propias.
- Sin cambios en el contrato de la API: todo sale de `datos/imagenes.json` y de las rutas que ya trae cada Pokémon.

**Criterios de aceptación**
- [x] `/pokemon/1` (Bulbasaur) muestra una captura de la elección de los iniciales de Kanto.
- [x] `/pokemon/12` (Butterfree) muestra "Aparece en Bosque Verde" con la captura del Bosque Verde y un enlace a su página.
- [x] `/pokemon/151` (Mew) sigue mostrando sus capturas propias, no las de lugares.
- [x] Ninguna ficha muestra más de 3 capturas ni tiene scroll horizontal a 390 px.
- [x] Tras FE.31, cada región tiene capturas de lugares y el número de fichas con la sección se anota aquí.
**Resultado (FE.31):** 274 lugares más en Johto (40), Hoenn (78), Sinnoh (58), Teselia (43), Kalos (24), Alola (16) y Galar (63): 348 de 620 lugares con captura (Orre, sin artículos en WikiDex, queda en 0). Solo se acepta una captura cuyo nombre de archivo contenga el nombre del lugar, y se descartaron los mapas montados para guías (los de 3DS más grandes que la pantalla), las capturas protagonizadas por un Pokémon, objetos o diálogos, y las escenas de la historia; revisadas a mano en hojas de contacto. **801 de 1025 fichas** muestran ya la sección "Cómo se consigue en el juego" (77 con capturas propias y 724 con la de un lugar). `public/imagenes` pesa 22,7 MB; cada imagen solo se descarga en su página.
**Resultado (FE.29–FE.30):** 25 iniciales con la captura de la elección de su región (Kanto en X e Y; Johto, Hoenn, Sinnoh y Teselia en Rubí Omega y Zafiro Alfa; Alola, Galar y Paldea en sus juegos) y Eevee con la de cuando se recibe de regalo. Chespin, Fennekin y Froakie no tienen captura del juego en WikiDex (solo del anime) y Pikachu usa la de los lugares donde aparece. Con FE.30, 290 fichas muestran la sección antes de FE.31 (77 con capturas propias y 213 con las de un lugar).

## Sprite clásico en la ficha (FE.32)

Pedido por el usuario el 2026-11-17: junto a la ilustración oficial, el sprite pixelado clásico en todos los Pokémon que lo tengan.
- Fuente: `sprites/pokemon/{id}.png` del repo `PokeAPI/sprites` (96 × 96, pixel art de los juegos; el mismo de donde salen los sprites animados de FE.15) y `sprites/pokemon/shiny/{id}.png`. Se cargan desde GitHub como la ilustración, sin descargarlos.
- Se muestra en un recuadro "Sprite clásico" a 2× exacto (192 px) con escalado pixelado: al lado de la ilustración en escritorio (≥1024 px) y debajo en pantallas más estrechas. Estático: se ve también con "reducir movimiento".
- El interruptor "Shiny" cambia a la vez la ilustración y el sprite. El sprite tiene `alt` ("Sprite clásico de Pikachu").
- Si el repo no tiene el sprite de un Pokémon, no hay recuadro.

**Criterios de aceptación**
- [x] `/pokemon/382` (Kyogre) muestra el sprite clásico a 192 × 192, nítido, al lado de la ilustración a 1280 px y debajo a 390 px, sin scroll horizontal.
- [x] Con "Shiny" activado, ilustración y sprite cambian a la versión shiny.
- [x] Con `prefers-reduced-motion: reduce` el sprite se sigue viendo.
