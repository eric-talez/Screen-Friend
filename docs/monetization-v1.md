# Monetization Model v1 — Screen Friend / 화면 친구

> **Status:** Product strategy decision note — **docs-only**.
> No payment code, no Stripe, no Apple IAP, no backend, no API provider code.
> This doc records a pricing/product decision **before** any payment implementation slice.
> Date: **2026-06-13**.

This note captures the v1 monetization model so the eventual payment slice starts
from a recorded decision rather than ad-hoc assumptions. It does **not** choose a
payment processor, build any billing flow, or change the roadmap. Payment
implementation is a later, separate slice.

It must stay consistent with existing project guardrails:
- `default-css` is the unconditional fallback (see
  [custom-character-plan.md](custom-character-plan.md), [pre-9f-audit.md](pre-9f-audit.md)).
- Custom character generation is an **explicit user action only**; the behavior
  engine never knows about AI or providers.
- The near-term product is a **2D sprite-style desktop companion**, not a 3D render.

---

## 1. Decision Summary

| Item | Decision (v1) |
|---|---|
| **Base app** | **$9.99 one-time purchase** |
| **Custom character credit** | **$2.99 per credit** |
| **Subscription** | **None in v1** |
| **Bundles (3 / 10 credits)** | Optional, **later** — not committed for v1 |

The base app is a one-time purchase. AI custom character generation is paid
separately as **credits**. There is no recurring subscription in v1.

Positioning note: market the paid generation as an **"AI custom companion
character"** or **"stylized desktop companion,"** not a **"3D render."** Do not use
3D/GLB marketing language unless and until the implementation actually becomes 3D.

---

## 2. What the Base Purchase Includes

The $9.99 one-time purchase unlocks the full core companion experience:

- **Core desktop companion** — transparent always-on-top overlay character.
- **Built-in / default characters** — `default-css` and any bundled local assets.
- **Behavior engine** — idle / walk / blink / sleep / lie / react, scheduler,
  edge handling, mouse reaction.
- **Local tray / settings** — show / hide / quit, position, size, persistence.

AI is **not required** for the base app:

- The base companion does **not** require AI or custom generation.
- Core local behavior should remain usable **without a generation service**.

> Note: this describes the *base companion* not needing AI. It is not a permanent
> offline-licensing promise — future purchase/license-verification mechanics may
> depend on the distribution channel chosen in a later slice (see §7).

---

## 3. What Custom Credits Include

**1 credit = one user-initiated custom character generation flow** — including
input validation, capped retries, and fallback. A credit is **not** a guarantee of
a final accepted character.

A credit covers:

- **One explicit user-triggered generation flow.** No auto-generation; the user
  starts it deliberately (consistent with the 9F explicit-action rule).
- **AI / provider cost** for that flow, covered by the credit price.
- **Capped retries.** The retry / cost cap still applies (≤ 2 retries per pose,
  enforced in code — see [9f-entry-decision.md §3](9f-entry-decision.md)).
- **Fallback on failure.** If generation fails validation or the provider refuses,
  the companion falls back to **`default-css`**. The base app stays usable.

**Refund / retry policy is explicitly TBD** (see §8). A credit pays for the
*attempt + validated flow + fallback*, not for a guaranteed final character.

---

## 4. Why "Credit" Wording Beats "Photo"

We deliberately price a **credit**, not "a photo → a character," because:

- **Upload may fail validation** (unsupported image, IP/consent block, low quality).
- **Output may need a retry** within the capped retry budget.
- **The provider may refuse** the request.
- **It avoids promising an exact copy** of an uploaded photo.

"Credit" frames the purchase as *one generation flow with a fallback*, which is
honest about a probabilistic AI pipeline. This pairs with the marketing wording in
§1: **"AI custom companion character"** / **"stylized desktop companion,"** never
"3D render" and never "exact copy of your photo."

---

## 5. Safety / IP Rules

AI-assisted generation carries IP and consent risk. These rules govern what users
may submit and how output is framed:

**Allowed inputs:**
- **Pets** — the best launch use case.
- **User-owned original characters**, original drawings, and **owned non-person
  images**.
- The user must **own or have permission** to use the image.

**Not allowed:**
- **Third-party copyrighted / game / anime / movie characters copied directly.**
  Do not reproduce a recognizable IP-protected character.
- **Real-person / celebrity likeness — blocked at launch (v1).** Pets and owned
  non-person images only. (The underlying rule is that real-person likeness would
  require explicit, documented rights/consent — that is the future-relaxation path,
  not a v1 feature. See §8.)

**Copy guideline:**
- **"We stylize, not copy."** Output may be **inspired by broad traits** only when
  it avoids direct copying of a protected character.
- **Custom generation remains an explicit user action only.**

---

## 6. Cost / Margin Assumptions

The per-generation cost model already exists in
[9f-entry-decision.md §3](9f-entry-decision.md):

- Base case (7 poses): generation $0.28 + bg-removal $0.07 = **~$0.35**.
- Worst case (2 retries per pose): **~$1.05**.

At a **$2.99** credit price, this leaves headroom over raw provider cost — **but**:

- **Final costs are not locked.** The §3 figures depend on provider pricing,
  pose count, and retry behavior, all of which may change.
- **Payment processor / platform fees must be modeled before payment
  implementation.** Card/processor fees, Mac App Store commission, or storefront
  cuts (see §7) materially change net margin and are **not** yet accounted for here.

This section is an assumption record, not a locked-margin claim.

---

## 7. Distribution / Payment Notes

- **Direct website distribution** and **Mac App Store distribution** may have
  **different payment rules**, fees, and IAP requirements.
- **Payment implementation is a later slice.** This doc does **not** select
  Stripe, App Store, or Apple IAP.
- The license/purchase-verification mechanism (and whether it requires network
  access) depends on the channel chosen later — which is why §2 avoids a permanent
  offline-licensing promise.
- **This doc is product strategy only.**

---

## 8. Open Questions

- Is **$9.99** the final launch price for the base app?
- Is **$2.99** the final credit price?
- Should the **first credit be free or discounted** to drive first-run conversion?
- **Refund / retry policy** — what does a credit entitle on a failed generation?
- **Credit expiration** — do credits expire?
- **Bundles** — 3-credit and 10-credit packs: pricing and timing?
- **When, if ever, should real-person uploads be allowed after v1?**
- **What consent / right-verification mechanism would be required** before allowing
  real-person likeness?
- **Direct website distribution vs Mac App Store** — which channel(s) at launch?

---

## References

- [9f-entry-decision.md](9f-entry-decision.md) — provider decision + cost model (§3)
- [custom-character-plan.md](custom-character-plan.md) — Slice 9 sub-slice breakdown, safety rules
- [provider-evaluation.md](provider-evaluation.md) — Slice 9E provider/API evaluation
- [pre-9f-audit.md](pre-9f-audit.md) — pre-9F repository audit, `default-css` fallback posture
