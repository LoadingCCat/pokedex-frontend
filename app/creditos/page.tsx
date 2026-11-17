import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { listarRegiones, rutasDeRegion } from "@/lib/api";
import { agruparCreditos } from "@/lib/creditos";
import { todasLasImagenes } from "@/lib/imagenes";

export const metadata: Metadata = {
  title: "Créditos y avisos",
  description: "De dónde salen los datos, las imágenes y los enlaces de Pokedex+, y bajo qué condiciones se usan.",
};

/** P6 · Créditos (docs/pantallas.md): página estática, solo texto y enlaces. */
export default async function Creditos() {
  const imagenes = todasLasImagenes();
  // Las rutas solo sirven para enlazar cada captura a su lugar; si no se pueden cargar, las
  // capturas se listan igual (grupo "Otros lugares", sin enlace)
  let rutas: { idRuta: number; idPokeapi: number | null; region: string }[] = [];
  try {
    const regiones = await listarRegiones();
    // Ninguna región pasa de 200 lugares (la que más tiene, Hoenn, 96): basta una página por región
    rutas = (await Promise.all(regiones.map((r) => rutasDeRegion(r, { size: 200 })))).flatMap((p) => p.content);
  } catch (error) {
    console.error("No se pudieron cargar las rutas para los créditos", error);
  }
  const grupos = agruparCreditos(imagenes, rutas);
  const condiciones = [...new Set([...imagenes.regiones, ...imagenes.lugares].map(([, i]) => i.licencia))];

  return (
    <div className="flex max-w-3xl flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold sm:text-4xl">Créditos y avisos</h1>
        <p className="text-texto-secundario">De dónde salen los datos, las imágenes y los enlaces de Pokedex+.</p>
      </header>

      <Seccion id="datos" titulo="Datos">
        <p>
          Todos los datos (Pokémon, tipos, estadísticas, movimientos, lugares y cadenas evolutivas) vienen de la{" "}
          <Fuera href="https://pokeapi.co">PokeAPI</Fuera>. Nuestra API los importa a su propia base de datos y esta web
          solo consulta nuestra API.
        </p>
      </Seccion>

      <Seccion id="recursos" titulo="Ilustraciones, sprites y gritos">
        <p>
          Las ilustraciones oficiales (normales y shiny) y los sprites animados de Pokémon Negro y Blanco vienen del
          repositorio <Fuera href="https://github.com/PokeAPI/sprites">PokeAPI/sprites</Fuera>, y los gritos, de{" "}
          <Fuera href="https://github.com/PokeAPI/cries">PokeAPI/cries</Fuera>. Se cargan directamente desde GitHub.
        </p>
      </Seccion>

      <Seccion id="mapas" titulo="Mapas y capturas">
        <p>
          Los mapas de región y las capturas de lugares vienen de{" "}
          <Fuera href="https://www.wikidex.net">WikiDex</Fuera>. Se descargaron una vez, se convirtieron a WebP y se
          sirven desde esta web. WikiDex no indica un autor por archivo; cada imagen enlaza a su página original.
        </p>
        {grupos.map((grupo) =>
          grupo.filas.length === 0 ? null : (
            <div key={grupo.titulo} className="flex flex-col gap-2">
              <h3 className="font-bold">
                {grupo.titulo}{" "}
                <span className="font-datos text-sm font-medium text-texto-secundario tabular-nums">({grupo.filas.length})</span>
              </h3>
              <ul className="divide-y divide-borde-suave rounded-lg border border-borde-suave bg-superficie">
                {grupo.filas.map(({ muestra, href, imagen }) => (
                  <li key={imagen.archivo} className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-baseline sm:gap-4">
                    <span className="font-medium sm:w-48 sm:shrink-0">
                      {href ? (
                        <Link href={href} className="text-acento underline-offset-2 hover:underline">
                          {muestra}
                        </Link>
                      ) : (
                        muestra
                      )}
                    </span>
                    <span className="text-texto-secundario sm:flex-1">
                      {imagen.juego} · {imagen.fuente}
                    </span>
                    <Fuera href={imagen.origen} etiqueta={`Archivo original de ${muestra} en ${imagen.fuente}`}>
                      Archivo original
                    </Fuera>
                  </li>
                ))}
              </ul>
            </div>
          ),
        )}
        {condiciones.map((c) => (
          <p key={c} className="text-sm text-texto-secundario">
            Condición de uso: {c}.
          </p>
        ))}
      </Seccion>

      <Seccion id="enlaces" titulo="Enlaces externos">
        <p>
          La ficha de cada Pokémon, cada lugar y cada región enlaza a su artículo de{" "}
          <Fuera href="https://www.wikidex.net">WikiDex</Fuera>, la enciclopedia Pokémon en español. Cada artículo se
          comprobó antes de enlazarlo: existe, no es una página de desambiguación y trata de ese Pokémon, lugar o región.
          Cuando no se pudo comprobar, el enlace dice «Buscar en WikiDex» y lleva a su buscador.
        </p>
      </Seccion>

      <Seccion id="aviso" titulo="Aviso">
        <p>
          Pokémon © Nintendo / Game Freak / Creatures. Pokedex+ es un proyecto universitario de la Universidad Santo Tomás
          (USTA), sin fines de lucro y sin relación con esas empresas.
        </p>
      </Seccion>
    </div>
  );
}

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section aria-labelledby={`titulo-${id}`} className="flex flex-col gap-3 leading-relaxed">
      <h2 id={`titulo-${id}`} className="text-xl font-bold">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

/** Enlace que sale del sitio (identidad, "Enlace externo"). `etiqueta` reemplaza el texto en el nombre accesible. */
function Fuera({ href, etiqueta, children }: { href: string; etiqueta?: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-acento underline underline-offset-2 hover:no-underline"
    >
      {etiqueta ? (
        <>
          <span aria-hidden="true">{children}</span>
          <span className="sr-only">{etiqueta}</span>
        </>
      ) : (
        children
      )}
      <span aria-hidden="true"> ↗</span>
      <span className="sr-only"> (se abre en otra pestaña, sitio externo)</span>
    </a>
  );
}
