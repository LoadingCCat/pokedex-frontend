"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import { clasesBoton } from "@/components/ui/Boton";

/** ¿El navegador reproduce OGG Vorbis? En el servidor se responde que no (no se pinta el botón). */
function reproduceOgg(): boolean {
  return new Audio().canPlayType('audio/ogg; codecs="vorbis"') !== "";
}
const sinSuscripcion = () => () => {};

type Estado = "listo" | "sonando" | "error";

/**
 * Botón "Escuchar": reproduce el grito del Pokémon (repo PokeAPI/cries) solo al pulsarlo,
 * a volumen 50 %. Si el navegador no reproduce OGG, no aparece (identidad-visual.md).
 */
export default function BotonGrito({ src, nombre }: { src: string; nombre: string }) {
  const soportado = useSyncExternalStore(sinSuscripcion, reproduceOgg, () => false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const [estado, setEstado] = useState<Estado>("listo");

  if (!soportado) return null;

  function escuchar() {
    if (!audio.current) {
      audio.current = new Audio(src);
      audio.current.volume = 0.5;
      audio.current.addEventListener("ended", () => setEstado("listo"));
    }
    audio.current.currentTime = 0;
    audio.current
      .play()
      .then(() => setEstado("sonando"))
      .catch(() => setEstado("error"));
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button type="button" onClick={escuchar} className={clasesBoton("secundario")}>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H3v6h3l5 4V5Z" />
          <path d="M15.5 8.5a5 5 0 0 1 0 7" />
          <path d="M18.5 5.5a9 9 0 0 1 0 13" />
        </svg>
        {estado === "sonando" ? "Sonando…" : "Escuchar"}
        <span className="sr-only"> el grito de {nombre}</span>
      </button>
      <p aria-live="polite" className="text-xs text-error">
        {estado === "error" ? "No se pudo reproducir el grito." : ""}
      </p>
    </div>
  );
}
