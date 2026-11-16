# Identidad visual · Pokedex+ — «Laboratorio»

La Pokédex como una ficha de laboratorio: mucho dato, ordenado y legible, sin adornos. Es la referencia para la skill `ui-componentes` y para todas las pantallas del frontend.

**Por qué esta identidad:** el usuario principal son estudiantes de ingeniería y entusiastas que buscan una herramienta técnica y limpia (`producto.md` del backend). Una interfaz clara y orientada al dato facilita recorrer y comparar 1025 Pokémon, y deja que la evalúen sin distracciones.

## Tono de voz

- **Preciso y neutro.** Se usa "tú", sin jerga ni chistes. El dato manda.
- **Etiquetas cortas:** "Estadísticas base", "Dónde se obtiene", "Cadena evolutiva", "Movimientos que aprende".
- **Los vacíos se explican, sin disculpas:**
  - Sin rutas → "Este Pokémon no aparece en estado salvaje."
  - `tipoObtencion = "Sin datos"` → "La PokeAPI no tiene datos de captura para este Pokémon."
  - Búsqueda sin resultados → "Sin resultados para «pikachú». Prueba con otro nombre o quita un filtro."
- **Los errores dicen qué pasó y qué hacer:** "No se pudo cargar el catálogo. Vuelve a intentarlo." No se muestran códigos HTTP ni detalles técnicos.
- **Números con formato:** `#025` (tres cifras mínimo), `0,4 m`, `6,0 kg` (coma decimal, locale `es`).
- **Nombres:** se muestra `nombreEs`; si viene en `null`, el `nombre` (slug) con mayúscula inicial y sin guiones.

## Paleta

Modo claro únicamente. Todo el texto cumple WCAG AA (4,5:1); los bordes y controles cumplen 3:1.

| Token | HEX | Uso | Contraste |
|---|---|---|---|
| `fondo` | `#F6F7F9` | Fondo de la página | — |
| `superficie` | `#FFFFFF` | Tarjetas, paneles, campos | — |
| `texto` | `#14171F` | Texto principal | 17,9 sobre superficie · 16,7 sobre fondo |
| `texto-secundario` | `#4A5366` | Etiquetas, metadatos, ayudas | 7,7 sobre superficie · 7,2 sobre fondo |
| `primario` | `#B3122E` | Marca, botón principal, título del logo | 6,9 sobre superficie · texto blanco encima: 6,9 |
| `acento` | `#1F4FD1` | Enlaces, foco, chip de filtro activo | 6,8 sobre superficie · texto blanco encima: 6,8 |
| `exito` | `#1E7A3E` | Mensajes de éxito | 5,4 sobre superficie |
| `error` | `#B42318` | Mensajes de error | 6,6 sobre superficie |
| `borde` | `#8A93A6` | Borde de campos y controles | 3,1 sobre superficie |
| `borde-suave` | `#E3E6EC` | Separadores y borde de tarjetas (decorativo) | — |

Reglas:
- El `primario` se reserva para la marca y la acción principal de cada pantalla (una por vista). Para lo interactivo secundario se usa el `acento`.
- El color nunca es la única señal: los tipos llevan su nombre escrito y los errores, un icono y texto.

### Colores de tipo

Insignias con el color del tipo de fondo y el texto que da AA (comprobado). La etiqueta va en español; la clave es el `nombre` del tipo que envía la API.

| Clave API | Etiqueta | Fondo | Texto | Contraste |
|---|---|---|---|---|
| `normal` | Normal | `#9FA19F` | `#14171F` | 6,9 |
| `fire` | Fuego | `#D92523` | `#FFFFFF` | 5,0 |
| `water` | Agua | `#2980EF` | `#14171F` | 4,6 |
| `electric` | Eléctrico | `#FAC000` | `#14171F` | 10,8 |
| `grass` | Planta | `#3FA129` | `#14171F` | 5,4 |
| `ice` | Hielo | `#3DCEF3` | `#14171F` | 9,7 |
| `fighting` | Lucha | `#FF8000` | `#14171F` | 7,1 |
| `poison` | Veneno | `#9141CB` | `#FFFFFF` | 5,5 |
| `ground` | Tierra | `#915121` | `#FFFFFF` | 6,2 |
| `flying` | Volador | `#81B9EF` | `#14171F` | 8,6 |
| `psychic` | Psíquico | `#EF4179` | `#14171F` | 4,9 |
| `bug` | Bicho | `#91A119` | `#14171F` | 6,2 |
| `rock` | Roca | `#AFA981` | `#14171F` | 7,5 |
| `ghost` | Fantasma | `#704170` | `#FFFFFF` | 7,8 |
| `dragon` | Dragón | `#5060E1` | `#FFFFFF` | 5,1 |
| `dark` | Siniestro | `#624D4E` | `#FFFFFF` | 7,8 |
| `steel` | Acero | `#60A1B8` | `#14171F` | 6,2 |
| `fairy` | Hada | `#EF70EF` | `#14171F` | 7,0 |

