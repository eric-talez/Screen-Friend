/**
 * Slice 8: character asset registry.
 *
 * Separates "which character to show" from "how CharacterStage renders it."
 * The current CSS creature is registered as "default-css". Future entries
 * (sprite sheets, GLB) add a new CharacterAssetId and a matching definition
 * without touching the behavior engine or stage layout.
 */
import type { CharacterAction } from "./behaviorEngine";

export type CharacterAssetId = "default-css";

export interface CharacterActionAsset {
  action: CharacterAction;
  /** CSS class applied to the companion root element for this action. */
  className: string;
  /** Human-readable status label shown in the sandbox status bar. */
  label: string;
}

export interface CharacterAssetDefinition {
  id: CharacterAssetId;
  name: string;
  /** Discriminant for future renderer branches (sprite, glb, …). */
  renderer: "css";
  actionAssets: Record<CharacterAction, CharacterActionAsset>;
}

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

export const CHARACTER_ASSET_REGISTRY: Record<CharacterAssetId, CharacterAssetDefinition> = {
  "default-css": DEFAULT_CSS_ASSET,
};

export function getCharacterAsset(id: CharacterAssetId): CharacterAssetDefinition {
  return CHARACTER_ASSET_REGISTRY[id];
}
