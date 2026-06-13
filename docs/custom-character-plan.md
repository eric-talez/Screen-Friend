# Custom Character Plan — Slice 9 Sub-Slice Breakdown

> Status: Slice 9A (planning), 9B (sprite renderer foundation), 9C (static asset switching UI), 9D (settings persistence for selected character asset ID), and 9E (provider/API evaluation — [provider-evaluation.md](provider-evaluation.md)) complete. 9F entry decision note drafted — [9f-entry-decision.md](9f-entry-decision.md). **9F-1 (mock scaffold) implemented** — feature-flagged (`?customGen=1`) mock-only generation UI that registers a local placeholder-based runtime asset via `registerCharacterAsset()`, with `default-css` fallback preserved. **No real AI generation, no upload, no provider integration, and no API call exist; full Slice 9F is not complete.**

---

## 1. Product Goal

A future user can provide a photo, drawing, or reference image.
Screen Friend transforms it into a **stylized cute desktop companion asset** — a sprite sheet or static pose set — that slots directly into the existing behavior loop and desktop overlay without any changes to the behavior engine.

The generated character should:

- Look distinct and personalized, reflecting the user's reference in spirit
- Fit the existing action set: `idle`, `walk`, `lie`, `sleepy`, `sleep`, `stretch`, `react`
- Work inside the transparent always-on-top overlay, same as `default-css` today
- Be registered via `characterAssets.ts` so the behavior engine never needs to know about AI

---

## 2. Non-Goals (Slice 9A and overall guardrails)

The following are **explicitly out of scope** and must not be implemented before their designated sub-slices:

| Out of scope | Designated slice |
|---|---|
| AI API integration (any provider) | 9F at earliest |
| Image upload UI implementation | 9C |
| Sprite renderer implementation | 9B |
| GLB / 3D model pipeline | Deferred beyond Slice 9G |
| Backend server, database, auth, billing | Not in roadmap |
| Copyrighted character cloning | Never |
| Real-person likeness cloning without explicit consent | Never |

---

## 3. Safety Rules

AI-assisted character generation carries IP and consent risks. These rules apply to all future implementation work:

### Copyright / IP

- **Bad:** "Make a Pikachu companion exactly as it appears."
- **Good:** "Small yellow electric-themed mascot with round ears and a lightning-bolt tail."

The generated output must be a **stylized mascot transformation**, not a copy of any protected character. The future generation UI must surface this constraint clearly before the user submits a reference.

### Likeness / Real People

- **Bad:** "Copy this person's face exactly onto my companion."
- **Good:** "Create a cute companion inspired by broad visual traits — hair color, general vibe — with user consent acknowledged."

No real-person likeness generation without an explicit consent acknowledgment step in the UI.

### Minimum Safety Gate — 9F real-provider path (required before any real API call)

The following are non-negotiable minimums that the 9F real-provider prototype must
include **before any real provider call is made**. They are not full UX polish; they
are the floor below which no real API call may be permitted:

1. Explicit user action — no auto-generation; one deliberate button press = one generation request.
2. Plain-language IP warning displayed before the submit button is enabled ("We stylize, not copy. Do not upload characters you don't own.").
3. Explicit checkbox for personal/reference photos ("I consent to this image being processed.") — submit blocked until checked.
4. Visible provider warning — user can see which provider will receive the image.

### Future UI Requirements — Slice 9G (UX hardening, not the first consent gate)

9G is the later UX hardening layer. It handles polish and robustness **on top of**
the minimal 9F safety gate. 9G is not the first consent gate:

1. Improved copy and clearer consent language.
2. Provider error state UI (rate limits, moderation refusals, network failures).
3. Retry/cost UI polish — visible per-character cost estimate, retry feedback.
4. Clearer privacy/provider data-retention display.
5. Richer recovery/fallback UX (e.g., smooth revert to `default-css` with explanation).

---

## 4. Technical Pipeline (Future Implementation)

The planned generation flow, for reference when designing 9B–9G:

```
User reference
  └─ [intake] photo / drawing / text prompt
       └─ [validation] file type, size, NSFW pre-check, IP warning, consent gate
            └─ [normalization] user reference → stylized style prompt (avoid direct copy)
                 └─ [generation] AI provider → N pose images (idle, walk, lie, sleep, react…)
                      └─ [post-process] transparent background, crop, scale to companion size
                           └─ [validation] alpha channel OK, dimensions within bounds
                                └─ [registration] new CharacterAssetId + CharacterAssetDefinition
                                     └─ [selection] runtime asset switching
                                          └─ [persistence] selected asset ID saved in settings
                                               └─ [fallback] default-css always available
```

### Integration points in the existing codebase

