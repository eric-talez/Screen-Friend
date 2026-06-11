# Screen Friend QA Checklist

Current baseline: Slices 0–8.5 merged. Run before opening a PR or starting Slice 9.

---

## Automated checks

```sh
pnpm install
pnpm run typecheck
pnpm run build
pnpm --filter @ai-3d-demo/desktop run compile
```

All four commands must exit 0 with no type errors.

---

## Web sandbox smoke test

```sh
pnpm run dev:web
```

- [ ] Page loads without console errors.
- [ ] Character is visible in the sandbox stage.
- [ ] Character cycles through idle/walk/blink/lie/sleepy/sleep without freezing.
- [ ] Moving the mouse near the character triggers a brief "!" reaction.
- [ ] Behavior resumes normally after the reaction cooldown.

---

## Desktop overlay — normal (click-through) mode

```sh
# Terminal 1
pnpm run dev:web

# Terminal 2
pnpm run dev:desktop
```

- [ ] Overlay opens near the bottom of the primary display.
- [ ] Overlay has no frame or shadow.
- [ ] Character is visible above other windows.
- [ ] Clicking through the overlay reaches the apps underneath.
- [ ] Character animates without high CPU usage (check Activity Monitor).

> **Caveat:** In normal click-through mode, mouse-near `react` depends on Electron
> forwarding `mousemove` events (`forward: true`). Verify on a real Mac — one manual
> QA pass required.

---

## Desktop overlay — interactive mode

```sh
# Terminal 2 alternative
pnpm run dev:desktop:interactive
```

- [ ] "interactive" badge is visible in the top-left corner.
- [ ] Overlay is clickable (mouse does not pass through).
- [ ] Mouse-near reaction fires reliably in this mode.

---

## Tray / menu-bar manual QA

> Requires real macOS — one manual QA pass required.

- [ ] 🐾 tray icon appears in the menu bar.
- [ ] **Show Screen Friend** restores a hidden overlay (recreates window if destroyed).
- [ ] **Hide Screen Friend** hides the overlay; tray icon remains.
- [ ] **Interactive Mode** checkbox toggles click-through on the fly; badge follows.
- [ ] **Quit Screen Friend** exits cleanly; no orphaned process.

---

## Persistence restart QA

- [ ] Launch the desktop app; enable Interactive Mode via tray.
- [ ] Quit via tray → Quit Screen Friend.
- [ ] Relaunch (`pnpm run dev:desktop`).
- [ ] Interactive Mode toggle matches the saved state.
- [ ] To verify position persistence: inspect `~/Library/Application Support/@ai-3d-demo/desktop/screen-friend-settings.json` directly — confirm `windowX`/`windowY` are saved. User-facing position controls are deferred to a later slice; direct window dragging is not yet exposed.

> **Note:** The window will open at the saved position on next launch if the display is still connected. There is no user-facing drag-to-move control yet.

---

## Animation polish (Slice 8.5)

- [ ] Walk movement uses smooth ease-out (no instant teleport).
- [ ] Ground contact shadow is visible anchoring the character to the bottom edge.
- [ ] `near-edge` styling applies when character approaches stage boundaries.
- [ ] lie/sleep poses appear flat (no standing pose during sleep).
- [ ] sleepy sway is visible before sleep transition.

---

## Known caveats / deferred items

| Item | Status |
|---|---|
| Slice 5 forwarded `mousemove` in normal click-through | Real-device QA needed |
| Slice 6 tray menu clicks + badge toggle + click-through regression | Real-device QA needed |
| `scale`, `personality`, `behaviorIntensity` settings controls | Schema reserved; UI deferred |
| Actual sprite sheet assets | Deferred (after Slice 9 planning) |
| macOS Mission Control / fullscreen / multi-monitor overlay behavior | Real-device QA needed |
