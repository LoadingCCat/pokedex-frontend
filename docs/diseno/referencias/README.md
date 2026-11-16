# Pantallas de referencia · Pokedex+

Capturas de página completa del front publicado (<https://pokedex-frontend-seven.vercel.app/>), tomadas el 2026-11-16 con Chrome sin interfaz y emulación de dispositivo (CDP): 390 px como móvil (escala 2×) y 1280 px como escritorio (escala 1×).

| Captura | Pantalla | Ancho |
|---|---|---|
| [`p1-catalogo-390.png`](p1-catalogo-390.png) | P1 · Catálogo (`/`) | 390 px |
| [`p1-catalogo-1280.png`](p1-catalogo-1280.png) | P1 · Catálogo (`/`) | 1280 px |
| [`p2-ficha-eevee-390.png`](p2-ficha-eevee-390.png) | P2 · Ficha de Eevee (`/pokemon/133`) | 390 px |
| [`p2-ficha-eevee-1280.png`](p2-ficha-eevee-1280.png) | P2 · Ficha de Eevee (`/pokemon/133`) | 1280 px |

**No hubo variantes /a /b /c.** El diseño se construyó directamente desde la identidad «Laboratorio» ([`identidad-visual.md`](../identidad-visual.md)) y la skill `ui-componentes`. Estas capturas son la referencia de cómo quedó, no el resultado de comparar alternativas (ver `decisiones.md`, 2026-11-16).

## Evaluación con la rúbrica

Escala: **Cumple** · **Cumple en parte** (funciona, pero hay algo concreto que mejorar) · **No cumple**.

| Criterio | Resultado | Evidencia |
|---|---|---|
| Claridad | Cumple | Cada pantalla tiene un solo propósito visible arriba: título, una línea de explicación y la acción principal (el botón rojo "Buscar" es el único primario de la vista). Las tarjetas muestran solo número, nombre y tipos; los vacíos y errores se explican en texto. |
| Jerarquía | Cumple en parte | Bien en el catálogo y en la cabecera de la ficha (número en mono → nombre grande → tipos → datos). En la ficha a 1280 px hay dos fallos de peso visual (ver mejoras 1 y 2). |
| Consistencia | Cumple | Todo usa los tokens de la identidad: tarjetas blancas con borde de 1 px, píldoras para tipos y etiquetas, Space Grotesk en títulos, JetBrains Mono en números, un solo azul para enlaces y barras. Las mismas tarjetas de Pokémon se repiten en el catálogo y en las rutas. |
| Responsivo a 390 px | Cumple en parte | Sin desplazamiento horizontal (`scrollWidth` = 390 en las dos pantallas), cuadrícula de 2 columnas, controles de 44 px de alto y cadena evolutiva en vertical. Pero en el catálogo los filtros ocupan casi toda la primera pantalla (ver mejora 3). |
| Accesibilidad AA | Cumple | Todo el texto cumple 4,5:1 (texto 17,9; secundario 7,2; acento 6,8; los 18 colores de tipo con su texto comprobado). Barras de estadística frente a su carril: 5,4:1. Revisión automática de las 5 pantallas a 375 y 1280 px (FE.12): un solo `h1`, sin saltos de encabezado, todas las imágenes con `alt`, todos los controles con nombre o etiqueta, foco visible. La categoría y el "competitivo" se leen como texto, no solo por color. |

## Qué habría que mejorar

1. **Ficha a 1280 px: la tarjeta "Estadísticas base" se estira** hasta la altura de "Dónde se obtiene" y deja unos 400 px vacíos (Eevee aparece en 22 lugares). Arreglo: `items-start` en la cuadrícula de dos columnas, o poner las estadísticas junto a la cabecera.
2. **Ficha a 1280 px: la cadena evolutiva usa un tercio del ancho.** Las condiciones largas (Leafeon, Glaceon, Sylveon) se parten en 6–7 líneas dentro de una columna de 144 px, mientras sobra espacio a la derecha. Arreglo: columna de condición más ancha (`md:w-56`) o, con ramas de más de 3 etapas, una cuadrícula de 2–4 columnas en lugar de la lista vertical.
3. **Catálogo a 390 px: los filtros ocupan unos 600 px** antes del primer resultado, así que en un teléfono de 844 px de alto apenas asoma la primera fila de tarjetas. La identidad pide "un panel desplegable en móvil" y no se hizo. Arreglo: dejar visible solo el buscador y un botón "Filtros (n)" que abra el resto. En escritorio, la identidad pide además que la barra de filtros quede fija bajo la cabecera, y tampoco se hizo.
4. **Textos de 12 px** en las condiciones de evolución y en los números `#133`. Cumplen el contraste, pero en móvil cuestan de leer; subirlos a 13–14 px en la cadena.
5. **Enlaces de lugares solo por color.** En "Dónde se obtiene" los enlaces van en listas que son solo enlaces, así que no incumplen la 1.4.1, pero el azul frente al texto normal es 2,6:1 (no llega a 3:1). Subrayarlos siempre los haría reconocibles sin depender del color y, de paso, daría más área de toque en móvil.
6. **Datos que llegan en inglés:** muchos lugares ("Celadon City", "Viridian Forest") y algunas condiciones ("…de tipo fairy"). No es del diseño sino de la PokeAPI (tarea B.26 del backend), pero se nota en la ficha.

Las mejoras 1–5 son del front y caben en una tarea de pulido; ninguna bloquea el uso ni incumple AA.
