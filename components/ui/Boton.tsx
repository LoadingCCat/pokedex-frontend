import Link from "next/link";
import type { ComponentProps } from "react";

type Variante = "principal" | "secundario";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors sm:min-h-10 disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTES: Record<Variante, string> = {
  principal: "bg-primario text-white hover:bg-primario/90",
  secundario: "border border-borde bg-superficie text-texto hover:bg-fondo",
};

export function clasesBoton(variante: Variante = "secundario", extra = ""): string {
  return `${BASE} ${VARIANTES[variante]} ${extra}`.trim();
}

/** Botón para acciones. El principal (rojo) se usa una sola vez por vista. */
export default function Boton({
  variante = "secundario",
  className = "",
  type = "button",
  ...props
}: ComponentProps<"button"> & { variante?: Variante }) {
  return <button type={type} className={clasesBoton(variante, className)} {...props} />;
}

/** Enlace con aspecto de botón (para navegar, no para acciones). */
export function EnlaceBoton({
  variante = "secundario",
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variante?: Variante }) {
  return <Link className={clasesBoton(variante, className)} {...props} />;
}
