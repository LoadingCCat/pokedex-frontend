import type { NextConfig } from "next";

/**
 * Solo desarrollo: hosts (sin puerto) desde los que se abre `npm run dev` además de localhost,
 * p. ej. la IP del ordenador para probar en el celular. Sin esto, Next bloquea /_next/* y la
 * página no se hidrata. Lista separada por comas en DEV_ORIGINS (ver .env.example). En
 * producción no tiene efecto.
 */
const origenesDeDesarrollo = (process.env.DEV_ORIGINS ?? "")
  .split(",")
  .map((origen) => origen.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: origenesDeDesarrollo,
  images: {
    // Sprites de los Pokémon (imagenUrl de la API)
    remotePatterns: [new URL("https://raw.githubusercontent.com/PokeAPI/sprites/**")],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
