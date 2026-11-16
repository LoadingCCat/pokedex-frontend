import Link from "next/link";
import { clasesBoton } from "./Boton";

/**
 * "Anterior · Página N de M · Siguiente". `pagina` empieza en 0, como `page.number` de la
 * API; `hrefPagina(n)` arma el enlace a la página n (conservando filtros y orden).
 */
export default function Paginacion({
  pagina,
  totalPaginas,
  hrefPagina,
}: {
  pagina: number;
  totalPaginas: number;
  hrefPagina: (pagina: number) => string;
}) {
  if (totalPaginas <= 1) return null;
  const hayAnterior = pagina > 0;
  const haySiguiente = pagina + 1 < totalPaginas;

  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-3">
      <EnlacePagina href={hayAnterior ? hrefPagina(pagina - 1) : undefined}>← Anterior</EnlacePagina>
      <p className="text-sm text-texto-secundario" aria-live="polite">
        Página <span className="font-datos tabular-nums text-texto">{pagina + 1}</span> de{" "}
        <span className="font-datos tabular-nums text-texto">{totalPaginas}</span>
      </p>
      <EnlacePagina href={haySiguiente ? hrefPagina(pagina + 1) : undefined}>Siguiente →</EnlacePagina>
    </nav>
  );
}

/** Sin href se muestra deshabilitado (no es un enlace). */
function EnlacePagina({ href, children }: { href?: string; children: React.ReactNode }) {
  if (!href) {
    return (
      <span aria-disabled="true" className={clasesBoton("secundario", "cursor-not-allowed opacity-50")}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={clasesBoton("secundario")}>
      {children}
    </Link>
  );
}
