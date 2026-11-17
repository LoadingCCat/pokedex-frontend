import type { Movimiento } from "@/lib/api/tipos";
import { nombreVisible } from "@/lib/formato";
import { infoTipo } from "@/lib/tipos-pokemon";
import DiscoMovimiento from "./DiscoMovimiento";
import InsigniaTipo from "./InsigniaTipo";

/**
 * Tabla de movimientos: disco de MT + nombre, tipo, categoría, potencia y competitivo. El tipo, la
 * categoría y el "competitivo" se leen como texto, no solo por color (el disco es decorativo).
 * En móvil las columnas Tipo y Competitivo se ocultan y van en texto pequeño bajo el nombre
 * ("Eléctrico · Competitivo"), para que la tabla quepa a 390 px sin desplazarse.
 */
export default function TablaMovimientos({ movimientos, titulo }: { movimientos: Movimiento[]; titulo: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-borde-suave bg-superficie">
      <table className="w-full text-left text-sm [&_td]:px-2 [&_th]:px-2 sm:[&_td]:px-3 sm:[&_th]:px-3">
        <caption className="sr-only">{titulo}</caption>
        <thead>
          <tr className="border-b border-borde-suave text-xs text-texto-secundario">
            <th scope="col" className="px-3 py-2 font-semibold">Nombre</th>
            <th scope="col" className="hidden px-3 py-2 font-semibold sm:table-cell">Tipo</th>
            <th scope="col" className="px-3 py-2 font-semibold">Categoría</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">Potencia</th>
            <th scope="col" className="hidden px-3 py-2 font-semibold sm:table-cell">Competitivo</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m) => (
            <tr key={m.idMovimiento} className="border-b border-borde-suave last:border-b-0">
              <th scope="row" className="px-3 py-2 font-medium">
                <span className="flex items-center gap-1.5 sm:gap-2">
                  <DiscoMovimiento tipo={m.tipo} />
                  <span className="flex flex-col">
                    {nombreVisible(m)}
                    <span className="text-xs font-normal text-texto-secundario sm:hidden">
                      {m.tipo ? infoTipo(m.tipo).etiqueta : "Sin tipo"}
                      {m.esCompetitivo && <span className="font-semibold text-exito"> · Competitivo</span>}
                    </span>
                  </span>
                </span>
              </th>
              <td className="hidden px-3 py-2 sm:table-cell">
                {m.tipo ? <InsigniaTipo tipo={m.tipo} /> : <span aria-label="Sin tipo">—</span>}
              </td>
              <td className="px-3 py-2">
                <EtiquetaCategoria categoria={m.categoria} />
              </td>
              <td className="px-3 py-2 text-right font-datos tabular-nums">
                {m.potencia ? m.potencia : <span aria-label="Sin potencia">—</span>}
              </td>
              <td className="hidden px-3 py-2 sm:table-cell">
                {m.esCompetitivo ? (
                  <span className="font-semibold text-exito">Sí</span>
                ) : (
                  <span className="text-texto-secundario">No</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EtiquetaCategoria({ categoria }: { categoria: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-borde px-2 py-0.5 text-xs font-medium">
      {categoria}
    </span>
  );
}
