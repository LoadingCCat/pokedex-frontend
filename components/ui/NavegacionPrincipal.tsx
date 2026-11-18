"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ENLACES_PRINCIPALES, esEnlaceActivo } from "./enlaces-principales";

/** Navegación con la sección activa marcada (subrayado + peso, no solo color). */
export default function NavegacionPrincipal() {
  const ruta = usePathname();
  return <ListaEnlaces ruta={ruta} />;
}

/** Sin `ruta` (mientras se resuelve la URL) no marca ninguna sección. */
export function ListaEnlaces({ ruta }: { ruta?: string }) {
  return (
    <nav aria-label="Principal">
      <ul className="flex flex-wrap gap-x-0.5 sm:gap-x-2">
        {ENLACES_PRINCIPALES.map(({ href, etiqueta }) => {
          const activo = ruta !== undefined && esEnlaceActivo(href, ruta);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={activo ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-md px-2 text-sm transition-colors sm:min-h-10 sm:px-3 ${
                  activo
                    ? "font-semibold text-texto underline decoration-primario decoration-2 underline-offset-8"
                    : "font-medium text-texto-secundario hover:bg-fondo hover:text-texto"
                }`}
              >
                {etiqueta}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
