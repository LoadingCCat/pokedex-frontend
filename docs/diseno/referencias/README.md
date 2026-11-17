# Pantallas de referencia · Pokedex+

Capturas de página completa del build de producción del front (`npm run build` + `next start`, solo con el mock, el mismo código que se publica en <https://pokedex-frontend-seven.vercel.app/>), tomadas de nuevo el 2026-11-17 al cerrar el front (después de FE.32) con Chrome sin interfaz y emulación de dispositivo (CDP): 390 px como móvil (escala 2×) y 1280 px como escritorio (escala 1×). Sustituyen a las de FE.22 y ya incluyen el pulido de FE.26, los lugares en español (B.28), la sección "Cómo se consigue en el juego" (FE.24–FE.31) y el sprite clásico (FE.32).

| Captura | Pantalla | Ancho |
|---|---|---|
| [`p1-catalogo-390.png`](p1-catalogo-390.png) | P1 · Catálogo (`/`) | 390 px |
| [`p1-catalogo-1280.png`](p1-catalogo-1280.png) | P1 · Catálogo (`/`) | 1280 px |
| [`p2-ficha-eevee-390.png`](p2-ficha-eevee-390.png) | P2 · Ficha de Eevee (`/pokemon/133`) | 390 px |
| [`p2-ficha-eevee-1280.png`](p2-ficha-eevee-1280.png) | P2 · Ficha de Eevee (`/pokemon/133`) | 1280 px |
| [`p4-region-kanto-390.png`](p4-region-kanto-390.png) | P4 · Región Kanto (`/regiones/kanto`) | 390 px |
| [`p4-region-kanto-1280.png`](p4-region-kanto-1280.png) | P4 · Región Kanto (`/regiones/kanto`) | 1280 px |
| [`p5-viridian-forest-390.png`](p5-viridian-forest-390.png) | P5 · Bosque Verde (`/rutas/62`) | 390 px |
| [`p5-viridian-forest-1280.png`](p5-viridian-forest-1280.png) | P5 · Bosque Verde (`/rutas/62`) | 1280 px |

Los archivos de P5 conservan el nombre en inglés del lugar para no romper enlaces; desde B.28 la página dice "Bosque Verde".

**No hubo variantes /a /b /c.** El diseño se construyó directamente desde la identidad «Laboratorio» ([`identidad-visual.md`](../identidad-visual.md)) y la skill `ui-componentes`. Estas capturas son la referencia de cómo quedó, no el resultado de comparar alternativas (ver `decisiones.md`, 2026-11-16).

## Evaluación con la rúbrica

Escala: **Cumple** · **Cumple en parte** (funciona, pero hay algo concreto que mejorar) · **No cumple**. Evaluación al día del 2026-11-17 (antes: 2026-11-16, FE.22).

| Criterio | Resultado | Evidencia |
|---|---|---|
| Claridad | Cumple | Cada pantalla tiene un solo propósito visible arriba: título, una línea de explicación y la acción principal (el botón rojo "Buscar" es el único primario de la vista). Las tarjetas muestran solo número, nombre y tipos; los vacíos y errores se explican en texto. |
| Jerarquía | Cumple en parte | Resueltos los dos fallos de FE.22 (FE.26): "Estadísticas base" ya no se estira y las condiciones de evolución caben en 1–3 líneas. En escritorio, la cabecera de la ficha lee bien: ilustración y sprite clásico a la izquierda, número → nombre → tipos → datos a la derecha. Pero en la ficha a 390 px, desde FE.32, la ilustración, el sprite clásico y los botones van antes del nombre, que queda a unos 870 px: fuera de la primera pantalla de un teléfono (ver mejora 9). |
| Consistencia | Cumple | Todo usa los tokens de la identidad: tarjetas blancas con borde de 1 px, píldoras para tipos y etiquetas, Space Grotesk en títulos, JetBrains Mono en números, un solo azul para enlaces y barras. Las mismas tarjetas de Pokémon se repiten en el catálogo y en las rutas. |
| Responsivo a 390 px | Cumple | Sin desplazamiento horizontal (`scrollWidth` = 390 en las cuatro pantallas, medido en estas capturas), cuadrícula de 2 columnas, controles de 44 px de alto y cadena evolutiva en vertical. Los filtros del catálogo van tras "Filtros (n)" y la primera fila de tarjetas ya se ve en la primera pantalla. Las tablas de movimientos pasan tipo y competitivo bajo el nombre. |
| Accesibilidad AA | Cumple | Todo el texto cumple 4,5:1 (texto 17,9; secundario 7,2; acento 6,8; los 18 colores de tipo con su texto comprobado). Barras de estadística frente a su carril: 5,4:1. Revisión automática de las 5 pantallas a 375 y 1280 px (FE.12): un solo `h1`, sin saltos de encabezado, todas las imágenes con `alt`, todos los controles con nombre o etiqueta, foco visible. La categoría y el "competitivo" se leen como texto, no solo por color. |
| Toques de nostalgia | Cumple | Un solo efecto destacado por pantalla (sprite animado en el catálogo; barras en la ficha; Escuchar y Shiny solo responden al usuario). Todos duran menos de 300 ms (fundido de 150 ms, barras de 280 ms) y se apagan con `prefers-reduced-motion` (comprobado con la emulación de CDP). Los mapas y capturas van en su propio bloque con el crédito debajo: no tapan nombre, número, tipos ni estadísticas (ver P2, P4 y P5). El pixel art (la captura de Rojo Fuego de Eevee, el sprite clásico) se ve nítido a 2×. Los discos de MT y el sprite clásico son estáticos: no suman efectos. Los enlaces a WikiDex avisan al lector de pantalla de que abren otra pestaña y salen del sitio, y los de búsqueda se distinguen a la vista ("Buscar ↗"). Sin 3D real. |

## Qué habría que mejorar

Lista de la evaluación de FE.22 (2026-11-16). Las resueltas después se indican al final; las nuevas de esta revisión son la 9 y la 10.

1. **Ficha a 1280 px: la tarjeta "Estadísticas base" se estira** hasta la altura de "Dónde se obtiene" y deja unos 400 px vacíos (Eevee aparece en 22 lugares). Arreglo: `items-start` en la cuadrícula de dos columnas, o poner las estadísticas junto a la cabecera.
2. **Ficha a 1280 px: la cadena evolutiva usa un tercio del ancho.** Las condiciones largas (Leafeon, Glaceon, Sylveon) se parten en 6–7 líneas dentro de una columna de 144 px, mientras sobra espacio a la derecha. Arreglo: columna de condición más ancha (`md:w-56`) o, con ramas de más de 3 etapas, una cuadrícula de 2–4 columnas en lugar de la lista vertical.
3. **Catálogo a 390 px: los filtros ocupan unos 600 px** antes del primer resultado, así que en un teléfono de 844 px de alto apenas asoma la primera fila de tarjetas. La identidad pide "un panel desplegable en móvil" y no se hizo. Arreglo: dejar visible solo el buscador y un botón "Filtros (n)" que abra el resto. En escritorio, la identidad pide además que la barra de filtros quede fija bajo la cabecera, y tampoco se hizo.
4. **Textos de 12 px** en las condiciones de evolución y en los números `#133`. Cumplen el contraste, pero en móvil cuestan de leer; subirlos a 13–14 px en la cadena.
5. **Enlaces de lugares solo por color.** En "Dónde se obtiene" los enlaces van en listas que son solo enlaces, así que no incumplen la 1.4.1, pero el azul frente al texto normal es 2,6:1 (no llega a 3:1). Subrayarlos siempre los haría reconocibles sin depender del color y, de paso, daría más área de toque en móvil.
6. **Datos que llegan en inglés:** muchos lugares ("Celadon City", "Viridian Forest"; resuelto en B.28: unos 90 de 620 siguen en inglés porque WikiDex no tiene su artículo) y algunas condiciones ("…de tipo fairy"). No es del diseño sino de la PokeAPI (tarea B.26 del backend), pero se nota en la ficha.

7. **Lista de lugares: el enlace corto "WikiDex ↗" se ve igual sea un artículo verificado o una búsqueda** (en Kanto, Four Island y Five Island van a la búsqueda). El lector de pantalla sí lo distingue ("Buscar Four Island en WikiDex"), pero quien mira no. Arreglo: texto visible "Buscar ↗" en los de búsqueda, o un icono de lupa.
8. **Mapa de Kanto a 1280 px: bandas grises a los lados.** El alto se acota a 34rem para que la lista de lugares no quede lejos, y el mapa (más estrecho) queda centrado sobre el fondo del bloque. Es intencional, pero el bloque podría ajustarse al ancho del mapa (`w-fit mx-auto`).

Las mejoras 1–5, 7 y 8 son del front y caben en una tarea de pulido; ninguna bloquea el uso ni incumple AA.

**Resueltas en FE.26 (2026-11-17):** 1 (tarjetas sin estirar), 2 y 4 (condiciones de 288–384 px y textos de 13 px: Leafeon y Sylveon en 2 y 3 líneas), 3 (filtros tras "Filtros (n)" en móvil: el primer resultado aparece a 644 px; la barra fija de escritorio se descartó), 5 (lugares subrayados), 7 ("Buscar ↗" visible) y 8 (mapa sin bandas). Las capturas de esta carpeta ya lo muestran.

**Sigue abierta la 6** (datos en inglés), reducida por B.28: en Kanto quedan "Dilford Chamber" o "Five Island", y en la ficha de Eevee los lugares de Galar ("Ballimere Lake", "Bridge Field") y "Pokemon Hq Lab"; la condición de Sylveon dice "de tipo fairy" (B.26 del backend).

9. **Ficha a 390 px: el nombre queda fuera de la primera pantalla.** Desde FE.32 el recuadro "Sprite clásico" se apila bajo la ilustración, y con los botones el número y el nombre bajan a unos 870 px. Arreglo: en móvil, ilustración y sprite lado a lado (el sprite a 1× o 2× en una columna estrecha), o el sprite después de los datos de la cabecera.
10. **Nombres de lugar repetidos.** Con los nombres en español (B.28), dos lugares distintos de la PokeAPI pueden llamarse igual: en Kanto aparecen dos "Calle Victoria" (`idPokeapi` 152 y 159, dos entradas distintas de la PokeAPI) que no se distinguen en la lista. Arreglo en el backend o en el front: añadir el juego o el piso cuando el nombre se repite en una región.

La 9 y la 10 son pequeñas y ninguna bloquea el uso ni incumple AA. Quedan anotadas, sin tarea abierta, porque este cierre no agrega cambios de código.
