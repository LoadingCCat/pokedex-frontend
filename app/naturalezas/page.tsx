import type { Metadata } from "next";
import Tarjeta from "@/components/ui/Tarjeta";
import { ETIQUETAS_ESTADISTICA, NATURALEZAS, esNeutra } from "@/lib/naturalezas";

export const metadata: Metadata = {
  title: "Naturalezas",
  description: "Las 25 naturalezas de Pokémon: qué estadística sube y cuál baja cada una.",
};

/** P11 · Naturalezas (docs/pantallas.md, F19): página estática desde datos/naturalezas.json. */
export default function Naturalezas() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold sm:text-4xl">Naturalezas</h1>
        <p className="max-w-prose text-texto-secundario">
          Cada naturaleza sube una estadística un 10 % y baja otra un 10 %. Las 5 neutras no cambian nada. Los PS
          nunca cambian.
        </p>
      </header>
      <Tarjeta className="p-2 sm:p-4">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="sr-only">Las 25 naturalezas, con la estadística que sube y la que baja</caption>
          <thead>
            <tr className="border-b border-borde-suave text-texto-secundario">
              <th scope="col" className="px-2 py-2 font-semibold">Naturaleza</th>
              <th scope="col" className="px-2 py-2 font-semibold">Sube (+10 %)</th>
              <th scope="col" className="px-2 py-2 font-semibold">Baja (−10 %)</th>
            </tr>
          </thead>
          <tbody>
            {NATURALEZAS.map((n) => (
              <tr key={n.nombre} className="border-b border-borde-suave last:border-b-0">
                <th scope="row" className="px-2 py-2 font-semibold">
                  {n.nombreEs}
                  {esNeutra(n) && <span className="block text-xs font-normal text-texto-secundario">Neutra</span>}
                </th>
                <td className="px-2 py-2">
                  {n.sube ? (
                    <span className="text-exito">
                      <span aria-hidden="true">▲ </span>
                      {ETIQUETAS_ESTADISTICA[n.sube]}
                    </span>
                  ) : (
                    <span aria-label="Ninguna">—</span>
                  )}
                </td>
                <td className="px-2 py-2">
                  {n.baja ? (
                    <span className="text-error">
                      <span aria-hidden="true">▼ </span>
                      {ETIQUETAS_ESTADISTICA[n.baja]}
                    </span>
                  ) : (
                    <span aria-label="Ninguna">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Tarjeta>
    </div>
  );
}
