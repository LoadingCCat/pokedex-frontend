import type { ComponentProps } from "react";
import { CLASES_CAMPO, MensajeError } from "@/components/ui/Campo";

/** Desplegable con etiqueta y error, con las mismas reglas de accesibilidad que `Campo`. */
export default function CampoSelect({
  id,
  etiqueta,
  error,
  opciones,
  vacio,
  className = "",
  ...props
}: ComponentProps<"select"> & {
  id: string;
  etiqueta: string;
  error?: string;
  opciones: readonly { valor: string; etiqueta: string }[];
  /** Texto de la opción vacía (si se permite no elegir) */
  vacio?: string;
}) {
  const idError = error ? `${id}-error` : undefined;
  return (
    <div className={`flex flex-col gap-1 ${className}`.trim()}>
      <label htmlFor={id} className="text-sm font-semibold text-texto">
        {etiqueta}
      </label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={idError}
        className={`${CLASES_CAMPO} ${error ? "" : "border-borde"}`}
        {...props}
      >
        {vacio !== undefined && <option value="">{vacio}</option>}
        {opciones.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.etiqueta}
          </option>
        ))}
      </select>
      <MensajeError id={idError} error={error} />
    </div>
  );
}
