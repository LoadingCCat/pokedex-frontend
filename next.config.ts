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
    // Plan Hobby de Vercel: 5 000 transformaciones/mes. Cada (imagen, ancho, formato, calidad) cuenta una vez,
    // así que se fija un conjunto pequeño: 1 025 artworks × 3 anchos × 1 formato ≈ 3 100 como máximo.
    // 96 px: evolución (80 px); 384 px: tarjeta (≤ 180 px) y ficha (288 px) a 1x/2x; 640 px: ficha en móvil.
    // imageSizes tiene que ser menor que el menor de deviceSizes.
    deviceSizes: [640],
    imageSizes: [96, 384],
    formats: ["image/webp"],
    qualities: [75],
    // El artwork no cambia: 31 días evitan volver a transformarlo al caducar la caché
    minimumCacheTTL: 2678400,
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
