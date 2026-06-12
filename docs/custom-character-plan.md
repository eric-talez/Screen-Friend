# Custom Character Plan — Slice 9 Sub-Slice Breakdown

> Status: Slice 9A (planning) and 9B (sprite renderer foundation) complete. No AI API.

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

### Future UI Requirements (Slice 9G)

Before any generation request is submitted:

1. Display a plain-language IP warning ("We stylize, not copy. Do not upload characters you don't own.").
2. Require an explicit checkbox for personal/reference photos ("I consent to this image being processed.").
3. Communicate provider data retention policy if applicable.

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
| Persistence | `apps/desktop/src/settings.ts` — extend `ScreenFriendSettings` with `selectedCharacterId`; expose only a minimal preload bridge if renderer needs read/update access in a later slice (Slice 9D) |
| Generation UI | New renderer component, not touching behavior engine (Slice 9F) |

The behavior engine (`behaviorEngine.ts`, `scheduler.ts`, `position.ts`, `mouse-tracker.ts`) must remain **completely unaware** of AI or provider code at all times.

---

## 5. Proposed Slice 9 Sub-Slice Split

| Sub-slice | Scope | AI? | Code change? |
|---|---|---|---|
| **9A** | Planning spec (this doc) | No | Docs only |
| **9B** ✅ | Sprite renderer foundation — `renderer: "sprite"` branch in CharacterStage, local placeholder SVG assets | No | Yes — renderer + local placeholder assets |
| **9C** | Local asset import/preview or static asset switching in UI, no AI | No | Yes — UI only |
| **9D** | Settings persistence for selected character asset ID | No | Yes — persistence only |
| **9E** | Provider/API evaluation doc — compare Meshy, Replicate, Fal.ai, others; cost, quality, latency, data retention | No | Docs only |
| **9F** | AI generation prototype behind explicit user action — one provider, one happy path, feature-flagged | Yes | Yes — scoped prototype |
| **9G** | Safety/consent/error UX hardening — IP warning, consent gate, provider error handling, generation failure fallback | Yes | Yes — UX layer |

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

---

## References

- `apps/web/src/character/characterAssets.ts` — asset registry, `CharacterAssetId`, `CharacterAssetDefinition`
- `apps/web/src/components/CharacterStage.tsx` — rendering loop, asset class lookup
- `apps/desktop/src/settings.ts` — Electron settings schema (`ScreenFriendSettings`)
- `apps/desktop/src/renderer/` — Electron renderer
- `docs/roadmap.html` — full roadmap context
