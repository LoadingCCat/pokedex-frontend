import Link from "next/link";
import Tarjeta from "@/components/ui/Tarjeta";

const SECCIONES = [
  { href: "/admin/pokemon", titulo: "Pokémon", texto: "Edita nombre, estadísticas, tipos, lugares y forma de obtención; crea o elimina Pokémon." },
  { href: "/admin/movimientos", titulo: "Movimientos", texto: "Crea, edita o elimina movimientos: nombre, tipo, categoría y potencia." },
  { href: "/admin/rutas", titulo: "Rutas", texto: "Crea, edita o elimina lugares. Al eliminar uno, deja de aparecer en las fichas." },
] as const;

/** P8 · Portada del panel: las tres secciones. Solo se ve con API (el layout pone el aviso si no). */
export default function PanelAdmin() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold sm:text-4xl">Administración</h1>
        <p className="text-texto-secundario">
          Los cambios se guardan en la base de datos local y la reimportación desde la PokeAPI no los pisa.
        </p>
      </header>
      <ul className="grid gap-4 sm:grid-cols-3">
        {SECCIONES.map((s) => (
          <li key={s.href}>
            <Tarjeta className="h-full p-4">
              <h2 className="font-titulo text-xl font-semibold">
                <Link href={s.href} className="text-acento underline underline-offset-2 hover:no-underline">
                  {s.titulo}
                </Link>
              </h2>
              <p className="mt-2 text-sm text-texto-secundario">{s.texto}</p>
            </Tarjeta>
          </li>
        ))}
      </ul>
    </div>
  );
}
