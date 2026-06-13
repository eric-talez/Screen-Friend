# Pre-9F Repository Audit — Screen Friend / 화면 친구

> **Status:** Audit report + B2/B5 hardening resolved (pre-9f-hardening-env-and-assets PR). B4 consent/IP-warning scope clarified.
> **Audit date:** 2026-06-13.
> **B2/B5 resolved:** 2026-06-13.
> **B4 clarified:** 2026-06-13 — 9F real-provider path requires minimal safety gate; 9G is UX hardening only (see §4).
> **Repo state audited:** `main` @ `5ee3db7` (after PR #17 — 9F entry decision note merged).
> **Hardening applied to:** `main` @ `3375450` (after PR #18 — pre-9f-audit merged).

This audit was requested before starting Slice 9F **mock scaffolding**. It covers
product/roadmap consistency, architecture, Electron/security, 9F readiness,
QA/test gaps, and risk. Findings are separated into **verified** (confirmed by
reading the file or running a command in-environment) and **to verify** (not
confirmable here). Nothing provisional is stated as fact.

---

## 1. Executive Summary

The repository is in a **healthy, internally consistent state**. The companion
MVP (Slices 0–8.5) and the Slice 9 planning track (9A–9E + the 9F entry decision
note) are coherent. Electron security posture is textbook-correct, the behavior
engine is fully provider-agnostic, and the asset-registry seam that Slice 9F is
meant to plug into already exists and is clean. `default-css` is preserved as the
unconditional fallback.

**Green light to begin Slice 9F as a feature-flagged, mock-only scaffold** (no
real provider, no API key, `default-css` fallback intact) — this is explicitly
authorized by [`9f-entry-decision.md`](9f-entry-decision.md) and carries no
blockers today.

A handful of items should be addressed before or alongside 9F mock scaffolding
(B2, B5 — hardening), and a separate set must be cleared **before any real
provider call, personal-photo flow, or production generation merge** (B1, B3, B4):
the `.env` gitignore gap, the paid-tier Recraft requirement, the open verification
questions in the 9F decision note, the consent/IP-warning slice-ownership question
(now clarified — see §4 B4), and the closed `CharacterAssetId` union.
None are red; all are tracked below.

### 한국어 요약

- 저장소 상태는 **건강하고 일관적**입니다. 컴패니언 MVP(Slice 0–8.5)와 Slice 9
  계획 트랙(9A–9E + 9F 진입 결정 노트)이 서로 모순 없이 정리되어 있습니다.
- Electron 보안(contextIsolation/sandbox/nodeIntegration=false, 좁은 preload
  브리지, IPC 2채널)과 behavior engine의 provider 비의존성은 **GREEN**입니다.
- **9F mock 스캐폴딩(feature-flag, 실제 키/호출 없음, default-css 유지) 시작은 즉시
  가능**합니다. 현재 시점 블로커 없음.
- **mock 스캐폴딩 전/병행 hardening 항목(B2, B5):** `.env` gitignore 누락,
  닫힌 `CharacterAssetId` union — mock PR과 함께 해소 권장.
- **실제 provider 호출 / 개인 사진 포함 흐름 / 프로덕션 생성 머지 전(B1, B3):**
  Recraft 유료 티어 강제, 9F 노트의 미검증 항목.
- **B4 해소(2026-06-13):** consent/IP 경고 UI 슬라이스 귀속 명확화 — 9F 실제 provider 경로는
  최소 안전 게이트(IP 경고 + 동의 체크박스 등) 포함 필수; 9G는 UX 심화 레이어.
- 전체 등급: **🟡 YELLOW** (mock 시작은 green, 실제 API는 조건부). RED 없음.

---

## 2. Status by Area (Green / Yellow / Red)

| # | Area | Status | One-line reason |
|---|---|---|---|
| 1 | Product / roadmap consistency | 🟡 Yellow | Vision is clear and consistent; top-level roadmap docs lag behind sub-slice progress. Consent-UI slice ownership (B4) clarified 2026-06-13. |
| 2 | Architecture | 🟢 Green | Provider-agnostic engine, clean registry seam, robust settings store, no backend creep. One note: `CharacterAssetId` is a closed compile-time union. |
| 3 | Electron / security | 🟢 Green | Narrow preload, two scoped IPC channels, no renderer Node access. Pre-9F gap: `.env` is not gitignored. |
| 4 | 9F readiness | 🟢 Green to scaffold / 🟡 before real API | Mock-only path is feasible and authorized; real provider calls gated by open questions. |
| 5 | QA / test gaps | 🟡 Yellow | typecheck + desktop compile pass; **no unit tests** exist, several Mac behaviors are unverified on hardware, and a CLAUDE.md validation command is wrong. |
| 6 | Risk register | 🟡 Yellow | Main residual risks are provider/legal (Recraft free-tier trap, retention, per-pose identity) and unverified real-device overlay behavior. |

**Overall: 🟡 Yellow.** Begin 9F mock scaffolding now; address B2/B5 hardening
items before/alongside the mock PR (both resolved); resolve B1/B3 before any real
API call, personal-photo flow, or production generation merge (B4 clarified
2026-06-13). No red findings.

---

## 3. Findings by Audit Area

### 3.1 Product / roadmap consistency — 🟡 Yellow

**Verified — consistent:**
- The Mac desktop companion vision is stated identically across
  [`CLAUDE.md`](../CLAUDE.md) (Product context), [`README.md`](../README.md), and
  the renderer hero copy in [`apps/web/src/App.tsx`](../apps/web/src/App.tsx:249).
  "This is **not** an AI 3D generation tool" guardrail is explicit and intact.
- Sub-slice breakdown in
  [`custom-character-plan.md`](custom-character-plan.md) §5 is clean: 9A–9E marked
  complete, 9F = scoped feature-flagged AI prototype, 9G = safety/consent/error
  UX hardening, GLB deferred beyond 9G.
- The 9E provider evaluation and 9F entry decision note form a proper gate chain:
  [`provider-evaluation.md`](provider-evaluation.md) §4/§6 → [`9f-entry-decision.md`](9f-entry-decision.md).

**Verified — inconsistencies (non-blocking):**
- **Top-level roadmap doc lag.** Three docs still describe Slice 9 at the
  "plan first / split before starting" altitude and do **not** reflect that
  9A–9E are already complete and 9F is the actual next sub-slice:
  - [`CLAUDE.md`](../CLAUDE.md) roadmap table: "Slice 9 | … | 🎯 Next (⚠️ sub-slice 분리 후 시작)".
  - [`README.md`](../README.md): "Next up is Slice 9 … split it into smaller sub-slices before starting."
  - [`docs/roadmap.html`](roadmap.html): badge "🎯 Slice 9: AI character (plan first)" and "Slice 9 … 다음 단계 (sub-slice 분리 후 시작)".
  These are not wrong (Slice 9 overall is incomplete), but they hide that 9F is
  the next unit of work. A reader starting from the top-level docs would not know
  9A–9E shipped.
- **Consent / IP-warning slice ownership — clarified (B4).** Two docs had placed
  the same requirement in different slices. This has been reconciled (2026-06-13):
  - **9F real-provider prototype must include a minimal safety gate** before any real
    provider call — explicit user action, IP warning, personal/reference photo
    consent checkbox, no auto-generation, visible provider/no-real-copy warning.
    These are non-negotiable minimums; 9F scope does not expand into full UX polish.
  - **9G is the later UX hardening layer**, not the first consent gate. 9G handles:
    better copy, provider error states, retry/cost UI polish, clearer
    privacy/data-retention display, richer recovery/fallback UX.
  See §4 (B4 resolved) and updated [`9f-entry-decision.md`](9f-entry-decision.md) §6,
  [`custom-character-plan.md`](custom-character-plan.md) §3/§5,
  [`provider-evaluation.md`](provider-evaluation.md) §6 criterion 4.

### 3.2 Architecture — 🟢 Green

**Verified:**
- **Behavior engine is fully provider-agnostic.** `grep` over
  `apps/web/src/character/` for `recraft|openai|replicate|meshy|provider` returns
  no real matches (only the substrings inside `false`/`testability`).
  [`behaviorEngine.ts`](../apps/web/src/character/behaviorEngine.ts) is a pure TS
  FSM with no DOM, React, or network dependency — exactly the isolation the plan
  requires.
- **Registry seam is clean and 9F-shaped.**
  [`characterAssets.ts`](../apps/web/src/character/characterAssets.ts) is a
  discriminated union (`renderer: "css" | "sprite"`);
  [`CharacterStage.tsx`](../apps/web/src/components/CharacterStage.tsx:113)
  branches on `asset.renderer`. A 9F-generated sprite asset registers as a new
  `CharacterAssetDefinition` with `renderer: "sprite"` without touching the
  engine — the integration point in
  [`custom-character-plan.md`](custom-character-plan.md) §4 is real.
- **Settings flow is safe.** [`settings.ts`](../apps/desktop/src/settings.ts) is
  versioned, sanitized field-by-field, clamps `scale`, validates window bounds
  against connected displays, writes atomically (temp + rename), debounces, and
  falls back to defaults on a missing/corrupt file. `selectedCharacterId`
  defaults to `"default-css"`.
- **No backend/server/db/auth/billing creep.** Web deps are React + three +
  @react-three/* + vite; desktop deps are electron + typescript only. No
  Express/Fastify/DB/ORM/auth/provider SDK present in any `package.json`.

**Verified — architectural note (non-blocking, 9F-relevant):**
- `CharacterAssetId` is a **closed compile-time union**
  (`"default-css" | "placeholder-sprite"`) backing a
  `Record<CharacterAssetId, CharacterAssetDefinition>`. A 9F-generated asset has a
  runtime-created ID not in this union, so the registry will need to become
  **runtime-extensible** (or the ID type widened) for generated assets.
  Runtime is already safe — `getCharacterAsset(id: string)` falls back to
  `DEFAULT_CSS_ASSET` for unknown IDs — but the registry as written cannot hold a
  dynamically generated entry without a type/shape change. (See §4 blocker B5.)

### 3.3 Electron / security — 🟢 Green (current state)

**Verified:**
- **Narrow preload bridge.** [`preload.ts`](../apps/desktop/src/preload.ts)
  exposes exactly four things: `shell`, `shellVersion`, `onInteractiveChanged`,
  and the Slice 9D `getSelectedCharacterId` / `setSelectedCharacterId`. Channel
  names are module-private; the renderer cannot reach arbitrary channels.
- **No arbitrary IPC.** [`main.ts`](../apps/desktop/src/main.ts:217) registers
  only two `ipcMain.handle` channels (get/set selected character ID); the setter
  validates `typeof id === "string"` before persisting. The interactive-mode
  channel is a one-way `webContents.send`. There is no generic invoke passthrough.
- **No renderer Node access.** Window is created with `contextIsolation: true`,
  `nodeIntegration: false`, `sandbox: true`
  ([`main.ts`](../apps/desktop/src/main.ts:110)). All filesystem I/O lives in the
  main process ([`settings.ts`](../apps/desktop/src/settings.ts)).
- **No secrets today.** No API keys, tokens, `.env` files, or `VITE_*` secrets
  exist anywhere in the tree (verified by grep + `git ls-files`). The MVP needs
  none, consistent with CLAUDE.md.
- **9F key-storage plan is sound.** [`9f-entry-decision.md`](9f-entry-decision.md)
  §5 correctly specifies: key in main process only, loaded from `process.env` /
  gitignored `.env`, never in the renderer bundle, never in a `VITE_*` var, never
  logged, never committed, with a grep check in the 9F PR.

**Verified — pre-9F security gap (blocks real-key 9F, not mock scaffolding):**
- **`.env` is not gitignored.** [`.gitignore`](../.gitignore) contains
  `node_modules/`, `.pnpm-store/`, `dist/`, `.vite/`, `.DS_Store`, `*.local`.
  `*.local` catches `.env.local` but **not** a bare `.env`. Yet
  [`9f-entry-decision.md`](9f-entry-decision.md) §5 states the key will live in
  "a local developer `.env` file that is `.gitignore`d" — which is not currently
  true. There is also **no `.env.example`** on disk, although CLAUDE.md and the
  9F note both reference one. Before any key handling lands, add `.env` (and
  `.env*`) to `.gitignore` and create `.env.example` with the placeholder name
  only. (See §4 blocker B2.)

### 3.4 9F readiness — 🟢 Green to scaffold / 🟡 before real API

**Verified — ready to scaffold (mock-only):**
- The 9F entry decision note explicitly authorizes starting code scaffolding "if
  it remains feature-flagged, uses no real API key, and preserves `default-css`
  fallback." That path is feasible against the current architecture today.
- `default-css` fallback is preserved end-to-end:
  `getCharacterAsset()` returns `DEFAULT_CSS_ASSET` for unknown IDs;
  `DEFAULT_SETTINGS.selectedCharacterId = "default-css"`; the renderer revalidates
  the persisted ID against the registry in
  [`App.tsx`](../apps/web/src/App.tsx:81).
- No real provider call exists anywhere (grep clean). No network calls exist in
  `apps/web/src` or `apps/desktop/src` at all.
- The entry decision note is **substantive and gate-complete**: pinned provider
  (Recraft `recraftv4_1`) + fallback (OpenAI `gpt-image-2` + bg-removal), cost
  model ($0.35 base / ~$1.05 worst-case for 7 poses), retention and
  commercial-rights terms with official source links, main-process key plan, a
  10-item 9F PR checklist, and 6 explicit open questions.

**Verified — gated before any real provider call / personal-photo flow / production generation merge:**
- The note's own §7 open questions remain unresolved (bg-removal output format,
  V4.1 style fit requiring a paid account, OpenAI commercial-rights/retention
  pages returning HTTP 403, per-pose identity consistency, latency). These are
  correctly scoped as merge/production blockers, not scaffolding blockers.

### 3.5 QA / test gaps — 🟡 Yellow

**Verified — automated coverage that exists and passes (run in this audit):**
- `pnpm run typecheck` → **PASS** (exit 0; web + desktop `tsc --noEmit`).
- `pnpm --filter @ai-3d-demo/desktop run compile` → **PASS** (exit 0; `tsc`).

**Verified — gaps:**
- **No unit tests at all.** There is no test runner in any `package.json` and no
  test files in the tree. The highest-value target is wide open:
  [`behaviorEngine.ts`](../apps/web/src/character/behaviorEngine.ts) is a pure
  FSM with an **injectable RNG** (`options.random`) added "for testability" — yet
  it has zero tests. Sleep/wake transitions, edge bounce, weighted scheduling, and
  react cooldown are all deterministically testable and currently unverified
  except by eye.
- **CLAUDE.md validation command is wrong.** CLAUDE.md ("Validation expectations →
  Electron main process") tells agents to run
  `pnpm --filter @ai-3d-demo/desktop run build`. **That script does not exist** —
  verified: `None of the selected packages has a "build" script`. The desktop
  package exposes `typecheck`, `compile`, `start`, `dev`, `dev:interactive`. The
  correct command (used in [`qa-checklist.md`](qa-checklist.md)) is `run compile`.
- **Root `build` only builds web.** Root `package.json` `build` =
  `pnpm --filter @ai-3d-demo/web build`; it does not compile the desktop main
  process. Desktop TS is covered by `typecheck` and `compile` instead, so this is
  not a hole — but README's "`pnpm build` … Build" line overstates scope.

**Verified — manual Mac QA still outstanding (documented, not yet done):**
[`qa-checklist.md`](qa-checklist.md) and CLAUDE.md both flag these as needing one
real-device pass; none can be verified in this environment:
- Slice 5: forwarded `mousemove` driving mouse-react in **normal click-through** mode.
- Slice 6: tray Show/Hide/Interactive-toggle/Quit clicks + badge follow + click-through regression.
- Overlay behavior under **Mission Control / fullscreen apps / multi-monitor**.
- Persistence restart (interactive mode + window bounds) on a real Mac.
These are not 9F blockers, but they are **Slice 10 (packaging/beta) blockers** and
have been outstanding across several slices — they should be cleared before beta.

### 3.6 Consolidated Risk Register — 🟡 Yellow

| Risk | Category | Impact | Status / mitigation |
|---|---|---|---|
| **Recraft free-tier trap** — free tier is **non-commercial**, outputs are **public in the community gallery** and **owned by Recraft** ([`9f-entry-decision.md`](9f-entry-decision.md) §2.2) | Provider / legal / privacy | High | 9F must use a **paid** Recraft tier for any real generation; never run real calls on a free key. Enforce in the key/setup docs before B2/B3 close. |
| **API key leakage** — key shipped in renderer/bundle/logs | Security | High | Plan is correct (main-process only). **Add `.env` to `.gitignore` + `.env.example` first** (B2); 9F PR must grep the bundle for the key name. |
| **IP / copyright copying** — user requests a protected character | Legal | High | Plan §3 style-transform-only normalization + plain-language IP warning before submit. Minimal gate required in 9F; 9G handles polish. (B4 clarified.) |
| **Real-person likeness without consent** | Legal / ethical | High | Explicit consent checkbox gate before any personal-photo submit — required in 9F real-provider path. (B4 clarified.) |
| **Provider data retention** — sensitive input stored/trained on | Privacy | High | Recraft API inputs documented as never used for training (note §2.2, official). OpenAI retention/commercial pages returned **403** and remain **(to verify)** before any OpenAI-path real use. |
| **Per-pose identity drift** — 7 separate generations don't read as the same character | Quality / UX | Medium | Note §7 Q5 — unverified empirically; set user expectations ("stylize, not clone"), allow per-pose regenerate, cap retries. |
| **Cost runaway** — retries/loops burn spend | Cost | Medium | Note §3 — hard retry cap ≤ 2/pose and per-character cost cap **enforced in the IPC handler before any call** (not policy-only). |
| **Closed `CharacterAssetId` union** — cannot hold a generated asset | Architecture | Medium | Widen the ID type / make the registry runtime-extensible in 9F (B5). Runtime fallback already safe. |
| **Unverified real-device overlay behavior** — transparent always-on-top across spaces/fullscreen/multi-monitor | UX / product | Medium | Long-standing manual QA debt; clear before Slice 10 beta (§3.5). |
| **Roadmap doc lag** — top-level docs hide that 9A–9E shipped | Product | Low | Refresh CLAUDE.md / README / roadmap.html roadmap framing (R2). |

---

## 4. Blockers

### Before 9F **mock scaffolding** (the immediate next step)
**None.** Starting a feature-flagged, mock-only 9F scaffold that uses no real API
key and preserves `default-css` is authorized by
[`9f-entry-decision.md`](9f-entry-decision.md) and carries no blockers in the
current repo state.

### Before / alongside 9F **mock scaffolding** — hardening items

These items do not block the feature-flagged, mock-only scaffold from starting or
merging, but should be addressed in a small hardening PR before or alongside it.

| ID | Item | Why |
|---|---|---|
| ~~**B2**~~ ✅ | ~~Add `.env` (and `.env*`) to [`.gitignore`](../.gitignore) and create `.env.example` with the placeholder var name only (`RECRAFT_API_KEY=your_key_here`).~~ **Resolved 2026-06-13:** `.env` / `.env.*` added to `.gitignore` (with `!.env.example` allowlist); `.env.example` created. | The 9F key plan assumes a gitignored `.env`; today a bare `.env` would be committable. Land before any key handling is introduced — even in a mock slice. |
| ~~**B5**~~ ✅ | ~~Make the asset registry runtime-extensible (widen `CharacterAssetId` / registry shape) for dynamically generated assets.~~ **Resolved 2026-06-13:** `CharacterAssetId` widened to `BuiltInAssetId \| (string & {})`, registry migrated from `Record` to `Map`, `registerCharacterAsset()` safe-registration API added. | The current closed union/`Record` cannot hold a generated asset entry without a type change. Safe to land in the mock slice itself. |

### Before any **real provider call / personal-photo flow / production generation merge**

The items below do not block mock-only scaffolding. They gate real Recraft API
calls, personal-photo submission, and any 9F branch intended for production use.

| ID | Blocker | Why it blocks |
|---|---|---|
| **B1** | Resolve [`9f-entry-decision.md`](9f-entry-decision.md) §7 open questions — esp. Q1 (Recraft bg-removal output = transparent PNG?), Q2 (V4.1 style fit, needs a paid account), Q3/Q4 (OpenAI commercial-rights & retention pages returned HTTP 403). | The decision note itself marks these `(to verify)` and forbids real calls / production merge until resolved. |
| **B3** | Require a **paid** Recraft tier for real generation; document that free-tier output is non-commercial, public, and Recraft-owned. | Using a free key would publish user-derived characters and forfeit ownership — a privacy/legal trap. |
| ~~**B4**~~ ✅ | ~~Reconcile whether the IP warning + personal-photo consent gate are **9F-merge requirements** (per 9F note §6) or **9G deliverables** (per plan §3/§5, provider-evaluation §6).~~ **Clarified 2026-06-13:** 9F real-provider prototype must include the minimum safety gate — explicit user action, IP warning, personal/reference photo consent checkbox, no auto-generation, visible provider/no-real-copy warning — before any real API call. This is not a full UX polish; 9G is the later hardening layer (better copy, provider error states, retry/cost UI polish, clearer privacy/data-retention display, richer recovery/fallback UX). See updated [`9f-entry-decision.md`](9f-entry-decision.md) §6, [`custom-character-plan.md`](custom-character-plan.md) §3/§5, [`provider-evaluation.md`](provider-evaluation.md) §6 criterion 4. | Prevents 9F scope from silently expanding into full consent UI, or from shipping a real-call path without consent. Prevents 9G from being confused with the first safety gate. |

---

## 5. Non-Blocking Recommendations

| ID | Recommendation | Rationale |
|---|---|---|
| **R1** | Fix CLAUDE.md "Validation expectations → Electron main process": `run build` → `run compile`. | The referenced script does not exist (verified); agents following it will hit an error. |
| **R2** | Refresh the top-level roadmap framing in CLAUDE.md, README, and `roadmap.html` to show 9A–9E complete and 9F as the next sub-slice. | Removes doc lag; a top-level reader currently can't tell 9A–9E shipped. |
| **R3** | Add unit tests for [`behaviorEngine.ts`](../apps/web/src/character/behaviorEngine.ts) using the injectable RNG. | It is pure, deterministic, and the most logic-dense module, yet untested. Best ROI for a first test slice. |
| **R4** | Clear the outstanding real-device Mac QA caveats (Slice 5 forwarded mousemove, Slice 6 tray, Mission Control/fullscreen/multi-monitor, persistence restart) before Slice 10. | Documented but never verified on hardware across several slices; they are beta blockers. |
| **R5** | Optionally note in README that `pnpm build` builds the web renderer only; the desktop main process is validated via `typecheck` / `compile`. | Avoids overstating `build` scope. |

> R1–R5 touch source/docs and are therefore **out of scope for this audit-only
> task**. They are recorded here for a follow-up slice, not applied.

---

## 6. Files Inspected

**Docs**
- [`CLAUDE.md`](../CLAUDE.md)
- [`README.md`](../README.md)
- [`docs/custom-character-plan.md`](custom-character-plan.md)
- [`docs/provider-evaluation.md`](provider-evaluation.md)
- [`docs/9f-entry-decision.md`](9f-entry-decision.md)
- [`docs/qa-checklist.md`](qa-checklist.md)
- [`docs/roadmap.html`](roadmap.html) (status/Slice-9 sections only)

**Workspace / config**
- root [`package.json`](../package.json), [`pnpm-workspace.yaml`](../pnpm-workspace.yaml), [`.gitignore`](../.gitignore)
- [`apps/desktop/package.json`](../apps/desktop/package.json), [`apps/web/package.json`](../apps/web/package.json)

**Desktop (Electron)**
- [`apps/desktop/src/main.ts`](../apps/desktop/src/main.ts)
- [`apps/desktop/src/preload.ts`](../apps/desktop/src/preload.ts)
- [`apps/desktop/src/settings.ts`](../apps/desktop/src/settings.ts)

**Web (renderer)**
- [`apps/web/src/App.tsx`](../apps/web/src/App.tsx)
- [`apps/web/src/components/CharacterStage.tsx`](../apps/web/src/components/CharacterStage.tsx)
- [`apps/web/src/character/behaviorEngine.ts`](../apps/web/src/character/behaviorEngine.ts)
- [`apps/web/src/character/characterAssets.ts`](../apps/web/src/character/characterAssets.ts)
- asset tree under `apps/web/src/assets/characters/placeholder-sprite/` (listing only)

**Repo-wide scans:** provider/secret keyword grep across `apps/**`, behavior-engine
isolation grep, network-call grep, `git ls-files` for `.env`, IPC-handler grep.

---

## 7. Suggested Next Slice

**Proceed with Slice 9F as a mock-only, feature-flagged scaffold** — one provider
abstraction with a **mock implementation only** (no real key, no network call),
registering a generated-style asset through the existing `characterAssets.ts`
seam, gated behind a runtime/compile feature flag that is **off by default**, with
`default-css` preserved as fallback.

Recommended ordering:
1. **(Tiny pre-req chore)** Land B2 + B5 first as a small hardening PR — add
   `.env*` to `.gitignore`, create `.env.example`, and widen the asset registry to
   be runtime-extensible. This lets the real-call 9F later land clean.
2. **(Slice 9F mock)** Build the feature-flagged mock generation path and UI entry
   point that registers a sprite asset locally — no provider SDK, no key.
3. Defer real Recraft calls until **B1, B3** are resolved (B4 clarified 2026-06-13) and the 9F PR
   checklist in [`9f-entry-decision.md`](9f-entry-decision.md) §6 is satisfied.

Keep one task = one slice (CLAUDE.md). Do not combine the hardening chore, the
mock scaffold, and any real-API work into a single PR.

---

## 8. Recommended Validation Commands

For the **next 9F mock scaffold** PR (renderer + possibly main-process flag):

```sh
pnpm install
pnpm run typecheck                                   # web + desktop tsc --noEmit
pnpm --filter @ai-3d-demo/desktop run compile        # desktop main process (NOT "run build" — that script does not exist)
pnpm run build                                        # web renderer build
```

9F-specific guard greps (must stay clean):

```sh
# Behavior engine must never reference a provider (plan §6 acceptance):
grep -rniE "recraft|openai|replicate|fal|meshy|provider" apps/web/src/character/

# No real key may appear in renderer source or the built bundle:
grep -rniE "RECRAFT_API_KEY|sk-[a-z0-9]" apps/web
```

Plus the manual Mac QA in [`qa-checklist.md`](qa-checklist.md) (real-device) before
Slice 10.

---

## 9. Audit Validation (this report)

This report is the only change. Verified before finishing:

```sh
git diff --check      # no whitespace/conflict errors expected
git diff --stat       # only docs/pre-9f-audit.md
git status -sb        # only the new untracked file
```

No source, Electron, dependency, settings, asset, provider, or other doc files
were modified by the audit. This report was later committed in PR #18.
