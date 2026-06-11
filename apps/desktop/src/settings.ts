/**
 * Slice 7: main-process settings store.
 *
 * Persists user preferences as JSON under app.getPath("userData"). Only the
 * main process touches the file system; the renderer never sees Node APIs.
 * The schema is small and versioned so future slices can migrate it.
 */
import { app } from "electron";
import * as fs from "node:fs";
import * as path from "node:path";

export interface WindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ScreenFriendSettings {
  version: 1;
  interactiveMode: boolean;
  windowBounds: WindowBounds | null;
  scale: number;
  personality: "calm" | "playful";
  behaviorIntensity: "low" | "normal" | "high";
}

const SETTINGS_FILE = "screen-friend-settings.json";
const SAVE_DEBOUNCE_MS = 500;

// Calm and unobtrusive by default (see CLAUDE.md risk register).
export const DEFAULT_SETTINGS: ScreenFriendSettings = {
  version: 1,
  interactiveMode: false,
  windowBounds: null,
  scale: 1,
  personality: "calm",
  behaviorIntensity: "normal",
};

const SCALE_MIN = 0.5;
const SCALE_MAX = 2;

function settingsPath(): string {
  return path.join(app.getPath("userData"), SETTINGS_FILE);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function sanitizeBounds(value: unknown): WindowBounds | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const bounds = value as Record<string, unknown>;
  if (
    isFiniteNumber(bounds.x) &&
    isFiniteNumber(bounds.y) &&
    isFiniteNumber(bounds.width) &&
    isFiniteNumber(bounds.height) &&
    bounds.width > 0 &&
    bounds.height > 0
  ) {
    return {
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
    };
  }
  return null;
}

/** Coerce unknown JSON into a valid settings object, field by field. */
function sanitizeSettings(value: unknown): ScreenFriendSettings {
  if (typeof value !== "object" || value === null) {
    return { ...DEFAULT_SETTINGS };
  }
  const raw = value as Record<string, unknown>;
  return {
    version: 1,
    interactiveMode:
      typeof raw.interactiveMode === "boolean"
        ? raw.interactiveMode
        : DEFAULT_SETTINGS.interactiveMode,
    windowBounds: sanitizeBounds(raw.windowBounds),
    scale: isFiniteNumber(raw.scale)
      ? Math.min(SCALE_MAX, Math.max(SCALE_MIN, raw.scale))
      : DEFAULT_SETTINGS.scale,
    personality:
      raw.personality === "calm" || raw.personality === "playful"
        ? raw.personality
        : DEFAULT_SETTINGS.personality,
    behaviorIntensity:
      raw.behaviorIntensity === "low" ||
      raw.behaviorIntensity === "normal" ||
      raw.behaviorIntensity === "high"
        ? raw.behaviorIntensity
        : DEFAULT_SETTINGS.behaviorIntensity,
  };
}

/**
 * Load settings synchronously at startup. A missing or corrupt file falls
 * back to defaults instead of crashing the app.
 */
export function loadSettings(): ScreenFriendSettings {
  try {
    const text = fs.readFileSync(settingsPath(), "utf8");
    return sanitizeSettings(JSON.parse(text));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

let pendingSave: NodeJS.Timeout | null = null;
let lastSerialized: string | null = null;

function writeToDisk(serialized: string): void {
  // Write via a temp file + rename so a crash mid-write cannot leave a
  // truncated settings file behind.
  const target = settingsPath();
  const temp = `${target}.tmp`;
  fs.writeFileSync(temp, serialized, "utf8");
  fs.renameSync(temp, target);
  lastSerialized = serialized;
}

/** Debounced save; bursts of changes (e.g. window moves) write once. */
export function saveSettings(settings: ScreenFriendSettings): void {
  const serialized = JSON.stringify(settings, null, 2);
  if (serialized === lastSerialized) {
    return;
  }
  if (pendingSave) {
    clearTimeout(pendingSave);
  }
  pendingSave = setTimeout(() => {
    pendingSave = null;
    try {
      writeToDisk(serialized);
    } catch (error) {
      console.error("screen-friend: failed to save settings:", error);
    }
  }, SAVE_DEBOUNCE_MS);
}

/** Flush a pending debounced save immediately (used on quit). */
export function flushSettings(settings: ScreenFriendSettings): void {
  if (pendingSave) {
    clearTimeout(pendingSave);
    pendingSave = null;
  }
  const serialized = JSON.stringify(settings, null, 2);
  if (serialized === lastSerialized) {
    return;
  }
  try {
    writeToDisk(serialized);
  } catch (error) {
    console.error("screen-friend: failed to flush settings:", error);
  }
}
