import Link from "next/link";

/**
 * Filtro activo, en píldora con fondo de acento. Si recibe `hrefQuitar`, muestra una "×"
 * que lleva a la misma vista sin ese filtro.
 */
export default function Chip({
  etiqueta,
  hrefQuitar,
}: {
  etiqueta: string;
  hrefQuitar?: string;
}) {
  return (
    <span className="inline-flex min-h-11 items-center gap-1 sm:min-h-10 rounded-full bg-acento pl-3 pr-1 text-sm font-medium text-white">
      <span className={hrefQuitar ? "" : "pr-2"}>{etiqueta}</span>
      {hrefQuitar && (
        <Link
          href={hrefQuitar}
          aria-label={`Quitar filtro: ${etiqueta}`}
          className="inline-flex size-11 items-center sm:size-9 justify-center rounded-full hover:bg-white/20"
        >
          <span aria-hidden="true">×</span>
        </Link>
      )}
    </span>
  );
}
