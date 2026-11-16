"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { clasesBoton } from "@/components/ui/Boton";
import { VISTAS_MOVIMIENTO, hrefMovimientos, type EstadoMovimientos } from "@/lib/parametros-movimientos";

const CAMPO = "min-h-11 w-full rounded-md border border-borde bg-superficie px-3 text-sm text-texto sm:min-h-10";
const ETIQUETA = "text-xs font-semibold text-texto-secundario";

/**
 * Buscador y selector de vista de /movimientos. La API no combina búsqueda y vista: buscar
 * por nombre vuelve a "Todos" y elegir una vista borra el nombre. Sin JavaScript funciona
 * como un GET normal (el servidor da prioridad al nombre).
 * Se monta con `key` = URL actual para que los valores sigan a la URL.
 */
export default function FiltrosMovimientos({ estado }: { estado: EstadoMovimientos }) {
  const router = useRouter();
  const [cargando, iniciarTransicion] = useTransition();
  const ir = (href: string) => iniciarTransicion(() => router.push(href, { scroll: false }));

  return (
    <form
      action="/movimientos"
      method="get"
      role="search"
      aria-label="Buscar movimientos"
      aria-busy={cargando}
      onSubmit={(e) => {
        e.preventDefault();
        const nombre = String(new FormData(e.currentTarget).get("nombre") ?? "").trim();
        ir(hrefMovimientos({ pagina: 1 }, { nombre: nombre || undefined }));
      }}
      className="grid gap-3 rounded-lg border border-borde-suave bg-superficie p-3 sm:p-4 md:grid-cols-[1fr_16rem]"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="mov-nombre" className={ETIQUETA}>
          Nombre
        </label>
        <div className="flex gap-2">
          <input
            id="mov-nombre"
            name="nombre"
            type="search"
            defaultValue={estado.nombre ?? ""}
            placeholder="Ej.: puño trueno, psíquico…"
            autoComplete="off"
            className={CAMPO}
          />
          <button type="submit" className={clasesBoton("principal", "shrink-0")}>
            {cargando ? "Buscando…" : "Buscar"}
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="mov-vista" className={ETIQUETA}>
          Mostrar
        </label>
        <select
          id="mov-vista"
          name="vista"
          defaultValue={estado.vista ?? ""}
          onChange={(e) => ir(hrefMovimientos({ pagina: 1 }, { vista: e.target.value || undefined }))}
          className={CAMPO}
        >
          {VISTAS_MOVIMIENTO.map((v) => (
            <option key={v.valor} value={v.valor}>
              {v.etiqueta}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
}
