"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { TIPOS_OBTENCION } from "@/lib/api/tipos";
import {
  OPCIONES_ORDEN,
  hrefCatalogo,
  obtencionEnUrl,
  obtencionOficial,
  type EstadoCatalogo,
} from "@/lib/parametros-catalogo";
import { clasesBoton } from "@/components/ui/Boton";

type Opcion = { valor: string; etiqueta: string };

const CAMPO =
  "min-h-11 w-full rounded-md border border-borde bg-superficie px-3 text-sm text-texto sm:min-h-10";
const ETIQUETA = "text-xs font-semibold text-texto-secundario";

/**
 * Buscador, filtros y orden del catálogo. Actualiza la URL (sin parámetros vacíos y
 * volviendo a la página 1); los desplegables se aplican al cambiar y el nombre al pulsar
 * Enter o "Buscar". Sin JavaScript, el formulario funciona como un GET normal a "/".
 * Se monta con `key` = URL actual para que los valores sigan a la URL al navegar.
 * En móvil, todo menos el buscador va tras el botón "Filtros (n)" (abierto si hay filtros
 * activos); sin JavaScript (`html[data-js]` sin poner) el panel queda siempre a la vista.
 */
export default function FiltrosCatalogo({
  estado,
  tipos,
  regiones,
}: {
  estado: EstadoCatalogo;
  tipos: Opcion[];
  regiones: Opcion[];
}) {
  const router = useRouter();
  const [cargando, iniciarTransicion] = useTransition();
  const activos = [estado.generacion, estado.tipo, estado.region, estado.obtencion].filter(Boolean).length;
  const [abierto, setAbierto] = useState(activos > 0);

  function aplicar(formulario: HTMLFormElement) {
    const datos = new FormData(formulario);
    const texto = (clave: string) => String(datos.get(clave) ?? "").trim() || undefined;
    const generacion = Number(texto("generacion"));
    const href = hrefCatalogo({
      nombre: texto("nombre"),
      generacion: generacion || undefined,
      tipo: texto("tipo"),
      region: texto("region"),
      obtencion: obtencionOficial(texto("obtencion")?.replace(/-/g, " ")),
      sort: texto("sort"),
      pagina: 1,
    });
    iniciarTransicion(() => router.push(href, { scroll: false }));
  }

  function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    aplicar(evento.currentTarget);
  }

  return (
    <form
      action="/"
      method="get"
      role="search"
      aria-label="Buscar y filtrar Pokémon"
      aria-busy={cargando}
      onSubmit={alEnviar}
      onChange={(e) => {
        if (e.target instanceof HTMLSelectElement) aplicar(e.currentTarget);
      }}
      className="flex flex-col gap-3 rounded-lg border border-borde-suave bg-superficie p-3 sm:p-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="filtro-nombre" className={ETIQUETA}>
          Nombre
        </label>
        <div className="flex gap-2">
          <input
            id="filtro-nombre"
            name="nombre"
            type="search"
            defaultValue={estado.nombre ?? ""}
            placeholder="Ej.: pikachu, charmander…"
            autoComplete="off"
            className={CAMPO}
          />
          <button type="submit" className={clasesBoton("principal", "shrink-0")}>
            {cargando ? "Buscando…" : "Buscar"}
          </button>
        </div>
      </div>

      <button
        type="button"
        aria-expanded={abierto}
        aria-controls="panel-filtros"
        onClick={() => setAbierto((a) => !a)}
        className={clasesBoton("secundario", "w-full md:hidden [html:not([data-js])_&]:hidden")}
      >
        <span>
          Filtros{" "}
          <span className="font-datos tabular-nums">({activos})</span>
        </span>
        <span aria-hidden="true" className={abierto ? "rotate-180" : ""}>
          ▾
        </span>
      </button>

      <div
        id="panel-filtros"
        className={`grid grid-cols-2 gap-3 md:grid-cols-5 ${abierto ? "" : "[html[data-js]_&]:max-md:hidden"}`}
      >
        <Selector id="filtro-generacion" nombre="generacion" etiqueta="Generación" valor={estado.generacion ? String(estado.generacion) : ""}>
          <option value="">Todas</option>
          {Array.from({ length: 9 }, (_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              Generación {i + 1}
            </option>
          ))}
        </Selector>
        <Selector id="filtro-tipo" nombre="tipo" etiqueta="Tipo" valor={estado.tipo ?? ""}>
          <option value="">Todos</option>
          {tipos.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.etiqueta}
            </option>
          ))}
        </Selector>
        <Selector id="filtro-region" nombre="region" etiqueta="Región" valor={estado.region ?? ""}>
          <option value="">Todas</option>
          {regiones.map((r) => (
            <option key={r.valor} value={r.valor}>
              {r.etiqueta}
            </option>
          ))}
        </Selector>
        <Selector
          id="filtro-obtencion"
          nombre="obtencion"
          etiqueta="Obtención"
          valor={estado.obtencion ? obtencionEnUrl(estado.obtencion) : ""}
        >
          <option value="">Todas</option>
          {TIPOS_OBTENCION.map((o) => (
            <option key={o} value={obtencionEnUrl(o)}>
              {o}
            </option>
          ))}
        </Selector>
        <Selector id="filtro-orden" nombre="sort" etiqueta="Ordenar por" valor={estado.sort ?? ""} className="col-span-2 md:col-span-1">
          {OPCIONES_ORDEN.map((o) => (
            <option key={o.valor} value={o.valor}>
              {o.etiqueta}
            </option>
          ))}
        </Selector>
      </div>
    </form>
  );
}

function Selector({
  id,
  nombre,
  etiqueta,
  valor,
  className = "",
  children,
}: {
  id: string;
  nombre: string;
  etiqueta: string;
  valor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className={ETIQUETA}>
        {etiqueta}
      </label>
      <select id={id} name={nombre} defaultValue={valor} className={CAMPO}>
        {children}
      </select>
    </div>
  );
}
