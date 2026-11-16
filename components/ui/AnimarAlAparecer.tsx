"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Marca con `data-visible` los elementos `selector` de su contenido la primera vez que el
 * bloque entra en pantalla; el CSS (app/globals.css) anima a partir de ahí. Sin JavaScript,
 * sin IntersectionObserver o con movimiento reducido, el contenido se ve completo desde el inicio.
 */
export default function AnimarAlAparecer({ selector, children }: { selector: string; children: ReactNode }) {
  const bloque = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elemento = bloque.current;
    if (!elemento) return;
    const mostrar = () => elemento.querySelectorAll(selector).forEach((e) => e.setAttribute("data-visible", ""));
    if (!("IntersectionObserver" in window)) {
      mostrar();
      return;
    }
    const observador = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          mostrar();
          observador.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observador.observe(elemento);
    return () => observador.disconnect();
  }, [selector]);

  return <div ref={bloque}>{children}</div>;
}
