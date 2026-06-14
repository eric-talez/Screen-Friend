# Provider / API Evaluation — Slice 9E

> Status: **Slice 9E (docs-only).** This document evaluates third-party image
> providers for *future* Screen Friend custom-character generation. It introduces
> **no code, no dependencies, no API keys, and no provider calls.** It exists to
> gate Slice 9F (the first scoped AI prototype): 9F may not begin until the
> entry criteria in §6 are met.

## Verification posture

Provider pricing, alpha/transparency support, data-retention defaults,
commercial-rights terms, model availability, and safety policy **change
frequently** and vary by model and plan tier. This evaluation cites current
sources where they could be confirmed in-environment, with an **access date of
2026-06-12**. Any claim that could not be confirmed against an official source
is marked **(to verify)**. Do not treat a `(to verify)` cell as fact — confirm
it against the provider's own docs/DPA before it influences a real
implementation decision.

Pricing figures below are **order-of-magnitude reference points**, not quotes —
always re-check the provider's pricing page at integration time.

---

## 1. Product requirement

Screen Friend wants to let a user turn a reference (photo, drawing, or text
prompt) into a **cute, stylized desktop-companion asset** that drops into the
existing behavior loop with **zero behavior-engine changes**.

Hard requirements for the *first* target:

- **First target is a 2D sprite / pose set, not GLB.** 3D is deferred (see §2,
  §4). 2D matches the current renderer: assets register through
  `apps/web/src/character/characterAssets.ts` as a `CharacterAssetDefinition`
  with `renderer: "sprite"`, and `default-css` must remain the always-available
  fallback.
- **Transparent background, or trivially easy background removal.** The overlay
  is a transparent always-on-top window; any opaque/bg-filled output is unusable
  without a clean alpha channel.
- **Consistent character across poses.** The behavior FSM uses these actions and
  the generated set must read as the *same character* across all of them:
  `idle`, `walk`, `lie`, `sleepy`, `sleep`, `stretch`, `react`.
- **Commercial-safe use.** The companion is a shippable product; generated
  output and the model license must permit commercial use and asset ownership.
- **Reasonable latency and cost.** Generation is a one-time, user-initiated
  action per character — a few seconds per pose is acceptable; per-character
  cost should stay in the low cents-to-dollar range.
- **Privacy.** References may include personal photos. Data retention and
  training-on-input behavior must be acceptable and surfaced to the user.

These map to the pipeline already sketched in
[custom-character-plan.md](custom-character-plan.md) §4 (intake → validation →
normalization → generation → post-process/alpha → registration → fallback).

---

## 2. Providers compared

**First-target candidates (2D image generation):**

| Provider | What it is | Notes |
|---|---|---|
| **OpenAI image generation** | GPT-Image family via the Images/Responses API | First-party, native `background: "transparent"` PNG/WebP support on supported models. |
| **Replicate** | Hosted marketplace of community + first-party models (FLUX, Recraft, SDXL, bg-removal models) | One API key, many models; bg-removal models available as a separate step. |
| **fal.ai** | Hosted marketplace, 600+ models (FLUX, Recraft, Seedream, etc.), pay-as-you-go | Fast inference focus; per-image or per-megapixel billing. |
| **Stability AI** | First-party Stable Image / Stable Diffusion API | Community License free under a revenue threshold; you keep output ownership. |
| **Recraft** (via own API, or via Replicate/fal) | Style-controlled raster **and native vector/SVG** generation, plus bg-removal | Strong fit for clean, flat, transparent mascot art; reachable directly or through the marketplaces above. |

**Not first target — later GLB option only:**

| Provider | What it is | Why deferred |
|---|---|---|
| **Meshy** *(to verify — terms/pricing)* | Image-to-3D / text-to-3D (GLB) | 3D is **deferred beyond Slice 9G** per [custom-character-plan.md](custom-character-plan.md) §2. Listed only so it is on record as the eventual GLB path, **not** a 9F candidate. |
| Other 3D (e.g. text-to-3D on Replicate/fal) | Image/text → mesh | Same as above — out of first-target scope. |

