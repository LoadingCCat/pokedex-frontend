import { EnlaceBoton } from "@/components/ui/Boton";

/**
 * Otra forma de buscar, pegada al buscador del catálogo: identificar un Pokémon por foto (F20, P9).
 * Botón secundario (el principal de la vista es «Buscar»). El ícono siempre va con texto, y el alto
 * mínimo es de 44 px también en escritorio: `clasesBoton` baja a 40 px desde `sm`, así que aquí se fuerza
 * con `!`. El foco visible lo da el `:focus-visible` global de globals.css.
 */
export default function EnlaceIdentificarFoto() {
  return (
    <EnlaceBoton href="/identificar" variante="secundario" className="w-full sm:w-auto sm:shrink-0 sm:min-h-11!">
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 24 24"
        className="size-5 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14.5 4h-5L8 6H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3l-1.5-2Z" />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
      Identificar por foto
    </EnlaceBoton>
  );
}
