import { infoTipo } from "@/lib/tipos-pokemon";

/** Píldora con el tipo en español y sus colores AA (lib/tipos-pokemon.ts). */
export default function InsigniaTipo({ tipo }: { tipo: string }) {
  const { etiqueta, fondo, texto } = infoTipo(tipo);
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{ backgroundColor: fondo, color: texto }}
    >
      {etiqueta}
    </span>
  );
}

/** Lista de insignias (un Pokémon tiene uno o dos tipos). */
export function ListaTipos({ tipos }: { tipos: { nombre: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Tipos">
      {tipos.map((t) => (
        <li key={t.nombre}>
          <InsigniaTipo tipo={t.nombre} />
        </li>
      ))}
    </ul>
  );
}
