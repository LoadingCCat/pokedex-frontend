import AnimarAlAparecer from "@/components/ui/AnimarAlAparecer";
import type { Pokemon } from "@/lib/api/tipos";

const ESTADISTICAS = [
  { campo: "ps", etiqueta: "PS" },
  { campo: "ataque", etiqueta: "Ataque" },
  { campo: "defensa", etiqueta: "Defensa" },
  { campo: "ataqueEspecial", etiqueta: "Ataque especial" },
  { campo: "defensaEspecial", etiqueta: "Defensa especial" },
  { campo: "velocidad", etiqueta: "Velocidad" },
] as const;

/** Valor máximo posible de una estadística base: la barra es proporcional a 255. */
const MAXIMO = 255;

/** Las 6 estadísticas base en barras horizontales, con el valor en número y el total aparte. */
export default function EstadisticasBase({ pokemon }: { pokemon: Pokemon }) {
  return (
    // Toque de nostalgia de P2: las barras se llenan la primera vez que se ven (app/globals.css)
    <AnimarAlAparecer selector=".barra-estadistica">
    <dl className="flex flex-col gap-2">
      {ESTADISTICAS.map(({ campo, etiqueta }) => {
        const valor = pokemon[campo];
        return (
          <div key={campo} className="grid grid-cols-[8.5rem_2.5rem_1fr] items-center gap-3 sm:grid-cols-[10rem_3rem_1fr]">
            <dt className="text-sm text-texto-secundario">{etiqueta}</dt>
            <dd className="text-right font-datos text-sm font-medium tabular-nums">{valor ?? "—"}</dd>
            <dd aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-borde-suave">
              {valor != null && (
                <div className="barra-estadistica h-full rounded-full bg-acento" style={{ width: `${Math.min(100, (valor / MAXIMO) * 100)}%` }} />
              )}
            </dd>
          </div>
        );
      })}
      <div className="mt-1 grid grid-cols-[8.5rem_2.5rem_1fr] items-center gap-3 border-t border-borde-suave pt-2 sm:grid-cols-[10rem_3rem_1fr]">
        <dt className="text-sm font-semibold">Total</dt>
        <dd className="text-right font-datos text-sm font-bold tabular-nums">{pokemon.totalEstadisticas ?? "—"}</dd>
      </div>
    </dl>
    </AnimarAlAparecer>
  );
}
