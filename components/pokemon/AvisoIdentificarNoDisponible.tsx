import EstadoVacio from "@/components/ui/EstadoVacio";
import { MENSAJE_IDENTIFICAR_NO_DISPONIBLE } from "@/lib/api/tipos";

/** F20 en modo mock (sin API_URL): la pantalla avisa en vez de fallar. */
export default function AvisoIdentificarNoDisponible() {
  return <EstadoVacio titulo="Identificar por foto no está disponible" mensaje={MENSAJE_IDENTIFICAR_NO_DISPONIBLE} />;
}
