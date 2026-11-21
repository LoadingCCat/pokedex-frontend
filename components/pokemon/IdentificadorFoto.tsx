"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { enviarFoto, ErrorIdentificar } from "@/lib/identificar-foto";
import { mensajeDeIdentificacion } from "@/lib/identificar-mensajes";
import { ESPERA_LENTA_MS, ESTADO_INICIAL, reductorIdentificar } from "@/lib/identificar-estado";
import { ErrorFoto, reducirFoto } from "@/lib/reducir-foto";
import PanelIdentificar from "./PanelIdentificar";

/**
 * F20: flujo de /identificar. Elegir foto → reducirla en el navegador → enviarla a
 * /api/identificar → mostrar el resultado o el error. Solo aquí hay estado y efectos.
 */
export default function IdentificadorFoto() {
  const [estado, despachar] = useReducer(reductorIdentificar, ESTADO_INICIAL);
  const [foto, setFoto] = useState<{ archivo: File; vista: string } | null>(null);
  const peticion = useRef<AbortController | null>(null);
  const vistaActual = useRef<string | null>(null);
  const primerBoton = useRef<HTMLButtonElement>(null);
  const tituloResultado = useRef<HTMLHeadingElement>(null);
  const botonReintento = useRef<HTMLButtonElement>(null);

  const analizando = estado.fase === "analizando";

  // Pasados 5 s analizando, avisa de que el servidor puede estar despertando
  useEffect(() => {
    if (!analizando) return;
    const temporizador = setTimeout(() => despachar({ tipo: "lento" }), ESPERA_LENTA_MS);
    return () => clearTimeout(temporizador);
  }, [analizando]);

  // Al desmontar: cancela la petición en curso y libera la vista previa
  useEffect(
    () => () => {
      peticion.current?.abort();
      if (vistaActual.current) URL.revokeObjectURL(vistaActual.current);
    },
    [],
  );

  // El foco sigue al contenido nuevo (el botón que lo tenía desaparece): al resultado o al reintento
  useEffect(() => {
    if (estado.fase === "resultado") tituloResultado.current?.focus();
    if (estado.fase === "error") botonReintento.current?.focus();
  }, [estado.fase]);

  function elegir(archivo: File) {
    if (analizando) return;
    if (vistaActual.current) URL.revokeObjectURL(vistaActual.current);
    const vista = URL.createObjectURL(archivo);
    vistaActual.current = vista;
    setFoto({ archivo, vista });
    despachar({ tipo: "elegir" }); // vuelve a inactivo: limpia el resultado o el error anterior
  }

  async function identificar() {
    // peticion.current cubre el doble clic antes de que React pinte el botón deshabilitado
    if (!foto || peticion.current) return;
    const controlador = new AbortController();
    peticion.current = controlador;
    despachar({ tipo: "analizar" });
    try {
      const reducida = await reducirFoto(foto.archivo);
      if (controlador.signal.aborted) return;
      const datos = await enviarFoto(reducida, controlador.signal);
      despachar({ tipo: "exito", datos });
    } catch (e) {
      if (controlador.signal.aborted) return;
      const mensaje =
        e instanceof ErrorFoto || e instanceof ErrorIdentificar ? e.message : mensajeDeIdentificacion(502);
      despachar({ tipo: "fallo", mensaje });
    } finally {
      if (peticion.current === controlador) peticion.current = null;
    }
  }

  function otraFoto() {
    despachar({ tipo: "reiniciar" });
    // El selector aparece en el siguiente render: el foco vuelve a su primer botón
    setTimeout(() => primerBoton.current?.focus(), 0);
  }

  return (
    <PanelIdentificar
      estado={estado}
      vistaPrevia={foto?.vista ?? null}
      hayFoto={foto !== null}
      onElegir={elegir}
      onIdentificar={identificar}
      onOtraFoto={otraFoto}
      refPrimerBoton={primerBoton}
      refTituloResultado={tituloResultado}
      refReintento={botonReintento}
    />
  );
}
