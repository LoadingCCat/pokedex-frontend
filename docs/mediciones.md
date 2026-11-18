# Mediciones (RNF-01 y RNF-03)

Medido el 2026-11-17 con el **build de producción** (`npm run build` + `next start`), **sin `API_URL`** (datos mock, igual que el sitio de Vercel), en `localhost`.

## FE.44 · Lighthouse (RNF-01: interactiva en menos de 2 s)

Lighthouse 12.8.2, Chrome sin interfaz, categorías Rendimiento y Accesibilidad. «Móvil» es el perfil por defecto de Lighthouse (4G lenta simulada y CPU 4× más lenta); «Escritorio» es `--preset=desktop`. Tiempos en milisegundos. TTI = tiempo hasta interactiva.

| Página | Perfil | Rendimiento | Accesibilidad | FCP | LCP | TBT | TTI | CLS | < 2 s |
|---|---|---|---|---|---|---|---|---|---|
| Catálogo `/` | Escritorio | 97 | 100 | 637 | 1220 | 36 | **1310** | 0 | Sí |
| Búsqueda `/?nombre=pika` | Escritorio | 97 | 100 | 436 | 636 | 144 | **928** | 0 | Sí |
| Ficha `/pokemon/25` | Escritorio | 68 | 100 | 650 | 1306 | 950 | **2109** | 0,034 | No (≈ 0,1 s más) |
| Catálogo `/` | Móvil | 68 | 100 | 2041 | 4835 | 398 | **5136** | 0 | No |
| Búsqueda `/?nombre=pika` | Móvil | 77 | 100 | 1389 | 2420 | 768 | **3641** | 0 | No |
| Ficha `/pokemon/25` | Móvil | 78 | 100 | 1178 | 3604 | 484 | **3957** | 0,004 | No |

**Lectura:**
- En escritorio, el catálogo y la búsqueda cumplen RNF-01 con margen; la ficha queda en 2,1 s.
- En el móvil simulado no se cumple. El TTI de Lighthouse en móvil simula una red y una CPU mucho más lentas que un teléfono actual con wifi; se deja como referencia del peor caso.
- Accesibilidad: 100 en las seis mediciones.

**Qué pesa (diagnóstico de Lighthouse):**
- **Catálogo en móvil:** el LCP es la imagen de la primera tarjeta (Bulbasaur), que ya se precarga (`preload` en las 4 primeras). Su carga tarda unos 2,5 s porque `next/image` la trae del repositorio de sprites de la PokeAPI y la convierte la primera vez. Además, el JavaScript del framework (≈ 116 KB comprimidos) ocupa unos 1,8 s de CPU simulada.
- **Ficha en escritorio:** el bloqueo (TBT 950 ms) viene de un DOM de unos 2 400 nodos: la tabla de los 109 movimientos se renderiza dentro del `<details>` cerrado, más la cadena evolutiva y las capturas.

**Mejoras posibles (no aplicadas antes de la sustentación, para no tocar pantallas ya revisadas):** cargar la tabla de movimientos al abrir el `<details>` en lugar de con la página, y servir las ilustraciones de las primeras tarjetas ya convertidas desde `public/`.

Cómo repetirlo:
```powershell
npm run build; npx next start -p 3100
npx -y lighthouse@12.8.2 http://localhost:3100/ --only-categories=performance,accessibility --preset=desktop --view
```

## FE.45 · Playwright: sin scroll horizontal (RNF-03)

Chromium con Playwright, ventana de 800 px de alto y anchos de **360, 375, 768, 1080 y 1280 px**. En cada página se compara `document.documentElement.scrollWidth` con `clientWidth` y, si se pasa, se listan los elementos que sobresalen.

Páginas: catálogo `/`, búsqueda `/?nombre=pika`, fichas `/pokemon/25` y `/pokemon/94`, `/regiones`, `/regiones/kanto`, `/naturalezas`, `/movimientos`, `/creditos`, `/login` y `/admin`.

**Primera pasada:** a 360 y 375 px, **todas** las páginas tenían scroll horizontal (unos 67 px). La causa era la navegación principal: con el cuarto enlace, «Naturalezas» (FE.48), los cuatro enlaces no cabían en una fila y la lista no podía bajar de línea.

**Corrección:** en `NavegacionPrincipal`, la lista hace `flex-wrap` y, en móvil, cada enlace tiene menos relleno horizontal (`px-2`, `sm:px-3`); la altura táctil sigue siendo de 44 px.

**Segunda pasada:** 55 de 55 combinaciones (11 páginas × 5 anchos) responden 200 y **sin scroll horizontal**.

**Lo que no se pudo medir aquí:** los formularios de `/admin` con datos. Sin `API_URL`, `/login` y `/admin` muestran el aviso (medido arriba). Con la API local, los listados del panel son listas que bajan de línea (`FilaAdmin`) y los formularios usan una columna en móvil, pero falta comprobarlos con el backend arrancado.

Fragmento usado (con la herramienta de Playwright, sobre `next start -p 3100`):
```js
for (const w of [360, 375, 768, 1080, 1280]) {
  await page.setViewportSize({ width: w, height: 800 });
  for (const r of rutas) {
    await page.goto("http://localhost:3100" + r, { waitUntil: "networkidle" });
    const { scrollWidth, clientWidth } = await page.evaluate(() => document.documentElement);
    // scrollWidth > clientWidth → hay scroll horizontal
  }
}
```
