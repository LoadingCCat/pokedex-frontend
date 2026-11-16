"use client"; // Los límites de error de Next.js son componentes de cliente

import { useEffect } from "react";
import Boton, { EnlaceBoton } from "@/components/ui/Boton";
import EstadoVacio from "@/components/ui/EstadoVacio";

/**
 * Error inesperado en cualquier pantalla. Mensaje genérico (sin detalles técnicos, como pide
 * el tono de voz); el detalle queda en la consola. `retry` vuelve a pedir y pintar la página.
 */
export default function ErrorGlobal({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold sm:text-4xl">Algo salió mal</h1>
      <EstadoVacio
        tipo="error"
        titulo="No se pudo mostrar esta página."
        mensaje="Vuelve a intentarlo en unos segundos. Si sigue fallando, vuelve al catálogo."
        accion={
          <div className="flex flex-wrap justify-center gap-2">
            <Boton variante="principal" onClick={() => retry()}>
              Reintentar
            </Boton>
            <EnlaceBoton href="/">Ir al catálogo</EnlaceBoton>
          </div>
        }
      />
    </div>
  );
}
