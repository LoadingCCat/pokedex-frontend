---
name: ui-componentes
description: Crear o modificar componentes y pantallas del frontend de Pokedex+ (Next.js + TypeScript + Tailwind 4) siguiendo la identidad visual «Laboratorio». Úsala cada vez que la tarea toque archivos de app/, components/, estilos, fuentes o imágenes.
---

# Cómo hacemos un componente o una pantalla en este proyecto

1. **Primero el doc.**
   - Lee `docs/diseno/identidad-visual.md`. Es la fuente de verdad de colores, tipografía, tono y estilo de cada componente.
   - Busca en `../pokedex-backend/docs/specs/` la spec de la funcionalidad que usa la pantalla y, en `../pokedex-backend/docs/contratos/api.md`, la forma exacta de los datos.
   - Si la pantalla necesita algo que no está en la spec ni en el contrato, o un componente que la identidad no define, propón primero el cambio en esos docs y espera aprobación.
2. **Lee la guía de Next.js instalada.** Esta versión (16) cambia APIs respecto a lo que conoces. Antes de usar una API de Next (rutas, `Image`, `next/font`, `Link`, carga de datos, errores), lee su guía en `node_modules/next/dist/docs/01-app/` (por ejemplo `01-getting-started/12-images.md` o `13-fonts.md`).
3. **Dónde va cada cosa.**
   - `components/ui/`: piezas genéricas sin conocimiento de Pokémon (`Boton`, `Tarjeta`, `Chip`, `Paginacion`, `EstadoVacio`, `Esqueleto`).
   - `components/pokemon/`: piezas del dominio (`TarjetaPokemon`, `InsigniaTipo`, `BarraEstadistica`, `CadenaEvolutiva`, `TablaMovimientos`).
   - `app/`: solo páginas y layouts, que componen los componentes y piden los datos.
   - `lib/api/`: **único** acceso a datos (hoy lee el mock, mañana la API real). Los tipos de TypeScript de las respuestas (`Pokemon`, `Pagina<T>`, `Etapa`…) viven ahí y copian `api.md`.
   - Un componente por archivo, en PascalCase y en español (`InsigniaTipo.tsx`). Variables, props y textos en español.
4. **Datos.**
   - Los componentes reciben los datos por props ya tipados. **Nunca** llaman a `fetch`, a la PokeAPI ni al backend directamente.
   - Las páginas piden los datos a `lib/api`.
   - Contempla siempre los casos del contrato: `nombreEs` o `imagenUrl` en `null`, `rutas` vacías, `tipoObtencion = "Sin datos"`, `evoluciones: []`.
5. **Server o Client.** Por defecto, componente de servidor. Agrega `'use client'` solo si el componente necesita estado, eventos o APIs del navegador (buscador, filtros, paginación interactiva), y mantén ese componente lo más pequeño posible.
6. **Estilos.**
   - Solo clases de Tailwind con los tokens de `app/globals.css` (`bg-superficie`, `text-texto`, `text-texto-secundario`, `border-borde-suave`, `bg-primario`, `ring-acento`…).
   - **No** pongas códigos HEX dentro de los componentes. Los colores de los 18 tipos se definen una sola vez en `lib/tipos-pokemon.ts` (clave de la API → etiqueta en español, fondo y color de texto, copiados de la tabla de la identidad) y `InsigniaTipo` los lee de ahí.
   - Fuentes con `next/font/google` (Space Grotesk, Inter, JetBrains Mono), cargadas una vez en `app/layout.tsx`: `font-titulo` para títulos, `font-texto` para el cuerpo y `font-datos` (con `tabular-nums`) para números.
   - Radios: tarjetas 8 px, botones y campos 6 px, insignias y chips en píldora. Sin sombras fuertes.
   - Diseña primero para móvil (375 px) y amplía con `sm:`, `md:` y `lg:`.
   - No agregues dependencias (librerías de componentes, iconos, utilidades de clases) sin proponerlo antes.
7. **Imágenes.** Usa `next/image` con `alt` igual al nombre que se muestra. El host de los sprites (`raw.githubusercontent.com`) debe estar en `images.remotePatterns` de `next.config.ts`. Si `imagenUrl` es `null`, muestra la silueta gris de reemplazo.
8. **Textos.** Sigue el tono de voz de la identidad: preciso, de "tú", sin códigos HTTP. Muestra `nombreEs` y, si no hay, el `nombre` formateado. Escribe los números con formato (`#025`, `0,4 m`, `6,0 kg`). Usa los helpers de `lib/formato.ts` en lugar de formatear en cada componente.
9. **Estados.** Toda pantalla que carga datos tiene tres estados además del normal: **cargando** (esqueleto con la forma final), **vacío** (texto que explica qué pasó y qué probar) y **error** (mensaje genérico y opción de reintentar).
10. **Accesibilidad (obligatorio).**
    - HTML semántico: `button` para acciones, `Link` para navegar, `h1` a `h3` en orden y un solo `h1` por página.
    - Foco visible en todo lo interactivo: `focus-visible:ring-2 ring-acento ring-offset-2`. Nunca `outline-none` sin reemplazo.
    - El color nunca es la única señal: los tipos llevan texto y los errores, un icono y texto.
    - Los iconos sin texto llevan `aria-label`. Los campos llevan `label`.
    - Con `motion-reduce:` se quitan las transiciones.
    - Si inventas una combinación de colores que no está en la identidad, mide su contraste (AA: 4,5:1 para texto, 3:1 para bordes y controles) antes de usarla.
11. **Verificar.**
    - `npm run lint` y `npm run build` sin errores.
    - `npm run dev` y revisa la pantalla en el navegador a 375 px y a 1280 px.
    - Recórrela solo con el teclado (Tab, Enter, Esc).
    - Comprueba los tres estados (cargando, vacío y error) y los casos con `null` del paso 4.
12. **Cerrar.** Marca la tarea en `../pokedex-backend/docs/tareas.md` (sección Front) y los criterios cumplidos, y anota en `../pokedex-backend/docs/decisiones.md` cualquier decisión técnica. Commit con un mensaje corto en español. No hagas `git push` sin preguntar.
