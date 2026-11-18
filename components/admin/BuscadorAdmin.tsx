import { clasesBoton } from "@/components/ui/Boton";
import { CLASES_CAMPO } from "@/components/ui/Campo";

/** Búsqueda del listado del panel: un formulario GET (funciona sin JavaScript). */
export default function BuscadorAdmin({
  accion,
  valor,
  etiqueta,
}: {
  accion: string;
  valor?: string;
  etiqueta: string;
}) {
  return (
    <form action={accion} role="search" className="flex flex-wrap items-end gap-2">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <label htmlFor="admin-buscar" className="text-sm font-semibold text-texto">
          {etiqueta}
        </label>
        <input
          id="admin-buscar"
          name="nombre"
          type="search"
          defaultValue={valor}
          maxLength={100}
          className={`${CLASES_CAMPO} border-borde`}
        />
      </div>
      <button type="submit" className={clasesBoton("secundario")}>
        Buscar
      </button>
    </form>
  );
}