Un tipo desconocido se muestra con el estilo de `normal` y su `nombre` tal cual.

## Tipografía (Google Fonts, con `next/font/google`)

| Rol | Fuente | Pesos | Uso |
|---|---|---|---|
| Títulos | **Space Grotesk** | 500, 700 | Nombre del Pokémon, títulos de sección, logo |
| Texto | **Inter** | 400, 500, 600 | Cuerpo, etiquetas, botones, tablas |
| Datos | **JetBrains Mono** | 400, 500 | `#025`, estadísticas, altura, peso, potencia |

Escala (rem, base 16 px): 0,75 · 0,875 · **1** (cuerpo) · 1,25 · 1,5 · 2 · 2,5 (nombre en la ficha). Interlineado 1,5 en el cuerpo y 1,2 en los títulos. Las cifras en tablas y barras usan `font-variant-numeric: tabular-nums`.

## Estilo de componentes

- **Espaciado:** escala de 4 px (Tailwind por defecto). Contenido con un ancho máximo de 1200 px y márgenes laterales de 16 px en móvil.
- **Tarjeta:** fondo `superficie`, borde 1 px `borde-suave`, radio 8 px, sin sombra (como mucho una sombra muy suave al pasar el ratón). En el catálogo: imagen, `#025` en mono y `texto-secundario`, nombre en Space Grotesk e insignias de tipo.
- **Insignia de tipo:** píldora (radio completo), padding 2 × 10 px, texto 0,75 rem en peso 600 y mayúscula inicial, con los colores de la tabla.
- **Botones:** el principal con fondo `primario` y texto blanco; el secundario con fondo `superficie`, borde `borde` y texto `texto`. Radio 6 px, alto mínimo 40 px (44 px en móvil).
- **Campos y filtros:** buscador con borde `borde` y radio 6 px. Filtros como chips: inactivos con borde `borde`; activos con fondo `acento` y texto blanco, más una "×" para quitarlos. Barra de filtros fija bajo la cabecera en escritorio y en un panel desplegable en móvil.
- **Estadísticas base:** una fila por estadística (etiqueta · valor en mono · barra horizontal de 8 px). La barra es proporcional a 255, en `acento`, sobre un carril `borde-suave`; el total va aparte en negrita.
- **Cadena evolutiva:** nodos (imagen pequeña, `#id` y nombre) unidos por flechas, con la `condicion` en `texto-secundario` sobre la flecha. Las ramas (Eevee) se apilan en vertical, y en móvil la cadena pasa a vertical. Un nodo sin `imagenUrl` muestra una silueta gris.
- **Tablas (movimientos):** filas con separador `borde-suave`, cabecera en `texto-secundario` peso 600 y potencia alineada a la derecha en mono. La categoría (Físico, Especial, Estado) se muestra como etiqueta de texto, no solo con color.
- **Paginación:** "Anterior / Página N de M / Siguiente", sin depender solo de iconos.
- **Estados:** mientras carga, esqueletos grises (`borde-suave`) con la forma de la tarjeta. Los vacíos y errores van con el texto del tono de voz.
- **Foco y accesibilidad:** anillo de 2 px en `acento` con 2 px de separación en todos los elementos interactivos (nunca `outline: none` sin reemplazo). Imágenes con `alt` igual al nombre del Pokémon. Si el sistema pide reducir el movimiento (`prefers-reduced-motion`), se quitan las transiciones.
- **Iconos:** de trazo lineal de 1,5 px (por ejemplo, Lucide), siempre acompañados de texto o de `aria-label`.

## Tokens para Tailwind 4 (`app/globals.css`)

```css
@theme {
  --color-fondo: #F6F7F9;
  --color-superficie: #FFFFFF;
  --color-texto: #14171F;
  --color-texto-secundario: #4A5366;
  --color-primario: #B3122E;
  --color-acento: #1F4FD1;
  --color-exito: #1E7A3E;
  --color-error: #B42318;
  --color-borde: #8A93A6;
  --color-borde-suave: #E3E6EC;
}
```

Las fuentes se cargan con `next/font/google` (`Space_Grotesk`, `Inter`, `JetBrains_Mono`) y se exponen como `--font-titulo`, `--font-texto` y `--font-datos`.

## Fuera de esta identidad

- Modo oscuro: no entra en el MVP.
- Logos, imágenes o tipografías oficiales de la franquicia: solo se usan los sprites que entrega la API (`imagenUrl`).
