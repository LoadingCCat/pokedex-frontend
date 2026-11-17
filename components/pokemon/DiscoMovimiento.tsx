import { infoTipo } from "@/lib/tipos-pokemon";

/**
 * Disco de MT del color del tipo del movimiento (Fase 6; identidad, "Disco de MT"). Dibujo propio,
 * no el icono de los juegos. Decorativo: el tipo siempre se escribe al lado. Sin tipo, gris.
 */
export default function DiscoMovimiento({ tipo }: { tipo: string | null }) {
  const color = tipo ? infoTipo(tipo).fondo : "var(--color-borde)";
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-4 shrink-0 sm:size-5">
      <circle cx="12" cy="12" r="10.25" fill={color} stroke="var(--color-texto)" strokeWidth="1.5" />
      {/* Dos sectores de brillo opuestos, como la luz sobre un disco */}
      <path d="M12 12 L15.42 2.6 A10 10 0 0 1 20.66 7 Z M12 12 L8.58 21.4 A10 10 0 0 1 3.34 17 Z" fill="#FFFFFF" fillOpacity="0.55" />
      <circle cx="12" cy="12" r="5" fill="#FFFFFF" fillOpacity="0.35" />
      <circle cx="12" cy="12" r="2.5" fill="var(--color-superficie)" stroke="var(--color-texto)" strokeWidth="1" />
    </svg>
  );
}
