import Link from "next/link";
import { Suspense } from "react";
import NavegacionPrincipal, { ListaEnlaces } from "./NavegacionPrincipal";

export default function Cabecera() {
  return (
    <header className="border-b border-borde-suave bg-superficie">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-10 focus:rounded-md focus:bg-superficie focus:px-3 focus:py-2"
      >
        Saltar al contenido
      </a>
      <div className="mx-auto flex w-full max-w-[75rem] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-6">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-md font-titulo text-xl font-bold tracking-tight text-primario"
        >
          Pokedex+
        </Link>
        {/* Con cacheComponents, usePathname puede suspender en rutas dinámicas */}
        <Suspense fallback={<ListaEnlaces />}>
          <NavegacionPrincipal />
        </Suspense>
      </div>
    </header>
  );
}
