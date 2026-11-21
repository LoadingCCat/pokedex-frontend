"use client";

import { useId, useState, type ChangeEvent, type Ref } from "react";
import { clasesBoton } from "@/components/ui/Boton";

/**
 * F20: dos formas de dar la foto: cámara trasera del celular (`capture="environment"`) o un
 * archivo de la galería. Cada opción es un `<label htmlFor>` de su `<input type="file">`, así el
 * selector se abre de forma nativa (también en iOS Safari, que ignora `input.click()` en
 * algunos casos). El input queda visualmente oculto pero sigue siendo enfocable: con el teclado
 * se llega a él con Tab y Enter o Espacio abren el selector; el foco se dibuja en la etiqueta.
 * En un ordenador, «Tomar foto» abre el selector de archivos.
 */
export default function SelectorFoto({
  vistaPrevia,
  deshabilitado,
  onElegir,
  refPrimerControl,
}: {
  /** URL (blob:) de la foto elegida, o null si todavía no hay */
  vistaPrevia: string | null;
  deshabilitado: boolean;
  onElegir: (archivo: File) => void;
  /** El primer control (cámara): el foco vuelve ahí al reintentar */
  refPrimerControl?: Ref<HTMLInputElement>;
}) {
  const idCamara = useId();
  const idGaleria = useId();
  const [vistaFallida, setVistaFallida] = useState<string | null>(null);

  function alElegir(e: ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite elegir la misma foto otra vez
    if (archivo) onElegir(archivo);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <OpcionFoto
          id={idCamara}
          etiqueta="Tomar foto"
          camara
          deshabilitado={deshabilitado}
          onChange={alElegir}
          refInput={refPrimerControl}
        />
        <OpcionFoto id={idGaleria} etiqueta="Elegir de la galería" deshabilitado={deshabilitado} onChange={alElegir} />
      </div>
      {vistaPrevia &&
        (vistaFallida === vistaPrevia ? (
          <p className="text-sm text-texto-secundario">
            No se puede mostrar la vista previa de esta foto. Puedes intentar identificarla igual.
          </p>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- blob: local, next/image no aplica
          <img
            src={vistaPrevia}
            alt="Vista previa de la foto elegida"
            onError={() => setVistaFallida(vistaPrevia)}
            className="max-h-72 w-full rounded-lg border border-borde-suave bg-superficie object-contain sm:max-w-sm"
          />
        ))}
    </div>
  );
}

function OpcionFoto({
  id,
  etiqueta,
  camara = false,
  deshabilitado,
  onChange,
  refInput,
}: {
  id: string;
  etiqueta: string;
  camara?: boolean;
  deshabilitado: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  refInput?: Ref<HTMLInputElement>;
}) {
  return (
    <div className="relative">
      {/* El input va antes de su etiqueta para que `peer-*` pinte el foco y el estado deshabilitado en ella */}
      <input
        ref={refInput}
        id={id}
        type="file"
        accept="image/*"
        capture={camara ? "environment" : undefined}
        disabled={deshabilitado}
        onChange={onChange}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className={clasesBoton(
          "secundario",
          "w-full cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-acento peer-disabled:cursor-not-allowed peer-disabled:opacity-50 sm:w-auto",
        )}
      >
        {etiqueta}
      </label>
    </div>
  );
}
