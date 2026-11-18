"use client";

import { guardarPokemon } from "@/app/admin/acciones";
import { EnlaceBoton, clasesBoton } from "@/components/ui/Boton";
import Campo, { AvisoFormulario } from "@/components/ui/Campo";
import type { Pokemon, Tipo } from "@/lib/api/tipos";
import { TIPOS_OBTENCION } from "@/lib/api/tipos";
import { infoTipo } from "@/lib/tipos-pokemon";
import { ESTADISTICAS_ADMIN, validarPokemon, type ValoresPokemon } from "@/lib/validacion-admin";
import CampoArea from "./CampoArea";
import CampoSelect from "./CampoSelect";
import { useEnvioFormulario } from "./useEnvioFormulario";

const texto = (valor: unknown) => (valor == null ? "" : String(valor));

function leer(datos: FormData): ValoresPokemon {
  const v = (campo: string) => String(datos.get(campo) ?? "");
  return {
    idPokedex: v("idPokedex"),
    nombre: v("nombre"),
    generacion: v("generacion"),
    nombreEs: v("nombreEs"),
    descripcion: v("descripcion"),
    tipoObtencion: v("tipoObtencion"),
    formaObtencion: v("formaObtencion"),
    altura: v("altura"),
    peso: v("peso"),
    tipo1: v("tipo1"),
    tipo2: v("tipo2"),
    rutas: v("rutas"),
    ps: v("ps"),
    ataque: v("ataque"),
    defensa: v("defensa"),
    ataqueEspecial: v("ataqueEspecial"),
    defensaEspecial: v("defensaEspecial"),
    velocidad: v("velocidad"),
  };
}

/** P8 · Formulario de Pokémon: crear (pokemon = null) o editar. */
export default function FormularioPokemon({ pokemon, tipos }: { pokemon: Pokemon | null; tipos: Tipo[] }) {
  const creando = pokemon === null;
  const { formulario, errores, general, pendiente, alEnviar } = useEnvioFormulario({
    leer,
    validar: (valores: ValoresPokemon) => validarPokemon(valores, creando),
    guardar: (cuerpo) => guardarPokemon(pokemon?.idPokedex ?? null, cuerpo),
    listado: "/admin/pokemon",
    nombreGuardado: (valores) => valores.nombreEs.trim(),
    creando,
  });
  const opcionesTipo = tipos.map((t) => ({ valor: t.nombre, etiqueta: infoTipo(t.nombre).etiqueta }));

  return (
    <form
      ref={formulario}
      noValidate
      onSubmit={alEnviar}
      aria-busy={pendiente}
      className="flex flex-col gap-6 rounded-lg border border-borde-suave bg-superficie p-4 sm:p-6"
    >
      <AvisoFormulario mensaje={general} />

      {creando && (
        <fieldset className="grid gap-4 sm:grid-cols-3">
          <legend className="mb-2 font-titulo text-lg font-semibold">Identificación</legend>
          <Campo id="pk-idPokedex" name="idPokedex" etiqueta="Número (Pokédex)" inputMode="numeric" error={errores.idPokedex} />
          <Campo
            id="pk-nombre"
            name="nombre"
            etiqueta="Identificador"
            ayuda="Minúsculas y guiones, por ejemplo mi-pokemon."
            autoCapitalize="none"
            spellCheck={false}
            error={errores.nombre}
          />
          <CampoSelect
            id="pk-generacion"
            name="generacion"
            etiqueta="Generación"
            vacio="Elige…"
            opciones={Array.from({ length: 9 }, (_, i) => ({ valor: String(i + 1), etiqueta: `Generación ${i + 1}` }))}
            error={errores.generacion}
          />
        </fieldset>
      )}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-titulo text-lg font-semibold">Datos</legend>
        <Campo id="pk-nombreEs" name="nombreEs" etiqueta="Nombre" defaultValue={texto(pokemon?.nombreEs)} error={errores.nombreEs} />
        <div className="grid grid-cols-2 gap-4">
          <Campo id="pk-altura" name="altura" etiqueta="Altura (m)" inputMode="decimal" defaultValue={texto(pokemon?.altura)} error={errores.altura} />
          <Campo id="pk-peso" name="peso" etiqueta="Peso (kg)" inputMode="decimal" defaultValue={texto(pokemon?.peso)} error={errores.peso} />
        </div>
        <CampoSelect
          id="pk-tipo1"
          name="tipo1"
          etiqueta="Tipo 1"
          vacio="Elige…"
          opciones={opcionesTipo}
          defaultValue={pokemon?.tipos[0]?.nombre ?? ""}
          error={errores.tipos}
        />
        <CampoSelect
          id="pk-tipo2"
          name="tipo2"
          etiqueta="Tipo 2 (opcional)"
          vacio="Ninguno"
          opciones={opcionesTipo}
          defaultValue={pokemon?.tipos[1]?.nombre ?? ""}
        />
        <CampoArea id="pk-descripcion" name="descripcion" etiqueta="Descripción" defaultValue={texto(pokemon?.descripcion)} error={errores.descripcion} className="sm:col-span-2" />
      </fieldset>

      <fieldset className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <legend className="mb-2 font-titulo text-lg font-semibold">Estadísticas base (1–255)</legend>
        {ESTADISTICAS_ADMIN.map(({ campo, etiqueta }) => (
          <Campo
            key={campo}
            id={`pk-${campo}`}
            name={campo}
            etiqueta={etiqueta}
            inputMode="numeric"
            defaultValue={texto(pokemon?.[campo])}
            error={errores[campo]}
          />
        ))}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-2 font-titulo text-lg font-semibold">Dónde se obtiene</legend>
        <CampoSelect
          id="pk-tipoObtencion"
          name="tipoObtencion"
          etiqueta="Forma de obtención"
          vacio="Elige…"
          opciones={TIPOS_OBTENCION.map((t) => ({ valor: t, etiqueta: t }))}
          defaultValue={pokemon?.tipoObtencion ?? ""}
          error={errores.tipoObtencion}
        />
        <Campo
          id="pk-rutas"
          name="rutas"
          etiqueta="Rutas (números, separados por comas)"
          ayuda={
            pokemon && pokemon.rutas.length > 0
              ? `Ahora: ${pokemon.rutas.map((r) => `${r.idRuta} ${r.nombre}`).join(", ")}.`
              : "El número de cada ruta sale en Administración › Rutas."
          }
          defaultValue={pokemon?.rutas.map((r) => r.idRuta).join(", ") ?? ""}
          error={errores.rutas}
        />
        <CampoArea
          id="pk-formaObtencion"
          name="formaObtencion"
          etiqueta="Cómo se obtiene"
          defaultValue={texto(pokemon?.formaObtencion)}
          error={errores.formaObtencion}
          className="sm:col-span-2"
        />
      </fieldset>

      <div className="flex flex-wrap justify-end gap-2">
        <EnlaceBoton href="/admin/pokemon">Cancelar</EnlaceBoton>
        <button type="submit" disabled={pendiente} className={clasesBoton("principal")}>
          {pendiente ? "Guardando…" : creando ? "Crear Pokémon" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
