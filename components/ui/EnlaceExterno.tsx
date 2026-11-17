import type { EnlaceWikidex } from "@/lib/enlaces-wikidex";

/**
 * Enlace a WikiDex (identidad, "Enlace externo"): pestaña nueva, flecha decorativa y un nombre
 * accesible que avisa de que sale del sitio. Si el artículo no se verificó, dice "Buscar".
 * `compacto` es la versión corta ("WikiDex ↗") de la lista de lugares: `de` es lo que se enlaza
 * ("Bosque Verde") y solo se lee en el nombre accesible.
 */
export default function EnlaceExterno({
  enlace,
  compacto = false,
  de,
  className = "",
}: {
  enlace: EnlaceWikidex;
  compacto?: boolean;
  de?: string;
  className?: string;
}) {
  const verbo = enlace.tipo === "exacto" ? "Ver" : "Buscar";
  return (
    <a
      href={enlace.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-11 items-center gap-1 ${compacto ? "text-xs" : "text-sm"} text-acento underline underline-offset-2 hover:no-underline sm:min-h-0 ${className}`}
    >
      {compacto ? (
        <>
          <span className="sr-only">
            {verbo} {de} en{" "}
          </span>
          WikiDex
        </>
      ) : (
        <>{verbo} en WikiDex</>
      )}
      <span aria-hidden="true">↗</span>
      <span className="sr-only"> (se abre en otra pestaña, sitio externo)</span>
    </a>
  );
}
