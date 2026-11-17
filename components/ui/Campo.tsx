import type { ComponentProps } from "react";

export const CLASES_CAMPO =
  "min-h-11 w-full rounded-md border bg-superficie px-3 text-sm text-texto sm:min-h-10 aria-[invalid=true]:border-2 aria-[invalid=true]:border-error";

/**
 * Campo de formulario con su etiqueta y, si lo hay, su error debajo: icono "!" y texto en color
 * error (el color no es la única señal), unido al campo con aria-describedby y aria-invalid.
 */
export default function Campo({
  id,
  etiqueta,
  error,
  ayuda,
  className = "",
  ...props
}: ComponentProps<"input"> & { id: string; etiqueta: string; error?: string; ayuda?: string }) {
  const idError = error ? `${id}-error` : undefined;
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;
  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      <label htmlFor={id} className="text-sm font-semibold text-texto">
        {etiqueta}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={[idError, idAyuda].filter(Boolean).join(" ") || undefined}
        className={`${CLASES_CAMPO} ${error ? "" : "border-borde"}`}
        {...props}
      />
      {ayuda && (
        <p id={idAyuda} className="text-xs text-texto-secundario">
          {ayuda}
        </p>
      )}
      <MensajeError id={idError} error={error} />
    </div>
  );
}

/** Error de un campo: icono y texto. No pinta nada si no hay error. */
export function MensajeError({ id, error }: { id?: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm text-error">
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-error text-[0.625rem] font-bold leading-none"
      >
        !
      </span>
      {error}
    </p>
  );
}

/** Aviso de error del formulario entero (lo que no es de un campo), anunciado al lector de pantalla. */
export function AvisoFormulario({ mensaje }: { mensaje?: string }) {
  if (!mensaje) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-md border border-error bg-superficie px-3 py-2 text-sm text-error">
      <span
        aria-hidden="true"
        className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border border-error text-[0.625rem] font-bold leading-none"
      >
        !
      </span>
      {mensaje}
    </div>
  );
}
