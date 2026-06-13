# Slice 9F — B1 Provider Verification Plan

> **Status:** Verification **plan** only — docs-only.
> No API key, no provider SDK, no provider call, no app integration, no dependency.
> **This document is NOT proof that B1 is resolved.** B1 remains **open** after this PR.
> Plan date: **2026-06-13**.

---

## 1. Purpose

B1 is the **only remaining blocker** before any real provider call, personal-photo
flow, or production generation path (see [`pre-9f-audit.md`](pre-9f-audit.md) §4).
B1 = resolve the open questions in
[`9f-entry-decision.md` §7](9f-entry-decision.md#7-open-questions--blockers).

This document defines **how** each B1 question will be verified, what evidence is
required, and what would let B1 be marked resolved. It does **not** itself verify
anything, make any API call, or constitute evidence. B1 stays **open** until a
separate evidence PR (see §6) records the results.

> **First official-doc evidence pass recorded (2026-06-13):** see
> [§3a Evidence log](#3a-evidence-log--official-doc-pass-2026-06-13). That pass used
> **official provider docs only** (no API call, no key). It moved **Q4** to Verified
> (OpenAI no-training-by-default + a concrete 30-day abuse-monitoring retention window +
> ZDR/Modified-Abuse-Monitoring opt-out, from official OpenAI developer docs), left
> **Q1** only **partially verified — paid-tier artifact still required**, and left
> **Q3 Blocked** (official commercial-rights/Terms pages still return HTTP 403).
> **B1 remains open** — Q1 needs an artifact, Q3 is Blocked, and Q2/Q5/Q6 still need a
> paid-tier test.

Scope guardrails for this plan and the follow-up evidence work:

- No key committed; no key in renderer/Vite; no provider call from app code.
- No provider SDK or dependency added.
- Official provider documentation is the source of truth (see §3, §4).

### Blocker grouping — what each question gates

The six questions do **not** all gate the same thing. Keep these separate:

| Group | Questions | Gates |
|---|---|---|
| **A — Recraft primary path** | Q1, Q2 | Required before any **real Recraft 9F merge** (primary provider). |
| **B — OpenAI fallback path** | Q3, Q4 | Required only before the **OpenAI fallback** is used, or any **personal-photo OpenAI path**. Not required for a Recraft-only 9F merge. |
| **C — UX / design validation** | Q5, Q6 | Record evidence to set realistic expectations. These are **UX/design** findings — **do not** overstate them as provider policy or legal proof. |

---

## 2. B1 Checklist

All rows start at **To verify**. This PR does not change any status.

| ID | Question | Verification method | Required evidence | Status |
|---|---|---|---|---|
| **Q1** | Recraft remove-background output is a transparent **PNG** (not WebP/other) with a clean alpha channel suitable for the overlay | Read official Recraft bg-removal docs for the documented output format; then a paid-tier manual test that runs a simple non-personal image through the bg-removal endpoint and inspects the result | Documented output format from official Recraft docs **+** sample output file format (PNG) **+** alpha-channel evidence (e.g. `file` / image-tool report showing RGBA + transparent pixels), secrets redacted | **Partially verified (docs)** — paid-tier artifact still required (2026-06-13, see §3a) |
| **Q2** | Recraft `recraftv4_1` style fit for a flat, clean companion mascot (paid tier) | Paid-tier manual test generation from a simple text prompt and/or non-personal reference; subjective style-fit judgment against the companion art target | Sample generated image(s) + short written assessment of style fit; note plan tier used | To verify |
| **Q3** | OpenAI API output **commercial rights** | Re-attempt the **official** OpenAI usage-policy page (returned HTTP 403 on 2026-06-13). Official source only — see §3 | Quote + official source URL + access date confirming commercial use of API outputs; **if the official page stays inaccessible, leave as To verify or mark Blocked** | **Blocked** — official commercial-rights/Terms pages HTTP 403; accessible OpenAI dev docs do not state output ownership (2026-06-13, see §3a) |
| **Q4** | OpenAI API **data retention / training opt-out** | Re-attempt the **official** OpenAI API data-usage page (returned HTTP 403 on 2026-06-13). Official source only — see §3 | Quote + official source URL + access date for retention window and training-opt-out; **if the official page stays inaccessible, leave as To verify or mark Blocked** | **Verified** — official OpenAI developer docs (no-training-by-default + 30-day abuse-monitoring retention + ZDR opt-out); canonical openai.com policies page still HTTP 403 (2026-06-13, see §3a) |
| **Q5** | Per-pose identity / consistency expectations across the 7-pose set | Paid-tier manual test: generate multiple poses and judge whether they read as the same character | Sample multi-pose output + written note on observed consistency. **UX/design finding only — not a policy/legal claim** | To verify |
| **Q6** | Recraft latency for generation + bg-removal in a foreground user-initiated flow | Paid-tier manual test: time generation and bg-removal calls | Sample wall-clock latency numbers (per-step + total). **UX/design finding only — not a policy/legal claim** | To verify |

Status legend: **To verify** (not yet checked) · **Partially verified** (official-doc evidence recorded but a required artifact/element is still missing — not fully resolved) · **Verified** (evidence recorded, official source where applicable) · **Blocked** (cannot be verified — e.g. official page inaccessible, or no paid key available).

> **None of these status changes resolve B1.** Even with Q4 Verified, B1 stays **open**
> until Q1 has its paid-tier artifact, Q3 is unblocked, and Q2/Q5/Q6 are tested on a
> paid Recraft tier. See §3a and §6.

---

## 3. Manual Verification Steps — Official-doc items (Q1, Q3, Q4)

These are doc-only and require no key.

- **Q1 (Recraft output format):** read the official Recraft background-removal
  reference and record the documented output format and any alpha guarantees.
  Pair this with the paid-tier artifact in §4 to confirm in practice.
- **Q3 / Q4 (OpenAI policy):** re-attempt the **official** OpenAI policy pages that
  returned HTTP 403 on 2026-06-13 (usage policies; API data-usage / retention).
  - **Official pages are the only acceptable source of truth.**
  - **Do not** use unofficial mirrors, web caches, archived copies, or third-party
    summaries to resolve Q3/Q4.
  - If the official pages remain inaccessible (403 or otherwise), mark Q3/Q4
    **Blocked** or leave **To verify** — never **Verified** from a non-official copy.

Recording: capture the exact quote, the official URL, and the access date for any
item moved toward **Verified**.

---

## 3a. Evidence log — official-doc pass (2026-06-13)

> **First B1 evidence pass — official provider documentation only.** No API call, no
> API key, no SDK, no app code. Access method: `curl -L -I` / `curl -L` from this
> environment, plus a browser-style `User-Agent` retry for the OpenAI `openai.com`
> pages. **Official sources only** — no mirrors, caches, archives, blogs, or
> third-party summaries were used for any status change. All results are
> **point-in-time (2026-06-13)** and must be re-checked at integration.

### Q1 — Recraft remove-background output format / alpha

| Field | Value |
|---|---|
| Date | 2026-06-13 |
| Source (official) | `https://www.recraft.ai/docs/api-reference/getting-started.md` · `https://www.recraft.ai/docs/api-reference/endpoints.md` |
| Access result | HTTP **200** (both; `text/markdown`) |
| Summary | getting-started: *"Remove background — produce a transparent-background cutout of the subject."* endpoints (`POST /v1/images/removeBackground`): *"Removes background of a given raster image."* Documented parameter for this endpoint is **only** `response_format` (`url` \| `b64_json`). The endpoint section documents **no output `image_format`** and **no explicit PNG / alpha-channel guarantee** for the remove-background result (other Recraft endpoints, e.g. variateImage, do document an `image_format: png\|webp`; remove-background does not). |
| Status impact | **Q1 → Partially verified (docs).** The transparency *claim* is in the official docs, but the actual output **file format (PNG vs WebP)** and a **clean alpha channel** are **not** documented for this endpoint. **Not fully resolved** — a paid-tier artifact (RGBA + real transparent pixels, see §4) is still required. |

### Q3 — OpenAI API output commercial rights / ownership

| Field | Value |
|---|---|
| Date | 2026-06-13 |
| Source attempted (official) | `https://openai.com/policies/usage-policies` · `https://openai.com/policies/terms-of-use` · `https://openai.com/policies/business-terms` · `https://openai.com/policies/services-agreement` · `https://openai.com/enterprise-privacy/` · `https://openai.com/policies/data-processing-addendum/` |
| Access result | HTTP **403** on **all** of the above — both bare `curl` and a browser-style `User-Agent` retry (bot protection). Note: this is a local-fetch limitation; the pages may be reachable in a real browser — **not recorded as globally inaccessible.** |
| Cross-check (official, accessible) | `https://developers.openai.com/api/docs/guides/your-data` (HTTP 200) — this is a **data-usage** guide and does **not** state output **ownership** or **commercial-use** rights. |
| Summary | The canonical OpenAI sources for output ownership / commercial rights (Usage Policies, Terms of Use, Business/Services Agreement, Enterprise privacy, DPA) were **not retrievable** from this environment (403). The one accessible official OpenAI page does not address output ownership. |
| Status impact | **Q3 → Blocked.** No accessible official source supports the commercial-rights/output-ownership claim, so Q3 cannot reach even *partially verified*. Per the verification rules, **not Verified.** Re-attempt the Terms/Business/Services pages in a real browser and quote the exact ownership clause before any OpenAI-fallback real use. |

### Q4 — OpenAI API data retention / training opt-out

| Field | Value |
|---|---|
| Date | 2026-06-13 |
| Source attempted (canonical) | `https://openai.com/policies/api-data-usage-policies` → HTTP **403** (bare `curl` and browser-style `User-Agent`). **Local-fetch limitation, not global inaccessibility.** |
| Source verified (official, accessible) | `https://developers.openai.com/api/docs/guides/your-data` (HTTP **200**; mirrored at `https://platform.openai.com/docs/guides/your-data`, HTTP 200) |
| Summary (exact quotes) | (1) *"As of March 1, 2023, data sent to the OpenAI API is not used to train or improve OpenAI models (unless you explicitly opt in to share data with us)."* → **no-training-by-default.** (2) *"By default, abuse monitoring logs are generated for all API feature usage and retained for up to 30 days, unless longer retention is required by law, or is reasonably necessary to protect our services or any third party from harm."* → **concrete default retention window.** (3) Eligible customers can enable **Zero Data Retention** or **Modified Abuse Monitoring** to exclude customer content from abuse-monitoring logs → **opt-out path.** |
| Status impact | **Q4 → Verified** (official OpenAI developer docs). Both required elements are clear: training/default-use (not used to train by default) **and** a concrete retention rule (abuse-monitoring logs ≤ 30 days by default) **plus** an opt-out path (ZDR / Modified Abuse Monitoring). Note: retention specifics vary by endpoint (e.g. some objects retained 30 days after deletion; videos 48h+30d), and the canonical `openai.com/policies` page was 403 — verification rests on the official developer-docs source. |

### Net effect on B1

- **Q1:** Partially verified (docs) — **artifact still required.** Not resolved.
- **Q2, Q5, Q6:** unchanged — still **To verify** (paid Recraft test, §4).
- **Q3:** **Blocked** — official commercial-rights source inaccessible (403).
- **Q4:** **Verified** — official OpenAI developer docs.

**B1 remains OPEN after this pass.** Resolving Q4 alone does not unblock anything: the
Recraft primary path (Group A) still needs Q1's paid-tier artifact and Q2; the OpenAI
fallback path (Group B) still needs Q3. No real provider call, personal-photo flow, or
production generation merge may proceed.

---

## 4. Manual Verification Steps — Paid-tier items (Q2, Q5, Q6; Q1 artifact)

**Prerequisite:** a **paid** Recraft account and a **paid-tier** API key, confirmed
in the Recraft dashboard. Free-tier keys must not be used — see
[`9f-entry-decision.md` §5a](9f-entry-decision.md#5a-paid-tier-requirement).

### Test image requirements

- Use a **non-personal, non-copyrighted, simple** reference image (or a plain text
  prompt).
- **No personal photos.**
- **No protected / copyrighted characters.**

### Expected artifacts

- **Output image format** (confirm PNG for the bg-removal step — Q1).
- **Alpha-channel evidence** — image-tool/`file` report showing RGBA and actual
  transparent pixels (Q1).
- **Sample latency numbers** — per-step (generation, bg-removal) and total (Q6).
- **Style/consistency notes** — short written assessment + sample images (Q2, Q5).
- **Screenshot or log summary with secrets redacted** — never include the API key,
  full request headers, or account identifiers.

> Any manual test script written for §4 must be **temporary or `.gitignore`d** and
> must not be committed unless separately approved. It must not live in app code
> and must not be importable by the renderer.

---

## 5. Safety Rules

These apply to all B1 verification work (this plan and the follow-up evidence PR):

- **No key committed** — the API key is never added to any tracked file.
- **No key in renderer / Vite** — never in a `VITE_*` variable or the client bundle.
- **No provider call from app code** — verification happens outside the app; no
  provider SDK, dependency, or IPC handler is added for B1.
- **Manual test scripts are temporary/gitignored** unless separately approved.
- **No personal photos** are uploaded during B1 verification.
- **No free-tier Recraft key** — paid tier only (see
  [`9f-entry-decision.md` §5a](9f-entry-decision.md#5a-paid-tier-requirement)).
- **Official sources only** for policy items (Q3/Q4) — no mirrors/caches.

---

## 6. Decision Criteria

### What would allow B1 to be marked resolved

- **Q1:** official Recraft docs state a transparent-PNG (or equivalent clean-alpha)
  output **and** a paid-tier sample confirms RGBA with real transparent pixels.
- **Q2:** a paid-tier sample demonstrates acceptable style fit for the companion.
- **Q3 / Q4:** the **official** OpenAI pages are reachable and confirm acceptable
  commercial-rights and data-retention/opt-out terms. If they stay inaccessible,
  these **cannot** be marked Verified.
- **Q5 / Q6:** sample evidence exists and realistic expectations are written down
  (UX/design findings — not treated as policy proof).

> **Scope of "resolved":** Q1+Q2 (Group A) being Verified is sufficient to unblock a
> **Recraft-only** real-provider 9F merge, provided the
> [`9f-entry-decision.md` §6](9f-entry-decision.md#6-9f-pr-requirements) checklist is
> also satisfied. Q3+Q4 (Group B) gate **only** the OpenAI fallback / any
> personal-photo OpenAI path — they are **not** required for a Recraft-only merge.

### What would block real-provider 9F

- Q1 cannot confirm a clean transparent output, **or** Q2 shows unacceptable style
  fit, **or** no paid-tier key is available to test them → **Recraft 9F blocked**.
- Q3/Q4 unresolved → **OpenAI fallback and any personal-photo OpenAI path blocked**
  (Recraft-only path may still proceed).

### How to record evidence later

In the follow-up evidence PR (not this one):

- Flip the relevant `(to verify)` cells in
  [`9f-entry-decision.md` §2](9f-entry-decision.md#2-source-verification) and the §7
  blocker table, each with the official source link + access date.
- Update the §7 open-questions table and this plan's §2 checklist statuses.
- Record paid-tier artifacts (format, alpha evidence, latency, style notes) with
  secrets redacted.

---

## 7. Next PR After This Plan

1. **B1 evidence PR** — after the manual verification in §3–§4 is performed, record
   results and source links; update statuses. Only this step can move B1 toward
   resolved.
2. **9F real-provider implementation** — only after B1 is resolved **and** the
   [`9f-entry-decision.md` §6](9f-entry-decision.md#6-9f-pr-requirements) PR checklist
   is satisfied (including the paid-tier confirmation and the minimal safety gate).

One task = one slice ([`CLAUDE.md`](../CLAUDE.md)). Do not combine the B1 evidence
work, the real-provider 9F implementation, and any UX hardening into a single PR.
