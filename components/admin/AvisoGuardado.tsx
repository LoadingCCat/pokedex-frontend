/** Confirmación tras guardar o borrar (P8 punto 6), anunciada al lector de pantalla. */
export default function AvisoGuardado({ texto }: { texto: string | null }) {
  return (
    <div role="status" className="empty:hidden">
      {texto && (
        <p className="flex items-start gap-2 rounded-md border border-exito bg-superficie px-3 py-2 text-sm text-texto">
          <span aria-hidden="true" className="font-bold text-exito">
            ✓
          </span>
          {texto}
        </p>
      )}
    </div>
  );
}
