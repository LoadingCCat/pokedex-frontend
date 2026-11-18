import { efectividadContra } from "@/lib/efectividad-tipos";
import InsigniaTipo from "./InsigniaTipo";

/**
 * F19 · Debilidades y resistencias de la ficha, calculadas con la tabla fija de efectividad.
 * El multiplicador va en el texto del grupo (no solo en color). Sin animación.
 */
export default function DebilidadesTipo({ tipos }: { tipos: { nombre: string }[] }) {
  const grupos = efectividadContra(tipos.map((t) => t.nombre));
  if (grupos.length === 0) return <p className="text-texto-secundario">No hay datos de tipos para calcularlo.</p>;
  return (
    <>
      <dl className="flex flex-col gap-3">
        {grupos.map((g) => (
          <div key={g.valor} className="flex flex-col gap-1.5">
            <dt className="text-sm font-semibold text-texto">{g.titulo}</dt>
            <dd>
              <ul className="flex flex-wrap gap-1.5">
                {g.tipos.map((t) => (
                  <li key={t}>
                    <InsigniaTipo tipo={t} />
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-texto-secundario">Daño que recibe de cada tipo de ataque. Los tipos que no aparecen hacen daño normal (×1). No tiene en cuenta habilidades ni objetos.</p>
    </>
  );
}
