"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";
import Boton from "@/components/ui/Boton";
import { AvisoFormulario } from "@/components/ui/Campo";
import { hrefConAviso } from "@/lib/avisos-admin";
import type { ResultadoAccion } from "@/lib/validacion-admin";

/**
 * P8 punto 3: "Eliminar" con un diálogo modal accesible (<dialog>, Escape lo cierra) y el foco
 * en "Cancelar". `accion` es la server action ya ligada al id. Al terminar, vuelve al listado
 * con el aviso de confirmación.
 */
export default function BotonEliminar({
  nombre,
  accion,
  listado,
}: {
  nombre: string;
  accion: () => Promise<ResultadoAccion>;
  listado: string;
}) {
  const router = useRouter();
  const dialogo = useRef<HTMLDialogElement>(null);
  const cancelar = useRef<HTMLButtonElement>(null);
  const idTitulo = useId();
  const [error, setError] = useState<string>();
  const [pendiente, iniciar] = useTransition();

  function abrir() {
    setError(undefined);
    dialogo.current?.showModal();
    cancelar.current?.focus();
  }

  function confirmar() {
    iniciar(async () => {
      const r = await accion();
      if (r.ok) {
        dialogo.current?.close();
        router.replace(hrefConAviso(listado, "eliminado", nombre));
      } else {
        setError(r.mensaje);
      }
    });
  }

  return (
    <>
      <Boton onClick={abrir} className="px-3 text-error" aria-haspopup="dialog">
        Eliminar<span className="sr-only"> {nombre}</span>
      </Boton>
      <dialog
        ref={dialogo}
        aria-labelledby={idTitulo}
        className="m-auto w-[min(28rem,calc(100vw-2rem))] rounded-lg border border-borde bg-superficie p-5 text-texto backdrop:bg-texto/50"
      >
        <h2 id={idTitulo} className="font-titulo text-lg font-semibold">
          ¿Eliminar {nombre}?
        </h2>
        <p className="mt-2 text-sm text-texto-secundario">Esta acción no se puede deshacer.</p>
        <div className="mt-3">
          <AvisoFormulario mensaje={error} />
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Boton ref={cancelar} onClick={() => dialogo.current?.close()} disabled={pendiente}>
            Cancelar
          </Boton>
          <Boton variante="principal" onClick={confirmar} disabled={pendiente} aria-busy={pendiente}>
            {pendiente ? "Eliminando…" : "Eliminar"}
          </Boton>
        </div>
      </dialog>
    </>
  );
}
