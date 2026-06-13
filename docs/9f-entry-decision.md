# Slice 9F Entry Decision Note

> **Status:** Slice 9F entry decision note — docs-only.
> No code, no API keys, no provider calls.
> Access / check date: **2026-06-13**.

This document satisfies the provider decision gate defined in
[provider-evaluation.md §4](provider-evaluation.md#provider-decision-gate-for-9f-must-record-before-coding-starts)
and the entry criteria in [provider-evaluation.md §6](provider-evaluation.md#6-slice-9f-entry-criteria).
No 9F provider call, personal-photo flow, or production merge may proceed until
the relevant open questions in §7 are resolved. Code scaffolding and mock-only
prototyping may begin if it remains feature-flagged, uses no real API key, and
preserves `default-css` fallback.

---

## 1. Decision Summary

| Item | Decision |
|---|---|
| **Primary provider** | Recraft |
| **Primary model ID** | `recraftv4_1` (raster) |
| **Transparent output plan** | 2-step: generate image → call Recraft remove-background endpoint |
| **Fallback provider / model** | OpenAI `gpt-image-2` + separate bg-removal step |
| **Fallback bg-removal model** | Recraft remove-background endpoint (or equivalent) |
| **Cost est. — 7 poses, base** | generation $0.04 × 7 = **$0.28** + bg-removal $0.01 × 7 = **$0.07** → **$0.35 total** |
| **Cost est. — 7 poses, worst case (2 retries)** | $0.35 × 3 = **~$1.05** |
| **Data retention / training opt-out** | Recraft API: inputs **never** used for training (official) |
| **Commercial rights** | Recraft: full ownership on **paid tier** (official) |
| **API key storage plan** | Electron main process only — see §5 |

### Why Recraft over OpenAI as primary

OpenAI's current recommended model (`gpt-image-2`) **explicitly does not support
`background:"transparent"`** — confirmed against official OpenAI docs on
2026-06-13. All older GPT Image models (`gpt-image-1`, `gpt-image-1.5`,
`gpt-image-1-mini`) are deprecated with shutdown dates in Oct–Dec 2026;
`dall-e-2` and `dall-e-3` were already removed in May 2026. Because no currently
supported OpenAI model provides native transparent output, OpenAI cannot be the
unconditional primary per the gate requirement in
[provider-evaluation.md §4](provider-evaluation.md#4-recommended-path-for-9f).

Recraft `recraftv4_1` is built for flat, clean, branded mascot art. Its
background-removal endpoint is documented and priced. Data retention and
commercial-rights terms are confirmed from official sources. It is the
conservative, style-fit choice for the first prototype.

---

## 2. Source Verification

All facts that influence the decision are listed here with source, access date,
and official/third-party classification.

### 2.1 OpenAI

| Fact | Claim | Source | Type | Date |
|---|---|---|---|---|
| Current recommended model | `gpt-image-2` | [OpenAI image generation guide](https://developers.openai.com/api/docs/guides/image-generation) | Official | 2026-06-13 |
| `gpt-image-2` transparent background | **Not supported** — requests with `background:"transparent"` are rejected | [OpenAI image generation guide](https://developers.openai.com/api/docs/guides/image-generation) | Official | 2026-06-13 |
| `gpt-image-1` deprecation | Shutdown **2026-10-23** | [OpenAI deprecations page](https://developers.openai.com/api/docs/deprecations) | Official | 2026-06-13 |
| `gpt-image-1.5`, `gpt-image-1-mini` | Shutdown **2026-12-01** | [OpenAI deprecations page](https://developers.openai.com/api/docs/deprecations) | Official | 2026-06-13 |
| `dall-e-2`, `dall-e-3` | Already removed (May 2026) | [OpenAI deprecations page](https://developers.openai.com/api/docs/deprecations) | Official | 2026-06-13 |
| `gpt-image-2` price (medium, 1024×1024) | $0.053/image | [OpenAI image generation guide](https://developers.openai.com/api/docs/guides/image-generation) | Official | 2026-06-13 |
| Commercial rights for API outputs | **(to verify)** — policy pages returned HTTP 403 | https://openai.com/policies/usage-policies | Official URL inaccessible | 2026-06-13 |
| Data retention / training opt-out | **(to verify)** — policy pages returned HTTP 403 | https://openai.com/policies/api-data-usage-policies | Official URL inaccessible | 2026-06-13 |

### 2.2 Recraft

| Fact | Claim | Source | Type | Date |
|---|---|---|---|---|
| Current model ID (raster) | `recraftv4_1` | [Recraft API examples](https://www.recraft.ai/docs/api-reference/examples.md) | Official | 2026-06-13 |
| Current model ID (vector) | `recraftv4_1_vector` | [Recraft API examples](https://www.recraft.ai/docs/api-reference/examples.md) | Official | 2026-06-13 |
| Background removal endpoint | Available; "produces a transparent-background cutout" | [Recraft API getting started](https://www.recraft.ai/docs/api-reference/getting-started.md) | Official | 2026-06-13 |
| Native gen alpha channel output | **(to verify)** — bg-removal endpoint confirmed; gen endpoint format not explicitly stated | [Recraft API getting started](https://www.recraft.ai/docs/api-reference/getting-started.md) | Official | 2026-06-13 |
| V4.1 raster price | $0.04/image | [Recraft API pricing](https://www.recraft.ai/docs/api-reference/pricing.md) | Official | 2026-06-13 |
| V4.1 vector price | $0.08/image | [Recraft API pricing](https://www.recraft.ai/docs/api-reference/pricing.md) | Official | 2026-06-13 |
| Background removal price | $0.01/request | [Recraft API pricing](https://www.recraft.ai/docs/api-reference/pricing.md) | Official | 2026-06-13 |
| API inputs → model training | **Never** — "Data sent through the Recraft API is processed only to generate requested results and is not stored or used to improve models." | [Recraft data use and model training](https://www.recraft.ai/docs/trust-and-security/data-use-and-model-training.md) | Official | 2026-06-13 |
| Training opt-out (paid plan) | Available via "Help improve Recraft" toggle in Profile settings | [Recraft data use and model training](https://www.recraft.ai/docs/trust-and-security/data-use-and-model-training.md) | Official | 2026-06-13 |
| Commercial rights (paid tier) | Full ownership; commercial use permitted; images private | [Recraft commercial rights and ownership](https://www.recraft.ai/docs/plans-and-billing/commercial-rights-and-ownership.md) | Official | 2026-06-13 |
| Commercial rights (free tier) | **Not commercial** — images public in community gallery, property of Recraft | [Recraft commercial rights and ownership](https://www.recraft.ai/docs/plans-and-billing/commercial-rights-and-ownership.md) | Official | 2026-06-13 |
| Generated assets → AI training | Prohibited (both tiers) | [Recraft commercial rights and ownership](https://www.recraft.ai/docs/plans-and-billing/commercial-rights-and-ownership.md) | Official | 2026-06-13 |

---

## 3. Cost Model Detail

Base assumption: 7 poses (`idle`, `walk`, `lie`, `sleepy`, `sleep`, `stretch`, `react`).

| Step | Per-image cost | × 7 poses | × 3 (2 retries worst case) |
|---|---|---|---|
| Recraft `recraftv4_1` generation | $0.04 | $0.28 | $0.84 |
| Recraft remove-background | $0.01 | $0.07 | $0.21 |
| **Total** | **$0.05** | **$0.35** | **$1.05** |

Notes:
- Retry cap in the 9F implementation must be ≤ 2 per pose (enforced in code, not just policy).
- A cost/quota guard in the IPC handler must enforce the hard cap before any provider call.
- If alpha validation fails post-bg-removal, fall back to `default-css` — do not retry indefinitely.

---

## 4. Recommended 9F Path

### Primary: Recraft `recraftv4_1`

1. User triggers generation (explicit button — no auto-generation).
2. Renderer calls narrow IPC method (no arbitrary IPC).
3. Main process calls Recraft `recraftv4_1` → opaque raster image.
4. Main process calls Recraft remove-background endpoint → transparent cutout.
5. Main process validates alpha channel and dimensions.
6. On success: register as new `CharacterAssetDefinition` in `characterAssets.ts`.
7. On any failure: fall back to `default-css`. No silent error swallowing.

### Fallback: OpenAI `gpt-image-2` + bg-removal step

Used if Recraft is unavailable or rate-limited. Requires an additional background-removal
step (e.g., Recraft remove-background, or equivalent). OpenAI commercial terms must be
verified before any production use (currently marked `(to verify)` — see §7).

### Why 3D/GLB remains deferred

The renderer is 2D sprite-based. GLB adds rigging, per-pose animation baking, and
Three.js loading overhead. The companion does not need it for 9F. Meshy remains the
on-record GLB path, to be evaluated in a separate slice (9G+).

### How `default-css` fallback is preserved

The `CharacterAssetId` for `default-css` remains registered in `characterAssets.ts`
and is the fallback returned by `getCharacterAsset()` for any unknown or failed ID.
No behavior-engine code reads the provider or generation state. The entire AI path
lives in a narrow IPC handler in main — invisible to `behaviorEngine.ts`,
`scheduler.ts`, `position.ts`, and `mouse-tracker.ts`.

---

## 5. API Key Storage Plan

Architecture description — no code written here.

- The Recraft API key lives in the **Electron main process only** (`main.ts` or
  a dedicated secrets module imported only from main).
- It is loaded from `process.env` at runtime, or from a local developer `.env`
  file that is `.gitignore`d.
- It is **never** placed in:
  - the renderer bundle
  - any `VITE_*` environment variable (those are embedded in the client build)
  - log output
  - a committed file
- The renderer may request character generation through a **single narrow IPC
  channel** (e.g., `ipc: 'generate-character-pose'`). The raw key never
  crosses the IPC boundary in either direction.
- No arbitrary IPC passthrough for provider calls.
- `.env.example` lists the placeholder variable name only:
  ```
  RECRAFT_API_KEY=your_key_here
  ```
- The 9F PR must include a grep check confirming the key name never appears in
  renderer source or the compiled bundle.

---

## 6. 9F PR Requirements

The future 9F implementation PR must satisfy **all** of the following before merge:

- [ ] **Explicit user button/action** — generation fires only from a deliberate UI action; no auto-generation on app start, asset switch, or settings change
- [ ] **Feature flag** — entire generation path gated by a compile-time or runtime flag; disabled by default
- [ ] **No auto-generation** — confirmed: one user action = one generation request
- [ ] **IP warning** — plain-language warning displayed before the submit button is enabled ("We stylize, not copy. Do not upload characters you don't own.")
- [ ] **Personal-photo consent gate** — explicit checkbox acknowledgement required; submit blocked until checked
- [ ] **Cost / retry cap** — hard per-pose retry limit (≤ 2) and per-character cost cap enforced in the IPC handler before any API call
- [ ] **Provider error fallback** — any provider error (rate limit, moderation refusal, network failure, bad response) falls back to `default-css`; error is surfaced to the user, not silently swallowed
- [ ] **Alpha channel validation** — post-bg-removal output validated for transparent PNG format and acceptable dimensions before registration
- [ ] **`CharacterAssetDefinition` registration** — generated asset registered via `characterAssets.ts` using the standard `CharacterAssetId` / `CharacterAssetDefinition` shape with `renderer: "sprite"`
- [ ] **Zero behavior-engine dependency** — `grep -r "recraft\|openai" apps/web/src/character/` → no matches in `behaviorEngine.ts`, `scheduler.ts`, `position.ts`, `mouse-tracker.ts`
- [ ] **`default-css` fallback preserved** — confirmed: setting `selectedCharacterId` to an unknown value still renders the companion via `default-css`

> **9F vs 9G scope decision (2026-06-13):** The IP warning and personal-photo
> consent gate above are **minimum non-negotiable requirements for the 9F
> real-provider path** — they must be present before any real API call, regardless
> of polish level. This does **not** mean 9F must include full UX hardening.
> **Slice 9G** is the later hardening layer and handles: improved copy, provider
> error state UI, retry/cost UI polish, clearer privacy/data-retention display,
> and richer recovery/fallback UX. 9G is not the first consent gate — 9F is.
> Keeping this split prevents 9F from silently expanding into full UX polish and
> prevents 9G from being treated as the first safety layer. See
> [`pre-9f-audit.md`](pre-9f-audit.md) §4 B4 and
> [`custom-character-plan.md`](custom-character-plan.md) §3/§5.

---

## 7. Open Questions / Blockers

The following items are marked `(to verify)` and must be resolved before the 9F
PR is approved for merge. They do not block branch creation or early prototyping,
but they block any real API call with personal photos or production use.

| # | Item | Blocker for |
|---|---|---|
| 1 | **Recraft remove-background output format** — confirm it produces transparent PNG (not WebP or other format) and that the alpha channel is clean enough for the overlay | 9F merge |
| 2 | **Recraft V4.1 style fit** — empirical test generation needed (requires a paid-tier account and API key) | 9F merge |
| 3 | **OpenAI commercial rights for API outputs** — policy pages returned HTTP 403 on 2026-06-13; must verify before using OpenAI as fallback in production | Production / OpenAI fallback |
| 4 | **OpenAI data retention window and training opt-out** — same HTTP 403 issue; must verify before any personal-photo flow uses the OpenAI path | Production / OpenAI fallback |
| 5 | **Per-pose identity / consistency** — neither provider guarantees the same character across 7 separate generation calls; empirical testing needed to set realistic user expectations | 9F UX design |
| 6 | **Recraft latency at generation + bg-removal** — acceptable for a foreground user-initiated flow; not verified empirically | 9F UX design |
