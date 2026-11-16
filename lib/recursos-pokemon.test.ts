import { describe, expect, it } from "vitest";
import { gritoUrl, ilustracionShinyUrl, spriteAnimadoUrl } from "./recursos-pokemon";

describe("Recursos de nostalgia", () => {
  it("sprite animado solo del #1 al #649", () => {
    expect(spriteAnimadoUrl(25)).toBe(
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/25.gif",
    );
    expect(spriteAnimadoUrl(649)).not.toBeNull();
    expect(spriteAnimadoUrl(650)).toBeNull();
    expect(spriteAnimadoUrl(0)).toBeNull();
  });

  it("shiny y grito del #1 al #1025", () => {
    expect(ilustracionShinyUrl(1025)).toBe(
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/1025.png",
    );
    expect(gritoUrl(25)).toBe("https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/25.ogg");
    expect(ilustracionShinyUrl(1026)).toBeNull();
    expect(gritoUrl(2.5)).toBeNull();
  });
});
