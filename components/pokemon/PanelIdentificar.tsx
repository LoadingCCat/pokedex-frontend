import type { Ref } from "react";
import Boton from "@/components/ui/Boton";
import EstadoVacio from "@/components/ui/EstadoVacio";
import { MENSAJE_ESPERA_LENTA, type EstadoIdentificar } from "@/lib/identificar-estado";
import ResultadoIdentificacion from "./ResultadoIdentificacion";
import SelectorFoto from "./SelectorFoto";

/**
 * F20: la pantalla según su estado (sin lógica ni efectos: la lleva IdentificadorFoto).
 * Aparte para poder probar cada estado con renderToStaticMarkup.
 */
export default function PanelIdentificar({
  estado,
  vistaPrevia,
  hayFoto,
  onElegir,
  onIdentificar,
  onOtraFoto,
  refPrimerControl,
  refTituloResultado,
  refReintento,
}: {
  estado: EstadoIdentificar;
  vistaPrevia: string | null;
  hayFoto: boolean;
  onElegir: (archivo: File) => void;
  onIdentificar: () => void;
  onOtraFoto: () => void;
  refPrimerControl?: Ref<HTMLInputElement>;
  refTituloResultado?: Ref<HTMLHeadingElement>;
  refReintento?: Ref<HTMLButtonElement>;
}) {
  const analizando = estado.fase === "analizando";

  if (estado.fase === "error") {
    return (
      <EstadoVacio
        tipo="error"
        titulo="No pudimos identificar la foto"
        mensaje={estado.mensaje}
        accion={
          <Boton ref={refReintento} variante="principal" onClick={onOtraFoto}>
            Probar con otra foto
          </Boton>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4" aria-busy={analizando}>
        <SelectorFoto
          vistaPrevia={vistaPrevia}
          deshabilitado={analizando}
          onElegir={onElegir}
          refPrimerControl={refPrimerControl}
        />
        {hayFoto && estado.fase !== "resultado" && (
          <div>
            <Boton variante="principal" disabled={analizando} onClick={onIdentificar}>
              {analizando ? "Analizando…" : "Identificar"}
            </Boton>
          </div>
        )}
        {/* Región viva: el lector de pantalla anuncia la espera */}
        <p role="status" className="min-h-6 text-sm text-texto-secundario">
          {analizando ? (estado.lento ? MENSAJE_ESPERA_LENTA : "Analizando la foto…") : ""}
        </p>
      </div>
      {estado.fase === "resultado" && <ResultadoIdentificacion datos={estado.datos} refTitulo={refTituloResultado} />}
    </div>
  );
}