---

## 3. Evaluation dimensions

Ratings are **qualitative judgments** (Good / OK / Weak / Unknown) based on the
sources in §7 plus the product fit in §1. Factual cells that could not be
confirmed are `(to verify)`.

### 3.1 Capability & fit

| Dimension | OpenAI image | Replicate | fal.ai | Stability AI | Recraft |
|---|---|---|---|---|---|
| **2D sprite suitability** | Good — strong stylization, prompt-following | Good — model choice (FLUX/Recraft/SDXL) | Good — same model breadth | OK — capable but less style-locked | **Good** — built for flat/branded/vector art |
| **Multi-pose consistency** | OK — edit/reference-image flows help, but per-pose drift is the core risk *(to verify per model)* | OK — depends on chosen model; some support reference/IP-adapter *(to verify)* | OK — same caveat *(to verify)* | Weak/OK *(to verify)* | OK — style controls help; per-pose identity still a risk *(to verify)* |
| **Transparent / alpha** | **Conditional** — transparent output exists on *some* GPT Image models via `background:"transparent"`, but **exact current model support must be verified against official OpenAI docs before 9F** (support is model-specific and some variants reportedly reject the parameter). If no currently supported model provides native alpha, 9F must either (a) add a one-step background-removal pipeline, or (b) switch to Recraft as primary provider. *(to verify)* | OK — via dedicated bg-removal models (e.g. Recraft remove-bg) as a 2nd step | OK — Recraft/other models or a bg-removal step | Weak/OK — generally needs a bg-removal step *(to verify)* | **Good** — documented transparent-cutout bg-removal path + vector/SVG output; **paid-tier artifact confirmed 2026-06-13:** output is **WebP with clean alpha**; actual transparent pixels confirmed. Suitable for overlay. (Q1 Verified — see [9f-b1-verification-plan.md §3b](9f-b1-verification-plan.md#3b-evidence-log--recraft-paid-tier-artifact-pass-2026-06-13)) |

### 3.2 Operational

| Dimension | OpenAI image | Replicate | fal.ai | Stability AI | Recraft |
|---|---|---|---|---|---|
| **API ergonomics** | Good — single first-party SDK, stable surface | Good — uniform run/predictions API across models | Good — uniform pay-as-you-go API | OK — first-party REST | OK — own REST, also reachable via marketplaces |
| **Cost model** | Per output image, by quality+size: ~$0.005–$0.25/image *(GPT-Image-1 ~$0.011–$0.25 — pricing and model availability are point-in-time figures from third-party sources; any deprecation timeline must be verified against official OpenAI docs before 9F)* **(to verify)** | Per-run, varies by model (fractions of a cent → few cents) | Per-image / per-megapixel (e.g. FLUX schnell ~$0.003/MP; many models ~$0.01–$0.08/img) | Credit-based: 1 credit = $0.01; ~$0.065/gen for SD3.5; $20/mo membership for 6000 credits | Fixed per image: ~$0.04 raster / ~$0.08 vector (V3); ~$0.022 / ~$0.044 (20B) |
| **Latency** | OK–Good *(to verify — varies by quality tier)* | OK — includes cold-start/boot on some models *(to verify)* | Good — optimized for low latency *(to verify)* | OK *(to verify)* | **OK — Verified 2026-06-13:** avg ~5,400ms generation + ~2,200ms bg-removal = ~7,600ms per pose; acceptable for foreground one-time flow (see [9f-b1-verification-plan.md §3b](9f-b1-verification-plan.md#3b-evidence-log--recraft-paid-tier-artifact-pass-2026-06-13)) |
| **Implementation complexity** | Low — one provider, native alpha, no separate bg step | Medium — pick model + likely a separate bg-removal step | Medium — same as Replicate | Medium — model + bg-removal step | Low–Medium — documented bg-removal / transparent-cutout path, but extra account/key if used directly; exact output format still to confirm via Q1 artifact |
| **Vendor lock-in** | Higher — first-party API shape | Lower — marketplace, swap models behind one key | Lower — marketplace, swap models | Medium | Medium — but also reachable via Replicate/fal, reducing lock-in |

### 3.3 Trust, safety & legal

| Dimension | OpenAI image | Replicate | fal.ai | Stability AI | Recraft |
|---|---|---|---|---|---|
| **Data retention / privacy** | API inputs/outputs governed by OpenAI API data-usage + retention policy; API data not used for training by default, with a limited-retention window for abuse monitoring. **Window & opt-out verified 2026-06-13** (official OpenAI developer docs, [your-data guide](https://developers.openai.com/api/docs/guides/your-data)): not used to train by default; abuse-monitoring logs retained ≤ 30 days by default; Zero Data Retention / Modified Abuse Monitoring opt-out available. Canonical `openai.com/policies` page was HTTP 403. Point-in-time — see [9f-b1-verification-plan.md §3a](9f-b1-verification-plan.md#3a-evidence-log--official-doc-pass-2026-06-13). | Per-platform + per-model terms **(to verify retention)** | **(to verify retention)** — not stated in sources | **(to verify retention)** | **(to verify retention)** |
| **Content safety controls** | Good — built-in moderation/safety system on the image API | Varies by model; platform-level policy **(to verify)** | Varies by model **(to verify)** | Provider policy **(to verify)** | Provider policy **(to verify)** |
| **Commercial rights / terms risk** | OK — outputs usable commercially under OpenAI terms **(to verify current terms — official Usage Policies / Terms of Use / Business / Services / Enterprise-privacy pages still returned HTTP 403 on 2026-06-13, incl. browser-style UA; Blocked, not Verified — see [9f-b1-verification-plan.md §3a](9f-b1-verification-plan.md#3a-evidence-log--official-doc-pass-2026-06-13))** | Mixed — **per-model licenses differ**; some (e.g. RMBG v1.4) restrict commercial use; many (Recraft V3) are commercial-friendly. **Must check each model.** | Mixed — model-license dependent; platform states commercial use supported, but per-model licenses apply | OK — Community License free for commercial use **under a revenue threshold (~$1M/yr)**; you keep output ownership *(to verify threshold & current terms)* | OK — commercial use supported **(to verify plan-tier terms)** |

**Key cross-cutting legal finding:** on the marketplaces (Replicate, fal),
commercial rights are **model-by-model**, not platform-wide. Whatever model 9F
picks, its specific license must be confirmed and recorded.

---

## 4. Recommended path for 9F

**Recommended conservative prototype: a single 2D image-generation provider with
native or one-step transparent output, post-processed to a clean alpha sprite,
registered through the existing `characterAssets.ts` model, with `default-css`
preserved as fallback.**

Concretely:

1. **Stay 2D.** Do **not** choose 3D/GLB for 9F. There is no strong reason to —
   the renderer is 2D sprite-based, GLB is deferred beyond 9G, and 3D adds rigging,
   per-pose animation, and weight the companion doesn't need. (If a future slice
   ever justifies GLB, that is a separate evaluation, with Meshy as the on-record
   candidate.)
2. **Primary candidate: OpenAI image generation** — *if and only if* an exact
   current model that supports `background:"transparent"` is confirmed against
   official OpenAI docs. If confirmed, it offers the simplest 9F path:
   first-party SDK, single vendor, built-in safety moderation, no separate
   bg-removal step needed. **If no currently supported OpenAI model provides
   native transparent output at 9F start, use Recraft as the primary provider
   instead.** Verifying this is **the first step before any 9F coding.**
   **(to verify — exact model ID + alpha support against official docs.)**
3. **Safer first-provider alternative: Recraft (directly or via Replicate/fal)**
   — documented transparent-cutout bg-removal path + vector/SVG output; exact
   output file format (PNG vs WebP) and clean alpha to be confirmed via paid-tier
   Q1 artifact. Built for flat, clean, transparent mascot/vector art. Reachable
   through a marketplace key to reduce lock-in. Prefer Recraft as primary if
   OpenAI transparent support cannot be confirmed before 9F starts.
4. **Always-on local fallback: `default-css`.** Never gate the companion on a
   successful generation. Any failure (network, moderation refusal, bad alpha)
   falls back to `default-css`, exactly as today.
5. **Single happy path, feature-flagged.** One provider, one pose-set request,
   behind an explicit user action and a feature flag — matching the 9F scope in
   [custom-character-plan.md](custom-character-plan.md) §5.

### Must verify before any real API call (9F)

- [ ] Exact model id and that it **supports transparent PNG output** (or that a
      one-step bg-removal model is wired) — **(to verify)**.
- [ ] Current **per-image price** and a worst-case per-character cost (all poses
      × retries) — **(to verify)**.
- [ ] **Commercial-rights / output-ownership** terms for the chosen model and **exact plan tier** — free tier is not sufficient for Recraft (non-commercial, public, Recraft-owned); a paid-tier key must be confirmed before any real call. Treat pricing/terms as point-in-time and re-verify at integration. **(to verify at implementation time)**.
- [ ] **Data retention** default and whether API inputs are used for training;
      whether a no-retention / opt-out path exists — **(to verify)**.
- [ ] **Latency** at the chosen quality tier is acceptable for a foreground UX — **(to verify)**.
- [ ] **Content-safety** behavior on a personal-photo input (what gets refused) — **(to verify)**.

### Provider decision gate for 9F (must record before coding starts)

Before writing any 9F code, record all of the following in a short decision
note (a dedicated section in the 9F PR description is sufficient):

| Item | To fill in before 9F |
|---|---|
| Exact provider name | |
| Exact model ID | |
| Transparent output plan | Native alpha confirmed? Or which bg-removal step? |
| Fallback / bg-removal model | (if native alpha not available) |
| Cost estimate per full 7-pose character | 7 images × price + expected retries |
| Data retention / training-opt-out policy | Source link required |
| Commercial rights terms | Source link + plan-tier required |
| API key storage plan | Must be main-process only, not committed, not logged |

This gate exists so that all 9F contributors start from the same verified
baseline, not from the provisional provider comparison in this doc.

**Provider decision recorded:** [docs/9f-entry-decision.md](9f-entry-decision.md)
pins the selected provider/model, confirmed cost estimate, verified source links,
API key storage plan, and open questions. No real provider integration, real API
call, personal-photo flow, or production generation path may proceed until the
relevant open question blocker (B1) is resolved (B3 resolved 2026-06-13 — see [9f-entry-decision.md §5a](9f-entry-decision.md)). Mock-only scaffolding
is allowed if feature-flagged, uses no real API key, makes no provider call, and
preserves `default-css` fallback. (9F-1 mock scaffold was merged in PR #20.)

---

## 5. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| **IP / copyright copying** — user asks for a protected character | High (legal) | Style-transform-only prompt normalization (plan §3); plain-language IP warning before submit; never "copy exactly". |
| **Real-person likeness consent** — personal photo without consent | High (legal/ethical) | Explicit consent checkbox gate before any personal-photo submit (plan §3); broad-traits-not-faithful-copy normalization. |
| **Provider data retention** — sensitive input stored/trained on | High (privacy) | Verify retention + training-opt-out before integrating; surface the provider's policy in the UI; prefer no-retention path if offered. |
| **Inconsistent pose generation** — poses don't read as same character | Medium (quality) | Use reference-image/edit flows + fixed style seed; generate-then-review step; allow per-pose regenerate; cap retries. |
| **Failed transparent background** — opaque/haloed alpha | Medium (quality) | Validate alpha channel + dimensions post-generation (plan §4); auto bg-removal fallback; reject + fall back to `default-css` on failure. |
| **Cost runaway** — retries/loops burn spend | Medium (cost) | Hard per-character generation cap; retry limit; cost guardrail/quota before any call; one user-initiated action per generation. |
| **API key leakage** — key shipped in renderer or logs | High (security) | Key stored in main process only, never in the renderer/bundle; never logged; not committed; `VITE_*` only for non-secret values. (See 9F entry criteria.) |
| **User-expectation mismatch** — "make me exactly X" disappointment | Medium (UX) | Set expectations up front ("we stylize, not clone"); show it's a one-time generation; preview before commit; easy revert to `default-css`. |

---

## 6. Slice 9F entry criteria

Slice 9F (first AI generation prototype) **must not start** until **all** of the
following are decided and recorded:

1. **Selected provider + fallback** — one primary provider/model and one
   fallback, each with its commercial-rights terms confirmed for the **exact plan
   tier** being used. Free-tier use is blocked for real generation unless the
   provider's terms explicitly permit private commercial ownership on the free
   tier (must be cited with source and date). Recraft free-tier specifically is
   blocked: free-tier images are non-commercial, publicly visible in the community
   gallery, and owned by Recraft — not the user (verified 2026-06-13,
   [Recraft commercial rights and ownership](https://www.recraft.ai/docs/plans-and-billing/commercial-rights-and-ownership.md)).
   A paid Recraft account/key must be confirmed and documented in the PR before
   any real call is made.
2. **API-key storage plan** — keys live in the Electron **main process only**,
   never in the renderer/bundle, never logged, never committed; injected at
   runtime; documented.
3. **Explicit user-action UX** — generation only ever fires from a deliberate
   user action (button), never automatically; one action = one generation.
4. **Consent / IP-warning UI plan** — plain-language IP warning + explicit
   personal-photo consent checkbox shown before submit. These are **minimum 9F
   real-provider requirements** (not deferred to 9G). Scope decision (2026-06-13):
   9F must include the minimal safety gate before any real provider call; 9G is the
   later UX hardening layer (better copy, error states, polish) — not the first gate.
   See [custom-character-plan.md §3](custom-character-plan.md).
5. **Rate / cost guardrail** — per-character generation cap, retry limit, and a
   spend/quota guard defined before the first real call.
6. **No behavior-engine dependency** — `behaviorEngine.ts`, `scheduler.ts`,
   `position.ts`, `mouse-tracker.ts` stay completely unaware of any provider/AI
   code (verifiable via grep, plan §6 acceptance).
7. **`default-css` fallback preserved** — companion remains fully usable with no
   AI; any generation failure falls back to `default-css`.

---

## 7. Sources

Accessed **2026-06-12**. Treat all pricing/terms as point-in-time references to
re-verify at integration.

- [OpenAI API Reference — Create image](https://developers.openai.com/api/reference/python/resources/images/methods/generate)
- [OpenAI API Reference — Create image edit](https://developers.openai.com/api/reference/python/resources/images/methods/edit)
- [OpenAI API Pricing](https://openai.com/api/pricing/)
- [OpenAI GPT Image API Pricing Calculator (Jun 2026) — costgoat](https://costgoat.com/pricing/openai-images)
- [fal.ai — Model pricing docs](https://fal.ai/docs/documentation/model-apis/pricing)
- [fal AI Pricing 2026 — CostBench](https://costbench.com/software/ai-ml-platforms/fal/)
- [Compare Replicate & fal.ai API costs 2026 — Price Per Token](https://pricepertoken.com/image)
- [Replicate — Pricing](https://replicate.com/pricing)
- [Replicate — Recraft remove-background model](https://replicate.com/recraft-ai/recraft-remove-background)
- [Replicate — Text-to-image collection](https://replicate.com/collections/text-to-image)
- [Stability AI — Developer Platform pricing](https://platform.stability.ai/pricing)
- [Stability AI — License](https://stability.ai/license)
- [Recraft — API pricing](https://www.recraft.ai/docs/api-reference/pricing)
- [AI Image Generation API Pricing: 12 Providers (2026) — Digital Applied](https://www.digitalapplied.com/blog/ai-image-generation-api-pricing-comparison-2026)

**Still to verify (not confirmed in-environment):** per-provider data-retention
windows and training-opt-out; exact GPT-Image model with transparent-background
support post-deprecation; Meshy terms/pricing; Stability Community License
revenue threshold currency; per-model commercial licenses on Replicate/fal for
whatever model 9F selects.
