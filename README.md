# Screen Friend / 화면 친구

Screen Friend is a Mac desktop companion app: a cute character that lives near the bottom of the screen, stays above other windows, and loops ambient behaviors like walking, blinking, lying down, and getting sleepy — without interrupting your work.

The Electron transparent always-on-top overlay is live. Slices 0–8.5 are merged: click-through, tray controls, persistence, character asset registry, and animation polish (easing, ground shadow, near-edge awareness) are all working. Next up is Slice 9 (optional AI custom character) — split it into smaller sub-slices before starting.

## Current State

The repo currently includes:

- A pnpm workspace.
- A Vite + React + TypeScript app in `apps/web` with the character behavior sandbox (idle/walk/blink/lie-down/sleepy/sleep loop).
- An Electron desktop shell in `apps/desktop` (main + preload).
- A transparent, frameless, always-on-top overlay window near the bottom of the primary display (Slice 3).
- Click-through by default, with an interactive debug mode via `SCREEN_FRIEND_INTERACTIVE=1` / `pnpm dev:desktop:interactive` and an "interactive" badge in the renderer (Slice 4).
- A menu bar tray entry with Show/Hide, a runtime Interactive Mode toggle, and Quit (Slice 6).
- Persistent preferences: the interactive-mode toggle and window position survive restarts via a versioned JSON settings file (Slice 7).
- Character asset registry: action → CSS class and label mappings extracted into a versioned registry (`characterAssets.ts`), so future sprite-sheet or GLB characters can plug in without touching the behavior engine (Slice 8).
- A React Three Fiber prototype scene.
- A temporary image-selection and mock-generation customization flow.
- A primitive character model inside an experimental MacBook-style 3D viewer.

The current upload/generation flow is not the MVP core. Treat it as a future customization prototype that may later help users create custom characters.

## MVP Status

The core companion MVP is working:

- Character animation sandbox (web) with idle/walk/blink/lie-down/sleepy/sleep.
- Transparent always-on-top Electron overlay on the real Mac desktop.
- Click-through by default; interactive debug mode via env var or tray toggle.
- Tray/menu-bar controls: Show, Hide, Interactive Mode toggle, Quit.
- Persistent preferences (interactive mode, window position) across restarts.
- Character asset registry wired up; default CSS creature is `"default-css"`.
- Animation polish: smooth easing, ground contact shadow, near-edge awareness.

What remains: optional AI custom character (Slice 9 — split before starting), packaging/signing/distribution (Slice 10). Do not add backend services, Meshy integration, API keys, or AI generation without first planning Slice 9 sub-slices.

## Commands

Install dependencies:

```sh
pnpm install
```

Typecheck:

```sh
pnpm typecheck
```

Build:

```sh
pnpm build
```

Run the web sandbox locally:

```sh
pnpm --filter @ai-3d-demo/web dev
```

Run the Electron desktop shell (Slice 2):

```sh
# Terminal 1: start the renderer dev server
pnpm dev:web

# Terminal 2: launch Electron pointed at the dev server
pnpm dev:desktop
```

To run the desktop shell against a static build instead:

```sh
pnpm build
pnpm --filter @ai-3d-demo/desktop start
```

As of Slice 3 the desktop shell opens as a transparent, frameless,
always-on-top overlay strip near the bottom of the primary display. It loads
the renderer with `?mode=overlay`, which shows only the character stage
(open the same URL without the query param in a browser to get the full
sandbox page).

As of Slice 4 the overlay is click-through by default: mouse clicks pass
through the window to the apps underneath. To debug the overlay with the
mouse enabled, launch it in interactive mode instead (an "interactive" badge
is shown in the top-left corner):

```sh
# Terminal 2 alternative: overlay stays clickable for development
pnpm dev:desktop:interactive
```

To quit safely in either mode: use the tray menu (see below), press `Ctrl+C`
in the terminal that launched Electron, or right-click the Screen Friend Dock
icon and choose Quit.

