import { EnlaceBoton } from "@/components/ui/Boton";
import EstadoVacio from "@/components/ui/EstadoVacio";
import { AVISO_SIN_API } from "@/lib/sesion-comun";

/** P7/P8 en el sitio publicado (sin API_URL): el panel no existe y se explica por qué. */
export default function AvisoSinApi() {
  return (
    <EstadoVacio
      titulo="Administración no disponible"
      mensaje={AVISO_SIN_API}
      accion={
        <EnlaceBoton href="/" variante="secundario">
          Ir al catálogo
        </EnlaceBoton>
      }
    />
  );
}
