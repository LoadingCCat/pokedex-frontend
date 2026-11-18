"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition, type FormEvent } from "react";
import { hrefConAviso } from "@/lib/avisos-admin";
import type { Errores, ResultadoAccion, Validacion } from "@/lib/validacion-admin";

/**
 * Envío común de los formularios del panel (P8 puntos 5 y 6): valida en el cliente, pone el
 * foco en el primer campo con error, llama a la server action y muestra los `campos` del 400
 * junto a cada campo. Si sale bien, vuelve al listado con el aviso.
 */
export function useEnvioFormulario<V, C>({
  leer,
  validar,
  guardar,
  listado,
  nombreGuardado,
  creando,
}: {
  leer: (datos: FormData) => V;
  validar: (valores: V) => Validacion<C>;
  guardar: (cuerpo: C) => Promise<ResultadoAccion>;
  listado: string;
  nombreGuardado: (valores: V) => string;
  creando: boolean;
}) {
  const router = useRouter();
  const formulario = useRef<HTMLFormElement>(null);
  const [errores, setErrores] = useState<Errores>({});
  const [general, setGeneral] = useState<string>();
  const [pendiente, iniciar] = useTransition();

  function enfocarPrimerError() {
    requestAnimationFrame(() => {
      const campo = formulario.current?.querySelector<HTMLElement>("[aria-invalid=true]");
      (campo ?? formulario.current?.querySelector<HTMLElement>("[role=alert]"))?.focus();
    });
  }

  function alEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const valores = leer(new FormData(evento.currentTarget));
    const { errores: nuevos, cuerpo } = validar(valores);
    setErrores(nuevos);
    setGeneral(cuerpo ? undefined : "Revisa los campos marcados.");
    if (!cuerpo) {
      enfocarPrimerError();
      return;
    }
    iniciar(async () => {
      const r = await guardar(cuerpo);
      if (r.ok) {
        router.push(hrefConAviso(listado, creando ? "creado" : "guardado", nombreGuardado(valores)));
        return;
      }
      setErrores(r.campos ?? {});
      setGeneral(r.mensaje);
      enfocarPrimerError();
    });
  }

  return { formulario, errores, general, pendiente, alEnviar };
}
