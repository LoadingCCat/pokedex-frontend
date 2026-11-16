import type { ComponentProps } from "react";

/** Panel con fondo blanco, borde suave y radio de 8 px (sin sombra). */
export default function Tarjeta({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`rounded-lg border border-borde-suave bg-superficie ${className}`.trim()} {...props} />;
}
