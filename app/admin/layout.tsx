import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import AvisoSinApi from "@/components/admin/AvisoSinApi";
import BotonCerrarSesion from "@/components/admin/BotonCerrarSesion";
import Esqueleto from "@/components/ui/Esqueleto";
import { leerSesion } from "@/lib/sesion";
import { adminDisponible } from "@/lib/sesion-comun";

export const metadata: Metadata = {
  title: { default: "Administración", template: "%s · Administración · Pokedex+" },
  robots: { index: false },
};

const SECCIONES = [
  { href: "/admin/pokemon", etiqueta: "Pokémon" },
  { href: "/admin/movimientos", etiqueta: "Movimientos" },
  { href: "/admin/rutas", etiqueta: "Rutas" },
] as const;

/**
 * P8 · Panel (docs/pantallas.md). proxy.ts ya redirige sin cookie; aquí se vuelve a leer la
 * sesión (por si el token venció) antes de mostrar nada. Sin API, solo el aviso.
 */
export default function LayoutAdmin({ children }: LayoutProps<"/admin">) {
  if (!adminDisponible()) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold sm:text-4xl">Administración</h1>
        <AvisoSinApi />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={<Esqueleto className="h-24 w-full rounded-lg" />}>
        <BarraAdmin />
      </Suspense>
      {children}
    </div>
  );
}

async function BarraAdmin() {
  const sesion = await leerSesion();
  if (!sesion) redirect("/login?volver=/admin");
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-borde-suave bg-superficie p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <nav aria-label="Secciones del panel">
        <ul className="flex flex-wrap gap-x-1 gap-y-1">
          <li>
            <Link href="/admin" className="inline-flex min-h-10 items-center rounded-md px-3 text-sm font-semibold text-texto hover:bg-fondo">
              Panel
            </Link>
          </li>
          {SECCIONES.map((s) => (
            <li key={s.href}>
              <Link href={s.href} className="inline-flex min-h-10 items-center rounded-md px-3 text-sm font-semibold text-acento underline underline-offset-2 hover:bg-fondo">
                {s.etiqueta}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <p className="text-sm text-texto-secundario">
          Sesión: <span className="font-semibold text-texto">{sesion.usuario}</span>
        </p>
        <BotonCerrarSesion />
      </div>
    </div>
  );
}
