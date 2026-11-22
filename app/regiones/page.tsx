import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import Esqueleto from "@/components/ui/Esqueleto";
import { mapaDeRegion } from "@/lib/imagenes";
import EstadoVacio from "@/components/ui/EstadoVacio";
import { listarRegiones, rutasDeRegion } from "@/lib/api";

export const metadata: Metadata = {
  title: "Regiones",
};

/** P4 · Regiones (docs/pantallas.md): las 9 regiones de origen, en orden de generación. */
export default function Regiones() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold sm:text-4xl">Regiones</h1>
        <p className="text-texto-secundario">Las 9 regiones de origen y los lugares de los juegos donde aparecen Pokémon salvajes.</p>
      </header>
      <Suspense fallback={<RegionesEsqueleto />}>
        <ListaRegiones />
      </Suspense>
    </div>
  );
}

function RegionesEsqueleto() {
  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Cargando las regiones">
      {Array.from({ length: 9 }, (_, i) => (
        <li key={i}>
          <Esqueleto className="h-48 w-full" />
        </li>
      ))}
    </ol>
  );
}

async function ListaRegiones() {
  let regiones: { nombre: string; rutas: number }[];
  try {
    const nombres = await listarRegiones();
    regiones = await Promise.all(
      nombres.map(async (nombre) => ({
        nombre,
        rutas: (await rutasDeRegion(nombre, { size: 1 })).page.totalElements,
      })),
    );
  } catch (error) {
    console.error("No se pudieron cargar las regiones", error);
    return <EstadoVacio tipo="error" titulo="No se pudieron cargar las regiones." mensaje="Vuelve a intentarlo en unos segundos." />;
  }

  return (
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {regiones.map(({ nombre, rutas }, i) => {
        const mapa = mapaDeRegion(nombre);
        return (
        <li key={nombre}>
          <Link
            href={`/regiones/${nombre.toLowerCase()}`}
            className="flex h-full flex-col gap-1 rounded-lg border border-borde-suave bg-superficie p-4 transition-colors hover:border-acento"
          >
            {/* Miniatura decorativa (alt vacío): el nombre de la región ya está en el enlace */}
            {mapa && (
              <Image
                src={mapa.archivo}
                alt=""
                width={mapa.ancho}
                height={mapa.alto}
                sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
                className="mb-2 aspect-[16/10] w-full rounded-md border border-borde-suave bg-fondo object-cover"
              />
            )}
            <span className="font-datos text-xs text-texto-secundario">Generación {i + 1}</span>
            <span className="font-titulo text-xl font-bold">{nombre}</span>
            <span className="text-sm text-texto-secundario">
              {rutas === 0 ? (
                "Sin lugares registrados en la PokeAPI"
              ) : (
                <>
                  <span className="font-datos tabular-nums text-texto">{rutas}</span> {rutas === 1 ? "lugar" : "lugares"}
                </>
              )}
            </span>
          </Link>
        </li>
        );
      })}
    </ol>
  );
}