| Step | File / location |
|---|---|
| Asset registration | `apps/web/src/character/characterAssets.ts` — add new `CharacterAssetId` and `CharacterAssetDefinition` with `renderer: "sprite"` |
| Runtime rendering | `apps/web/src/components/CharacterStage.tsx` — add `renderer === "sprite"` branch (Slice 9B) |
| Persistence | `apps/desktop/src/settings.ts` — `ScreenFriendSettings.selectedCharacterId` (Slice 9D ✅); preload bridge exposes `getSelectedCharacterId` / `setSelectedCharacterId`; renderer reads/writes via bridge |
| Generation UI | New renderer component, not touching behavior engine (Slice 9F) |

The behavior engine (`behaviorEngine.ts`, `scheduler.ts`, `position.ts`, `mouse-tracker.ts`) must remain **completely unaware** of AI or provider code at all times.

---

## 5. Proposed Slice 9 Sub-Slice Split

| Sub-slice | Scope | AI? | Code change? |
|---|---|---|---|
| **9A** | Planning spec (this doc) | No | Docs only |
| **9B** ✅ | Sprite renderer foundation — `renderer: "sprite"` branch in CharacterStage, local placeholder SVG assets | No | Yes — renderer + local placeholder assets |
| **9C** ✅ | Static asset switching UI in web sandbox — radio selector switches between registered local assets (`default-css`, `placeholder-sprite`); no AI, no upload, no persistence | No | Yes — UI only |
| **9D** ✅ | Settings persistence for selected character asset ID (local asset ID only; no AI/upload) | No | Yes — persistence only |
| **9E** ✅ | Provider/API evaluation doc — compare OpenAI, Replicate, Fal.ai, Stability/Recraft, Meshy (3D, later); cost, quality, latency, data retention → [provider-evaluation.md](provider-evaluation.md) | No | Docs only |
| **9F-1** ✅ | **Mock-only generation scaffold** — feature-flagged (`?customGen=1`) UI with IP warning + mock consent gate that, on an explicit click, simulates work locally and registers a placeholder-based runtime sprite asset via `registerCharacterAsset()`. No AI, no upload, no provider, no key, no network. Failure path falls back to `default-css`. | No | Yes — feature-flagged mock UI |
| **9F** | AI generation prototype behind explicit user action — one provider, one happy path, feature-flagged, with minimal safety gate (IP warning + consent checkbox) before any real API call *(entry decision note: [9f-entry-decision.md](9f-entry-decision.md))*. **Not yet implemented** — gated by audit blocker B1. Real-provider prototype requires a **paid-tier Recraft account** before any real API call (B3 resolved 2026-06-13 — see [9f-entry-decision.md §5a](9f-entry-decision.md)). (B4 clarified 2026-06-13 — see §3.) | Yes | Yes — scoped prototype |
| **9G** | UX hardening layer — improved copy, provider error state UI, retry/cost UI polish, clearer privacy/data-retention display, richer recovery/fallback UX. **Not the first consent gate** — 9F already includes the minimal safety gate; 9G polishes it. | Yes | Yes — UX hardening |

Each sub-slice is a self-contained, reviewable PR. Do not combine sub-slices.

---

## 6. Acceptance Criteria

These criteria apply across all of Slice 9 and must hold true at every sub-slice boundary:

| Criterion | Verification |
|---|---|
| Existing desktop companion fully usable without AI | Launch app, confirm character runs with `default-css`, no AI calls in network tab |
| `default-css` remains fallback at all times | Set `selectedCharacterId` to unknown value → companion still shows |
| Behavior engine has zero dependency on AI or provider code | `grep -r "replicate\|fal\|meshy\|openai" apps/web/src/character/` → no matches |
| Generated assets plug into asset registry | New asset definition satisfies `CharacterAssetDefinition` type; `getCharacterAsset()` returns it |
| No backend introduced | No Express/Fastify/database in `package.json` |
| Safety UI present before any generation | Consent checkbox + IP warning visible in generation UI before submit |
| Paid-tier key confirmed before any real Recraft call | Before any real Recraft API call, confirm key belongs to a paid account; document plan tier in PR description (see [9f-entry-decision.md §5a](9f-entry-decision.md)) |

---

## References

- `apps/web/src/character/characterAssets.ts` — asset registry, `CharacterAssetId`, `CharacterAssetDefinition`
- `apps/web/src/components/CharacterStage.tsx` — rendering loop, asset class lookup
- `apps/desktop/src/settings.ts` — Electron settings schema (`ScreenFriendSettings`)
- `apps/desktop/src/renderer/` — Electron renderer
- `docs/provider-evaluation.md` — Slice 9E provider/API evaluation and 9F entry criteria
- `docs/roadmap.html` — full roadmap context
