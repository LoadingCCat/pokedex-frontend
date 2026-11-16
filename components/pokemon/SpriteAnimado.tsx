"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sprite animado de Pokémon Negro/Blanco que aparece encima de la ilustración al pasar el
 * ratón por la tarjeta (el <article> que lo contiene). Toque de nostalgia de P1/P5
 * (docs/diseno/identidad-visual.md):
 * - solo con ratón y sin `prefers-reduced-motion`; en táctil no se hace nada;
 * - el GIF se pide la primera vez que se pasa el ratón, no al cargar la página;
 * - fundido de 150 ms; escalado 2× y pixelado;
 * - si el GIF no carga, no se muestra nada (se queda la ilustración).
 * Es decorativo: la ilustración de debajo ya tiene el `alt`.
 */
export default function SpriteAnimado({ src }: { src: string }) {
  const caja = useRef<HTMLDivElement>(null);
  const [pedido, setPedido] = useState(false);
  const [encima, setEncima] = useState(false);
  const [ancho, setAncho] = useState<number | null>(null);
  const [falla, setFalla] = useState(false);

  useEffect(() => {
    const tarjeta = caja.current?.closest("article");
    if (!tarjeta) return;
    const permitido = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const entrar = (evento: PointerEvent) => {
      if (evento.pointerType !== "mouse" || !permitido.matches) return;
      setPedido(true);
      setEncima(true);
    };
    const salir = () => setEncima(false);
    tarjeta.addEventListener("pointerenter", entrar);
    tarjeta.addEventListener("pointerleave", salir);
    return () => {
      tarjeta.removeEventListener("pointerenter", entrar);
      tarjeta.removeEventListener("pointerleave", salir);
    };
  }, []);

  const visible = encima && ancho !== null && !falla;

  return (
    <div
      ref={caja}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-md bg-fondo transition-opacity duration-150 ease-out motion-reduce:hidden"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {pedido && !falla && (
        // GIF animado: next/image no lo optimiza y necesita su tamaño natural ×2 (pixel art)
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          decoding="async"
          onLoad={(e) => setAncho(e.currentTarget.naturalWidth * 2)}
          onError={() => setFalla(true)}
          className="max-w-full"
          style={{ width: ancho ?? undefined, imageRendering: "pixelated" }}
        />
      )}
    </div>
  );
}
