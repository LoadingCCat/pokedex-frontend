"use client";

import { guardarRuta } from "@/app/admin/acciones";
import { EnlaceBoton, clasesBoton } from "@/components/ui/Boton";
import Campo, { AvisoFormulario } from "@/components/ui/Campo";
import type { Ruta } from "@/lib/api/tipos";
import { validarRuta, type ValoresRuta } from "@/lib/validacion-admin";
import CampoArea from "./CampoArea";
import CampoSelect from "./CampoSelect";
import { useEnvioFormulario } from "./useEnvioFormulario";

function leer(datos: FormData): ValoresRuta {
  const v = (campo: string) => String(datos.get(campo) ?? "");
  return { nombre: v("nombre"), region: v("region"), descripcion: v("descripcion") };
}

/** P8 · Formulario de ruta (lugar): crear (ruta = null) o editar. */
export default function FormularioRuta({
  ruta,
  regiones,
  regionInicial,
}: {
  ruta: Ruta | null;
  regiones: string[];
  regionInicial?: string;
}) {
  const creando = ruta === null;
  const { formulario, errores, general, pendiente, alEnviar } = useEnvioFormulario({
    leer,
    validar: validarRuta,
    guardar: (cuerpo) => guardarRuta(ruta?.idRuta ?? null, cuerpo),
    listado: "/admin/rutas",
    nombreGuardado: (v) => v.nombre.trim(),
    creando,
  });

  return (
    <form
      ref={formulario}
      noValidate
      onSubmit={alEnviar}
      aria-busy={pendiente}
      className="grid gap-4 rounded-lg border border-borde-suave bg-superficie p-4 sm:grid-cols-2 sm:p-6"
    >
      <div className="sm:col-span-2">
        <AvisoFormulario mensaje={general} />
      </div>
      <Campo id="rt-nombre" name="nombre" etiqueta="Nombre" defaultValue={ruta?.nombre ?? ""} error={errores.nombre} />
      <CampoSelect
        id="rt-region"
        name="region"
        etiqueta="Región"
        vacio="Elige…"
        opciones={regiones.map((r) => ({ valor: r, etiqueta: r }))}
        defaultValue={ruta?.region ?? regionInicial ?? ""}
        error={errores.region}
      />
      <CampoArea
        id="rt-descripcion"
        name="descripcion"
        etiqueta="Descripción (opcional)"
        defaultValue={ruta?.descripcion ?? ""}
        error={errores.descripcion}
        className="sm:col-span-2"
      />
      <div className="flex flex-wrap justify-end gap-2 sm:col-span-2">
        <EnlaceBoton href="/admin/rutas">Cancelar</EnlaceBoton>
        <button type="submit" disabled={pendiente} className={clasesBoton("principal")}>
          {pendiente ? "Guardando…" : creando ? "Crear ruta" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
