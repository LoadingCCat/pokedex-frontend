"use client";

import { guardarMovimiento } from "@/app/admin/acciones";
import { EnlaceBoton, clasesBoton } from "@/components/ui/Boton";
import Campo, { AvisoFormulario } from "@/components/ui/Campo";
import { CATEGORIAS_MOVIMIENTO, type Movimiento, type Tipo } from "@/lib/api/tipos";
import { infoTipo } from "@/lib/tipos-pokemon";
import { validarMovimiento, type ValoresMovimiento } from "@/lib/validacion-admin";
import CampoSelect from "./CampoSelect";
import { useEnvioFormulario } from "./useEnvioFormulario";

function leer(datos: FormData): ValoresMovimiento {
  const v = (campo: string) => String(datos.get(campo) ?? "");
  return { nombre: v("nombre"), nombreEs: v("nombreEs"), tipo: v("tipo"), categoria: v("categoria"), potencia: v("potencia") };
}

/**
 * P8 · Formulario de movimiento: crear (movimiento = null) o editar. La precisión llega con F12
 * (B.35): el backend todavía no tiene ese campo.
 */
export default function FormularioMovimiento({ movimiento, tipos }: { movimiento: Movimiento | null; tipos: Tipo[] }) {
  const creando = movimiento === null;
  const { formulario, errores, general, pendiente, alEnviar } = useEnvioFormulario({
    leer,
    validar: validarMovimiento,
    guardar: (cuerpo) => guardarMovimiento(movimiento?.idMovimiento ?? null, cuerpo),
    listado: "/admin/movimientos",
    nombreGuardado: (v) => v.nombreEs.trim() || v.nombre.trim(),
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
      <Campo
        id="mv-nombre"
        name="nombre"
        etiqueta="Identificador"
        ayuda="Nombre en inglés, por ejemplo thunder-punch."
        autoCapitalize="none"
        spellCheck={false}
        defaultValue={movimiento?.nombre ?? ""}
        error={errores.nombre}
      />
      <Campo id="mv-nombreEs" name="nombreEs" etiqueta="Nombre en español (opcional)" defaultValue={movimiento?.nombreEs ?? ""} error={errores.nombreEs} />
      <CampoSelect
        id="mv-tipo"
        name="tipo"
        etiqueta="Tipo (opcional)"
        vacio="Sin tipo"
        opciones={tipos.map((t) => ({ valor: t.nombre, etiqueta: infoTipo(t.nombre).etiqueta }))}
        defaultValue={movimiento?.tipo ?? ""}
        error={errores.tipo}
      />
      <CampoSelect
        id="mv-categoria"
        name="categoria"
        etiqueta="Categoría"
        vacio="Elige…"
        opciones={CATEGORIAS_MOVIMIENTO.map((c) => ({ valor: c, etiqueta: c }))}
        defaultValue={movimiento?.categoria ?? ""}
        error={errores.categoria}
      />
      <Campo
        id="mv-potencia"
        name="potencia"
        etiqueta="Potencia"
        inputMode="numeric"
        ayuda="Vacío = 0 (movimientos de estado). Más de 80 lo marca como competitivo."
        defaultValue={movimiento?.potencia == null ? "" : String(movimiento.potencia)}
        error={errores.potencia}
      />
      <div className="flex flex-wrap items-end justify-end gap-2 sm:col-span-2">
        <EnlaceBoton href="/admin/movimientos">Cancelar</EnlaceBoton>
        <button type="submit" disabled={pendiente} className={clasesBoton("principal")}>
          {pendiente ? "Guardando…" : creando ? "Crear movimiento" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
