import Link from "next/link";

export default function Pie() {
  return (
    <footer className="border-t border-borde-suave bg-superficie">
      <div className="mx-auto w-full max-w-[75rem] px-4 py-6 text-sm text-texto-secundario sm:px-6">
        <p>Pokedex+ · Proyecto universitario, Universidad Santo Tomás (USTA).</p>
        <p>
          Datos de la{" "}
          <a
            href="https://pokeapi.co"
            className="text-acento underline underline-offset-2 hover:no-underline"
          >
            PokeAPI
          </a>
          . Fuentes de las imágenes y aviso legal en{" "}
          <Link href="/creditos" className="text-acento underline underline-offset-2 hover:no-underline">
            Créditos y avisos
          </Link>
          .
        </p>
        <p>
          <Link href="/admin" className="text-acento underline underline-offset-2 hover:no-underline">
            Administración
          </Link>{" "}
          (solo con la API local)
        </p>
      </div>
    </footer>
  );
}
