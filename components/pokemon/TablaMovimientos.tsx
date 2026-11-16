import type { Movimiento } from "@/lib/api/tipos";
import { nombreVisible } from "@/lib/formato";

/**
 * Tabla de movimientos: nombre, categoría, potencia y competitivo. La categoría y el
 * "competitivo" se leen como texto, no solo por color. En móvil se desplaza en horizontal.
 */
export default function TablaMovimientos({ movimientos, titulo }: { movimientos: Movimiento[]; titulo: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-borde-suave bg-superficie">
      <table className="w-full text-left text-sm [&_td]:px-2 [&_th]:px-2 sm:[&_td]:px-3 sm:[&_th]:px-3">
        <caption className="sr-only">{titulo}</caption>
        <thead>
          <tr className="border-b border-borde-suave text-xs text-texto-secundario">
            <th scope="col" className="px-3 py-2 font-semibold">Nombre</th>
            <th scope="col" className="px-3 py-2 font-semibold">Categoría</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">Potencia</th>
            <th scope="col" className="px-3 py-2 font-semibold">Competitivo</th>
          </tr>
        </thead>
        <tbody>
          {movimientos.map((m) => (
            <tr key={m.idMovimiento} className="border-b border-borde-suave last:border-b-0">
              <th scope="row" className="px-3 py-2 font-medium">{nombreVisible(m)}</th>
              <td className="px-3 py-2">
                <EtiquetaCategoria categoria={m.categoria} />
              </td>
              <td className="px-3 py-2 text-right font-datos tabular-nums">
                {m.potencia ? m.potencia : <span aria-label="Sin potencia">—</span>}
              </td>
              <td className="px-3 py-2">
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
