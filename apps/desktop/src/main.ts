/**
 * Slice 3: transparent always-on-top overlay shell.
 *
 * The desktop window is now a frameless, transparent companion strip
 * pinned near the bottom of the primary display. Click-through
 * (setIgnoreMouseEvents) is deferred to Slice 4; tray controls to Slice 6.
 */
import { app, BrowserWindow, screen } from "electron";
import * as path from "node:path";

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

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

  if (DEV_SERVER_URL) {
    void window.loadURL(`${DEV_SERVER_URL}?mode=overlay`);
  } else {
    // Built renderer output from apps/web. Run `pnpm --filter @ai-3d-demo/web build` first.
    void window.loadFile(path.join(__dirname, "..", "..", "web", "dist", "index.html"), {
      query: { mode: "overlay" },
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
