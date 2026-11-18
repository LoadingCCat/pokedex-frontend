import type { ReactNode } from "react";

/**
 * Fila de un listado del panel: datos a la izquierda y acciones a la derecha. Es una lista y no
 * una tabla para que a 360 px las acciones bajen de línea sin scroll horizontal.
 */
export default function FilaAdmin({ children, acciones }: { children: ReactNode; acciones: ReactNode }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-borde-suave px-1 py-3 last:border-b-0">
      <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">{children}</div>
      <div className="flex shrink-0 gap-2">{acciones}</div>
    </li>
  );
}
