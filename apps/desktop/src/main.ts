/**
 * Slice 6: tray-controlled click-through overlay shell.
 *
 * The frameless, transparent companion strip (Slice 3) ignores mouse events
 * by default so clicks pass through to the apps underneath (Slice 4). A
 * menu bar tray entry (Slice 6) adds Show / Hide / Interactive Mode / Quit
 * controls. Launch with SCREEN_FRIEND_INTERACTIVE=1
 * (pnpm dev:desktop:interactive) to start in interactive mode; the tray
 * checkbox can flip the mode at runtime either way.
 */
import { app, BrowserWindow, Menu, nativeImage, screen, Tray } from "electron";
import * as path from "node:path";

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

const OVERLAY_WIDTH = 520;
const OVERLAY_HEIGHT = 260;
// Small gap so the character does not sit on top of the Dock edge.
const OVERLAY_BOTTOM_MARGIN = 8;

const INTERACTIVE_CHANGED_CHANNEL = "screen-friend:interactive-changed";

let mainWindow: BrowserWindow | null = null;
// Keep a module-level reference so the tray is not garbage-collected.
let tray: Tray | null = null;
// Runtime source of truth for click-through vs interactive; the env var only
// seeds the initial value so both launch modes keep working.
let interactiveMode = process.env.SCREEN_FRIEND_INTERACTIVE === "1";

function applyInteractiveMode(window: BrowserWindow): void {
  if (interactiveMode) {
    window.setIgnoreMouseEvents(false);
  } else {
    // forward:true keeps mousemove events flowing to the renderer for the
    // mouse-react behavior (Slice 5).
    window.setIgnoreMouseEvents(true, { forward: true });
  }
}

function sendInteractiveModeToRenderer(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(INTERACTIVE_CHANGED_CHANNEL, interactiveMode);
  }
}

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

  applyInteractiveMode(window);

  // The query seeds the renderer badge before the bridge delivers updates;
  // it reflects the runtime mode so windows recreated after a tray toggle
  // keep the current state.
  const query: Record<string, string> = { mode: "overlay" };
  if (interactiveMode) {
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

  // IPC sent before the page finishes loading is lost, so re-sync once the
  // renderer is ready in case the mode was toggled mid-load.
  window.webContents.on("did-finish-load", () => {
    sendInteractiveModeToRenderer();
  });

  window.on("closed", () => {
    if (mainWindow === window) {
      mainWindow = null;
    }
  });

  mainWindow = window;
  return window;
}

function showCompanion(): void {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
  } else {
    mainWindow.show();
  }
}

function hideCompanion(): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }
}

function toggleInteractiveMode(): void {
  interactiveMode = !interactiveMode;
  if (mainWindow && !mainWindow.isDestroyed()) {
    applyInteractiveMode(mainWindow);
  }
  sendInteractiveModeToRenderer();
  // Rebuild so the checkbox never goes stale.
  tray?.setContextMenu(buildTrayMenu());
}

function buildTrayMenu(): Menu {
  return Menu.buildFromTemplate([
    { label: "Show Screen Friend", click: showCompanion },
    { label: "Hide Screen Friend", click: hideCompanion },
    { type: "separator" },
    {
      label: "Interactive Mode",
      type: "checkbox",
      checked: interactiveMode,
      click: toggleInteractiveMode,
    },
    { type: "separator" },
    { label: "Quit Screen Friend", click: () => app.quit() },
  ]);
}

function createTray(): void {
  // No icon asset exists yet (character assets arrive in Slice 8), so use an
  // empty image with a text title — on macOS the menu bar renders the title.
  tray = new Tray(nativeImage.createEmpty());
  tray.setTitle("🐾");
  tray.setToolTip("Screen Friend");
  tray.setContextMenu(buildTrayMenu());
}

app.whenReady().then(() => {
  createMainWindow();
  createTray();

  app.on("activate", () => {
    showCompanion();
  });
});

app.on("window-all-closed", () => {
  // Standard macOS behavior: keep the app alive until explicit quit.
  if (process.platform !== "darwin") {
    app.quit();
  }
});
