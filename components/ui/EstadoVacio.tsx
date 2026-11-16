import type { ReactNode } from "react";

/**
 * Mensaje para listas vacías y errores: qué pasó y qué probar (tono de voz de la identidad).
 * `tipo="error"` añade el icono y el color de error (el texto siempre explica, no solo el color).
 */
export default function EstadoVacio({
  titulo,
  mensaje,
  tipo = "vacio",
  accion,
}: {
  titulo: string;
  mensaje?: ReactNode;
  tipo?: "vacio" | "error";
  accion?: ReactNode;
}) {
  const esError = tipo === "error";
  return (
    <div
      role={esError ? "alert" : "status"}
      className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-borde px-6 py-12 text-center"
    >
      {esError && (
        <span
          aria-hidden="true"
          className="inline-flex size-10 items-center justify-center rounded-full border-2 border-error font-titulo text-lg font-bold text-error"
        >
          !
        </span>
      )}
      <p className={`font-titulo text-lg font-semibold ${esError ? "text-error" : "text-texto"}`}>{titulo}</p>
      {mensaje && <p className="max-w-prose text-texto-secundario">{mensaje}</p>}
      {accion}
    </div>
  );
}
