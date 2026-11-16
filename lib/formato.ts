/** Formato de datos para mostrar (tono de voz de docs/diseno/identidad-visual.md). */

/** 25 → "#025" (tres cifras como mínimo; 1025 → "#1025"). */
export function numeroPokedex(id: number): string {
  return `#${String(id).padStart(3, "0")}`;
}

/** "thunder-punch" → "Thunder Punch". */
export function formatearSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(" ");
}

/** Nombre a mostrar: `nombreEs` y, si viene en null, el slug formateado. */
export function nombreVisible(dato: { nombre: string; nombreEs?: string | null }): string {
  return dato.nombreEs?.trim() || formatearSlug(dato.nombre);
}

const unDecimal = new Intl.NumberFormat("es", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** 0.4 → "0,4 m". null → "—". */
export function formatoAltura(metros: number | null | undefined): string {
  return metros == null ? "—" : `${unDecimal.format(metros)} m`;
}

/** 6 → "6,0 kg". null → "—". */
export function formatoPeso(kilos: number | null | undefined): string {
  return kilos == null ? "—" : `${unDecimal.format(kilos)} kg`;
}
