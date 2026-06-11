# Screen Friend / 화면 친구

Screen Friend is a desktop companion app direction: a cute character that lives on the user's Mac screen, stays visible above other windows, and loops ambient behaviors like walking, blinking, lying down, and getting sleepy.

The current codebase is still a web-based prototype. The next product work should shift from "image upload to 3D generation" toward a character animation sandbox that can later become a transparent always-on-top desktop overlay.

## Current State

The repo currently includes:

- A pnpm workspace.
- A Vite + React + TypeScript app in `apps/web`.
- A React Three Fiber prototype scene.
- A temporary image-selection and mock-generation customization flow.
- A primitive character model inside an experimental MacBook-style 3D viewer.

The current upload/generation flow is not the MVP core. Treat it as a future customization prototype that may later help users create custom characters.

## MVP Direction

The real MVP should focus on:

- A character animation sandbox.
- A character positioned near the bottom of the screen.
- Idle loops such as standing, walking, blinking, lying down, and sleepy states.
- Future packaging as a transparent always-on-top desktop overlay.
- Later support for tray/settings controls.
- Optional AI-generated custom characters after the desktop companion loop works.

This project should not add backend services, Meshy integration, API keys, or AI generation as core MVP work yet.

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

To quit safely in either mode: press `Ctrl+C` in the terminal that launched
Electron, or right-click the Screen Friend Dock icon and choose Quit. The
click-through state is decided at launch, so relaunching in interactive mode
always recovers a clickable window.

## Updated Roadmap

1. ~~Character animation sandbox~~ — done (Slice 1): bottom-of-screen character stage with idle/walk/blink/lie-down/sleepy/sleep behaviors on a weighted random scheduler.
2. ~~Desktop shell~~ — done (Slice 2): Electron shell in `apps/desktop` hosting the web renderer. Transparent overlay is the next slice.
3. Always-on-top and click-through behavior: make the companion visible without blocking normal desktop use.
4. Behavior scheduler: transition between ambient states naturally with timers and simple rules.
5. Tray/settings: add visibility, scale, position, behavior toggles, and quit controls.
6. Optional AI character customization: revisit image upload and generated 3D characters after the companion MVP works.

## Deferred Work

- Electron/Tauri desktop shell.
- Transparent overlay implementation.
- Always-on-top and click-through behavior.
- Backend/API integration.
- Meshy or other AI generation services.
- GLB loading and generated model replacement.
