import Image from "next/image";

/**
 * Ilustración oficial del Pokémon (475 × 475 en la PokeAPI). Si `src` es null (etapa no
 * importada), muestra una silueta gris. `sizes` indica el ancho real en pantalla para que
 * Next sirva una versión pequeña.
 */
export default function ImagenPokemon({
  src,
  alt,
  sizes,
  prioridad = false,
  className = "",
}: {
  src: string | null;
  alt: string;
  sizes: string;
  prioridad?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div role="img" aria-label={`${alt} (sin imagen)`} className={`aspect-square ${className}`}>
        <svg viewBox="0 0 100 100" className="size-full text-borde-suave" aria-hidden="true">
          <circle cx="50" cy="50" r="40" fill="currentColor" />
          <rect x="10" y="47" width="80" height="6" className="fill-superficie" />
          <circle cx="50" cy="50" r="11" className="fill-superficie" />
          <circle cx="50" cy="50" r="6" fill="currentColor" />
        </svg>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={475}
      height={475}
      sizes={sizes}
      preload={prioridad}
      className={`aspect-square h-auto w-full object-contain ${className}`}
    />
  );
}
