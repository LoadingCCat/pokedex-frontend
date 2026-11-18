import type { ComponentProps } from "react";
import { MensajeError } from "@/components/ui/Campo";

/** Texto largo con etiqueta y error (mismas reglas que `Campo`). */
export default function CampoArea({
  id,
  etiqueta,
  error,
  className = "",
  ...props
}: ComponentProps<"textarea"> & { id: string; etiqueta: string; error?: string }) {
  const idError = error ? `${id}-error` : undefined;
  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      <label htmlFor={id} className="text-sm font-semibold text-texto">
        {etiqueta}
      </label>
      <textarea
        id={id}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={idError}
        className={`w-full rounded-md border bg-superficie px-3 py-2 text-sm text-texto aria-[invalid=true]:border-2 aria-[invalid=true]:border-error ${error ? "" : "border-borde"}`}
        {...props}
      />
      <MensajeError id={idError} error={error} />
    </div>
  );
}
