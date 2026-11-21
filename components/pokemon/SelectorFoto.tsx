"use client";

import { useRef, useState, type Ref } from "react";
import Boton from "@/components/ui/Boton";

/**
 * F20: dos formas de dar la foto: cámara trasera del celular (`capture="environment"`) o un
 * archivo de la galería. Los inputs van ocultos y los dispara un botón, así se pueden recorrer
 * con el teclado. En un ordenador, "Tomar foto" abre el selector de archivos.
 */
export default function SelectorFoto({
  vistaPrevia,
  deshabilitado,
  onElegir,
  refPrimerBoton,
}: {
  /** URL (blob:) de la foto elegida, o null si todavía no hay */
  vistaPrevia: string | null;
  deshabilitado: boolean;
  onElegir: (archivo: File) => void;
  refPrimerBoton?: Ref<HTMLButtonElement>;
}) {
  const camara = useRef<HTMLInputElement>(null);
  const galeria = useRef<HTMLInputElement>(null);
  const [vistaFallida, setVistaFallida] = useState<string | null>(null);

  function alElegir(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    e.target.value = ""; // permite elegir la misma foto otra vez
    if (archivo) onElegir(archivo);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Boton ref={refPrimerBoton} disabled={deshabilitado} onClick={() => camara.current?.click()}>
          Tomar foto
        </Boton>
        <Boton disabled={deshabilitado} onClick={() => galeria.current?.click()}>
          Elegir de la galería
        </Boton>
      </div>
      <input
        ref={camara}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        tabIndex={-1}
        aria-label="Tomar una foto con la cámara"
        onChange={alElegir}
      />
      <input
        ref={galeria}
        type="file"
        accept="image/*"
        className="hidden"
        tabIndex={-1}
        aria-label="Elegir una foto de la galería"
        onChange={alElegir}
      />
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
