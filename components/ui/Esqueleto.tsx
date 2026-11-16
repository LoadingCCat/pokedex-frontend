/** Bloque gris de carga. Se le da la forma con `className` (alto, ancho, radio). */
export default function Esqueleto({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-md bg-borde-suave motion-reduce:animate-none ${className}`.trim()}
    />
  );
}