As of Slice 6 a menu bar tray entry (a 🐾 text placeholder until real
character assets arrive in Slice 8) controls the companion at runtime:

- **Show Screen Friend** — restores the hidden overlay (recreates the window
  if it was destroyed).
- **Hide Screen Friend** — hides the overlay without losing app state.
- **Interactive Mode** — checkbox that toggles click-through on the fly; the
  launch env var only seeds the initial state, and the renderer badge follows
  the toggle.
- **Quit Screen Friend** — cleanly exits the app.

The empty tray image means non-macOS platforms may not render the 🐾 title;
the app currently targets macOS only.

As of Slice 7 preferences persist across restarts in a versioned JSON file at
`~/Library/Application Support/@ai-3d-demo/desktop/screen-friend-settings.json`:
the tray Interactive Mode toggle and the window position are saved and
restored (positions are only restored while they still land on a connected
display). `SCREEN_FRIEND_INTERACTIVE=1` remains a launch-only dev override
and never overwrites the persisted preference. The schema also reserves
`scale`, `personality`, and `behaviorIntensity` fields with safe defaults;
controls for those arrive in later slices. A missing or corrupt settings
file falls back to defaults instead of crashing.

As of Slice 5 the companion notices the mouse: when the cursor comes close,
calm actions (idle/walk/lie/stretch) are briefly interrupted by a short
"curious" reaction — the character perks up, turns toward the cursor, and
shows a small "!" marker. A cooldown keeps a lingering cursor from
retriggering the reaction, and naps are never interrupted. Reactions rely on
mousemove events reaching the renderer, so in normal click-through mode they
depend on Electron forwarding mouse moves (`forward: true`); they always work
in interactive mode and in the web sandbox.

## Updated Roadmap

1. ~~Character animation sandbox~~ — done (Slice 1): bottom-of-screen character stage with idle/walk/blink/lie-down/sleepy/sleep behaviors on a weighted random scheduler.
2. ~~Desktop shell~~ — done (Slice 2): Electron shell in `apps/desktop` hosting the web renderer.
3. ~~Always-on-top and click-through behavior~~ — done (Slices 3–4): transparent always-on-top overlay, click-through by default, interactive debug mode for development.
4. ~~Behavior scheduler~~ — done (Slice 5): mouse-near "curious" reaction with cooldown on top of the existing weighted random scheduler. Note: in normal click-through mode reactions depend on Electron forwarding mousemove events (`forward: true`), which still needs one manual QA pass on a real Mac.
5. ~~Tray/settings~~ — done (Slice 6): menu bar tray with Show/Hide, a runtime Interactive Mode toggle, and Quit. Scale/position controls are deferred to Slice 7 alongside persistence.
6. ~~Persistence~~ — done (Slice 7): versioned JSON settings store in the Electron main process; interactive mode and window position survive restarts, with scale/personality/intensity reserved in the schema.
7. ~~Character asset pipeline~~ — done (Slice 8): asset registry wired up; default CSS creature is `"default-css"`, future sprites plug in as new `CharacterAssetId` entries.
8. ~~Animation polish~~ — done (Slice 8.5): smoother movement easing (`ease-out`), ground contact shadow to anchor the character to the screen bottom, leg/tail animation during walk, lie/sleep flat-pose fix, sleepy sway, and a simple stage-bound near-edge class. No macOS Accessibility permissions, no real window detection, no new assets.
9. Optional AI character customization: revisit image upload and generated 3D characters after the companion MVP works.

## QA Checklist

See [docs/qa-checklist.md](docs/qa-checklist.md) for the full checklist covering automated typecheck/build, web sandbox smoke, desktop overlay (normal + interactive), tray manual QA, persistence restart QA, and animation polish verification.

## Deferred Work

- Tray scale/position/personality controls — later slice, building on the Slice 7 settings store.
- Packaging, signing, and distribution — Slice 10.
- Backend/API integration.
- Meshy or other AI generation services.
- GLB loading and generated model replacement.
