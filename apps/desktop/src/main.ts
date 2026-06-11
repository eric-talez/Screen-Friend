/**
 * Slice 4: click-through overlay shell.
 *
 * The frameless, transparent companion strip (Slice 3) now ignores mouse
 * events by default so clicks pass through to the apps underneath. Launch
 * with SCREEN_FRIEND_INTERACTIVE=1 (pnpm dev:desktop:interactive) to keep
 * the window clickable for development/debugging. Tray controls arrive in
 * Slice 6.
 */
import { app, BrowserWindow, screen } from "electron";
import * as path from "node:path";

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
const INTERACTIVE = process.env.SCREEN_FRIEND_INTERACTIVE === "1";

const OVERLAY_WIDTH = 520;
const OVERLAY_HEIGHT = 260;
// Small gap so the character does not sit on top of the Dock edge.
const OVERLAY_BOTTOM_MARGIN = 8;

function createMainWindow(): BrowserWindow {
  const { workArea } = screen.getPrimaryDisplay();
  const x = workArea.x + Math.round((workArea.width - OVERLAY_WIDTH) / 2);
  const y = workArea.y + workArea.height - OVERLAY_HEIGHT - OVERLAY_BOTTOM_MARGIN;

  const window = new BrowserWindow({
    width: OVERLAY_WIDTH,
    height: OVERLAY_HEIGHT,
    x,
    y,
    title: "Screen Friend",
    transparent: true,
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // "screen-saver" keeps the companion above normal app windows on macOS.
  window.setAlwaysOnTop(true, "screen-saver");
  window.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  if (!INTERACTIVE) {
    // Whole-window click-through. forward:true keeps mousemove events
    // flowing to the renderer for future mouse-react behavior (Slice 5).
    window.setIgnoreMouseEvents(true, { forward: true });
  }

  const query: Record<string, string> = { mode: "overlay" };
  if (INTERACTIVE) {
    query.interactive = "1";
  }

  if (DEV_SERVER_URL) {
    void window.loadURL(`${DEV_SERVER_URL}?${new URLSearchParams(query).toString()}`);
  } else {
    // Built renderer output from apps/web. Run `pnpm --filter @ai-3d-demo/web build` first.
    void window.loadFile(path.join(__dirname, "..", "..", "web", "dist", "index.html"), {
      query,
    });
  }

  return window;
}

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // Standard macOS behavior: keep the app alive until explicit quit.
  if (process.platform !== "darwin") {
    app.quit();
  }
});
