/**
 * Script en línea que corre al cargar el HTML, antes de pintar (guía de Next.js
 * "Preventing flash before hydration"). En el cliente se renderiza como `text/plain` para
 * que React no avise por la etiqueta <script>; `suppressHydrationWarning` acepta la diferencia.
 */
export default function ScriptEnLinea({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
