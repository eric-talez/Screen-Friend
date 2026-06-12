/**
 * Slice 8: character asset registry.
 *
 * Separates "which character to show" from "how CharacterStage renders it."
 * The current CSS creature is registered as "default-css". Future entries
 * (sprite sheets, GLB) add a new CharacterAssetId and a matching definition
 * without touching the behavior engine or stage layout.
 *
 * Slice 9B: adds renderer: "sprite" discriminant and "placeholder-sprite" entry.
 */
import type { CharacterAction } from "./behaviorEngine";

export type CharacterAssetId = "default-css" | "placeholder-sprite";

/** Per-action asset for the CSS renderer. */
export interface CharacterActionAsset {
  action: CharacterAction;
  /** CSS class applied to the companion root element for this action. */
  className: string;
  /** Human-readable status label shown in the sandbox status bar. */
  label: string;
}

/** Per-action asset for the sprite renderer. */
export interface SpriteActionAsset {
  action: CharacterAction;
  /** URL of the sprite image for this action. */
  spriteUrl: string;
  /** Human-readable status label shown in the sandbox status bar. */
  label: string;
}

export type CharacterAssetDefinition =
  | {
      id: CharacterAssetId;
      name: string;
      renderer: "css";
      actionAssets: Record<CharacterAction, CharacterActionAsset>;
    }
  | {
      id: CharacterAssetId;
      name: string;
      renderer: "sprite";
      actionAssets: Record<CharacterAction, SpriteActionAsset>;
    };

export const DEFAULT_CSS_ASSET: CharacterAssetDefinition = {
  id: "default-css",
  name: "Default CSS Creature",
  renderer: "css",
  actionAssets: {
    idle:    { action: "idle",    className: "companion-idle",    label: "Idle" },
    walk:    { action: "walk",    className: "companion-walk",    label: "Walking" },
    lie:     { action: "lie",     className: "companion-lie",     label: "Lying down" },
    sleepy:  { action: "sleepy",  className: "companion-sleepy",  label: "Getting sleepy" },
    sleep:   { action: "sleep",   className: "companion-sleep",   label: "Sleeping" },
    stretch: { action: "stretch", className: "companion-stretch", label: "Stretching" },
    react:   { action: "react",   className: "companion-react",   label: "Curious" },
  },
};

// Slice 9B: local placeholder sprite asset — no AI, no upload, no backend.
// new URL(literal, import.meta.url) uses static string literals so Vite can
// analyse the paths at build time and emit the SVG files to the output bundle.
const _idle    = new URL("../assets/characters/placeholder-sprite/idle.svg",    import.meta.url).href;
const _walk    = new URL("../assets/characters/placeholder-sprite/walk.svg",    import.meta.url).href;
const _lie     = new URL("../assets/characters/placeholder-sprite/lie.svg",     import.meta.url).href;
const _sleepy  = new URL("../assets/characters/placeholder-sprite/sleepy.svg",  import.meta.url).href;
const _sleep   = new URL("../assets/characters/placeholder-sprite/sleep.svg",   import.meta.url).href;
const _stretch = new URL("../assets/characters/placeholder-sprite/stretch.svg", import.meta.url).href;
const _react   = new URL("../assets/characters/placeholder-sprite/react.svg",   import.meta.url).href;

export const PLACEHOLDER_SPRITE_ASSET: CharacterAssetDefinition = {
  id: "placeholder-sprite",
  name: "Placeholder Sprite",
  renderer: "sprite",
  actionAssets: {
    idle:    { action: "idle",    spriteUrl: _idle,    label: "Idle" },
    walk:    { action: "walk",    spriteUrl: _walk,    label: "Walking" },
    lie:     { action: "lie",     spriteUrl: _lie,     label: "Lying down" },
    sleepy:  { action: "sleepy",  spriteUrl: _sleepy,  label: "Getting sleepy" },
    sleep:   { action: "sleep",   spriteUrl: _sleep,   label: "Sleeping" },
    stretch: { action: "stretch", spriteUrl: _stretch, label: "Stretching" },
    react:   { action: "react",   spriteUrl: _react,   label: "Curious" },
  },
};

export const CHARACTER_ASSET_REGISTRY: Record<CharacterAssetId, CharacterAssetDefinition> = {
  "default-css": DEFAULT_CSS_ASSET,
  "placeholder-sprite": PLACEHOLDER_SPRITE_ASSET,
};

export function getCharacterAsset(id: string): CharacterAssetDefinition {
  return CHARACTER_ASSET_REGISTRY[id as CharacterAssetId] ?? DEFAULT_CSS_ASSET;
}

export function listCharacterAssets(): Array<{ id: CharacterAssetId; name: string; renderer: "css" | "sprite" }> {
  return Object.values(CHARACTER_ASSET_REGISTRY).map(({ id, name, renderer }) => ({ id, name, renderer }));
}
