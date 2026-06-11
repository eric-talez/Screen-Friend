# CLAUDE.md — Screen Friend / 화면 친구

Coding-agent rules for this repository. Read this file before making changes. Follow these rules together with the current task prompt. If the task prompt and this file conflict, stop and ask for clarification unless the prompt explicitly overrides a rule.

This file is written for an **active pnpm workspace** that already contains `apps/web` (prototype) and `apps/desktop` (Electron shell). Inspect the actual file tree before assuming structure.

---

## Product context

**Screen Friend / 화면 친구**는 사용자의 실제 Mac 화면 위에 사는 desktop companion 앱이다.

핵심 경험:
- 귀여운 캐릭터가 화면 아래에 항상 떠 있다.
- 일반 앱 창보다 항상 앞에 보이지만, 작업을 방해하지 않는다.
- 걷고, 멈추고, 눕고, 졸고, 눈을 깜빡이는 행동이 자연스럽게 반복된다.
- 마우스가 가까이 오면 반응하거나 바라본다.
- 메뉴바/tray에서 show/hide/quit 등을 조작한다.

**이 제품은 AI 3D 생성 도구가 아니다.** 캐릭터 커스터마이징(AI image-to-3D)은 훨씬 나중 단계(Slice 9)다.

---

## Current roadmap slices

| Slice | 목표 | 상태 |
|---|---|---|
| Pivot 0 | README·docs 방향 재정의 | ✅ 완료 |
| Slice 1 | Web sandbox: idle/walk/blink/sleep/lie 행동 loop | ✅ 완료 |
| Slice 2 | Electron desktop shell (main + preload + renderer) | ✅ 완료 |
| Slice 3 | Transparent always-on-top overlay | ✅ 완료 |
| Slice 4 | Click-through + 캐릭터 interaction mode | ✅ 완료 |
| Slice 5 | Behavior Scheduler v1 (weighted random, edge bounce, mouse react) | ✅ 완료 (normal click-through 모드의 mousemove forwarding은 실기기 수동 QA 1회 필요) |
| Slice 6 | Menu bar / Tray settings | ✅ 완료 (tray 메뉴 클릭 동작은 실기기 수동 QA 1회 필요) |
| Slice 7 | Persistence (size, position, personality) | 🎯 Next |
| Slice 8 | Character asset pipeline (sprite sheet or GLB) | — |
| Slice 9 | Optional AI custom character | — |
| Slice 10 | Packaging, QA, beta | — |

One task = one slice. Do not combine slices.

---

## Required stack

Use this stack unless the user explicitly changes it:

- pnpm workspace
- Node 22+
- TypeScript 5.x
- React + Vite (renderer)
- Electron (desktop shell)
- No backend server, no database, no REST API for MVP

Do not add PostgreSQL, Drizzle, OpenAPI, Express, or auth unless the user explicitly asks.

---

## Repository structure

Current layout (inspect before assuming):

```text
화면 친구/
  CLAUDE.md
  README.md
  package.json
  pnpm-workspace.yaml
  apps/
    web/                # Screen Friend 웹 sandbox (행동 loop 프로토타입) + 기존 AI 3D Demo 섹션 포함 — 보존, core MVP에서 제외
    desktop/            # Electron desktop companion — 새 MVP 중심
  packages/             # 아직 없을 수 있음. 필요 시 추가
    character-engine/   # 행동 상태 머신, 이동, 스케줄러
    character-assets/   # sprite, GLB, texture, sound
    shared/             # 타입/상수/설정 schema
  docs/
```

`packages/`는 처음부터 모두 만들 필요 없다. `apps/desktop` 내부에 먼저 구현하고, 재사용이 필요해지면 패키지로 분리한다.

---

## Electron-specific rules

현재 실제 파일 구조 (변경 전 반드시 `ls apps/desktop/src/`로 확인):

- `apps/desktop/src/main.ts` — Electron main process (현재 구현)
- `apps/desktop/src/preload.ts` — contextBridge preload (현재 구현)
- `apps/desktop/src/renderer/` — React + Vite renderer (character UI, 추후 추가 예정)

**중요:** 명시적 요청 없이 이 파일들을 `src/main/`, `src/preload/`, `src/renderer/` 하위 폴더로 재구성하지 않는다. 폴더 구조 변경은 별도 슬라이스로 분리해 사용자 승인 후 진행한다.

Main process window options for overlay:
- `transparent: true`
- `frame: false`
- `alwaysOnTop: true`
- `hasShadow: false`
- `skipTaskbar: true` (옵션, dock 노출 최소화)
- `setIgnoreMouseEvents(true, { forward: true })` for click-through (캐릭터 hit area 제외)

macOS 주의:
- transparent/always-on-top 동작은 Mission Control, 전체화면 앱, 멀티 모니터에서 실제 기기 테스트 필요.
- `alwaysOnTop` level은 `'screen-saver'` 같은 higher level 검토 필요 시 명시적으로 지정.

IPC 규칙:
- main ↔ renderer 통신은 `contextBridge` + `ipcRenderer`/`ipcMain` 사용.
- renderer에서 Node.js API를 직접 호출하지 않는다.
- preload에서 노출하는 API는 최소한으로 유지한다.

---

## Character engine rules

핵심 파일 (위치는 구현 진행에 따라 다를 수 있음):

```text
apps/desktop/src/renderer/character/
  state-machine.ts    # finite state machine: idle/walk/blink/sleep/lie/react
  scheduler.ts        # weighted random action scheduler
  position.ts         # 화면 경계, 이동 계산
  mouse-tracker.ts    # mouse proximity detection
```

상태 머신 규칙:
- 상태: `idle`, `walk`, `blink`, `sleep`, `lie`, `react`
- 전환은 weighted random + timer 기반
- `idle timeout → sleepy → sleep` 경로 지원
- `mouse near → react` 전환 지원
- 화면 경계 충돌 처리 (edge bounce 또는 방향 전환)

성능:
- 목표 30fps. idle 상태에서는 업데이트 빈도 낮춤.
- `requestAnimationFrame` 기반 loop. 숨겨진 창에서는 throttle.
- Three.js / GLB는 Slice 8 이후. MVP는 2D sprite 또는 CSS/Canvas character.

---

## Model and reasoning guidance

| 작업 종류 | 추천 모델 |
|---|---|
| docs, copy, small formatting | lighter/cheaper |
| normal feature slice (renderer, behavior engine) | strong standard |
| Electron IPC, packaging, macOS window behavior | strong standard |
| app signing, notarization, destructive ops | strongest reasoning |

---

## Agent communication style

Keep progress and final responses token-efficient.

실행 중 아래 경우에만 메시지:
- 사용자 승인 필요
- 블로커 발생
- 명령 실패
- 파괴적/dry-run/execute gate 도달
- 계획이 크게 변경됨
- 최종 결과 준비됨

**한국어 설명**을 사용한다. 사용자가 영어를 요청하면 영어로 변경.

---

## Before editing

1. `ls` / `cat`으로 현재 repo 상태와 구조 확인.
2. 이 `CLAUDE.md` 읽기.
3. 수정할 소스 파일 먼저 검사.
4. 관련 없는 수정 파일이 있으면, 편집 전에 보고.
5. 변경 카테고리 식별:
   - docs-only
   - setup/tooling
   - renderer-only
   - main-process-only
   - IPC change
   - character-engine change
   - asset change
   - packaging/signing change
6. 가장 안전하고 유용한 슬라이스만 구현. 범위를 넓히지 않는다.

---

## Core working rules

- 작은 reviewable diff를 선호한다.
- 한 태스크 = 한 슬라이스.
- 광범위하게 재작성하지 않는다. 현재 태스크가 명시적으로 요청한 경우 제외.
- 관련 없는 작업을 합치지 않는다.
- 사용자 파일을 삭제하거나 덮어쓰지 않는다.
- 불필요한 의존성을 추가하지 않는다.
- 백엔드 서버, DB, auth, billing, GitHub OAuth, auto-merge, 실제 LLM 호출을 추가하지 않는다. 명시적으로 요청된 경우 제외.
- 파괴적인 명령은 명시적 승인 없이 실행하지 않는다.
- 검증, 자동화, 테스트, 빌드가 실제로 실행되지 않은 경우 실행됐다고 주장하지 않는다.

---

## Git and user-file safety

- `git reset --hard`, `git clean -fd`, force-push, 브랜치 삭제 같은 파괴적 git 명령은 명시적 승인 없이 실행하지 않는다.
- 사용자 변경 사항을 덮어쓰거나 삭제하거나 되돌리지 않는다.
- 관련 없는 수정 파일이 있으면, 편집 전에 어떻게 처리할지 물어본다.
- 명시적 요청 없이 commit, push, merge, auto-merge, 파괴적 명령을 실행하지 않는다.

---

## Dependency and package-manager rules

- pnpm만 사용한다.
- `package-lock.json`이나 `yarn.lock`을 만들거나 커밋하지 않는다.
- 태스크에 명시적으로 필요하고 이유가 문서화된 경우에만 의존성을 추가하거나 업그레이드한다.
- `pnpm --filter` 명령 작성 시 반드시 실제 `package.json`의 `name` 필드를 기준으로 한다. 현재: root=`ai-3d-demo`, desktop=`@ai-3d-demo/desktop`, web=`@ai-3d-demo/web`.

---

## Environment and secrets

`.env.example`에 안전한 placeholder만:

```env
# Desktop companion app — MVP에서 필요한 secrets 없음
# 향후 AI 캐릭터 생성 기능(Slice 9) 추가 시 provider key를 여기 추가
```

규칙:
- MVP는 secrets 불필요. `.env.example`에 실제 API 키 예시를 추가하지 않는다.
- 실제 API 키, 인증 토큰, 프로덕션 자격증명을 커밋하지 않는다.
- 프론트엔드 노출 변수는 `VITE_*` 이름만 사용한다.
- renderer에서 직접 비밀 값을 노출하지 않는다.

---

## Validation expectations

**docs-only:**
- 타입체크 feasible하면 실행. 스킵 시 이유 명시.

**setup/tooling:**
- `pnpm install` 실행 (패키지 매니저 동작 변경 시).
- `pnpm run typecheck` feasible하면 실행.

**renderer / character-engine:**
- `pnpm run typecheck` 실행.

**Electron main process:**
- `pnpm run typecheck` 실행.
- 빌드 가능 여부 확인: `pnpm --filter @ai-3d-demo/desktop run build`.

**Packaging (Slice 10+):**
- electron-builder 또는 electron-forge 빌드 명령은 해당 태스크에서 명시적으로 지정.
- macOS signing/notarization은 자격증명 없이 자동 실행하지 않는다.

각 태스크 후 가능하면 실행:
```bash
pnpm install
pnpm run typecheck
```

명령이 의존성, 환경 변수, 플랫폼 문제로 실행 불가능하면 명확하게 보고한다.

---

## Useful scripts

| 명령 | 목적 |
|---|---|
| `pnpm install` | 워크스페이스 의존성 설치 |
| `pnpm run dev:web` | 웹 프로토타입 개발 서버 |
| `pnpm run dev:desktop` | Electron + Vite 개발 모드 |
| `pnpm run typecheck` | 전체 타입체크 |
| `pnpm run build` | 프로덕션 빌드 |

---

## MVP acceptance criteria (Slice 3–5 완료 시)

| Category | 완료 조건 |
|---|---|
| Overlay | 캐릭터가 투명 창 안에서 실제 Mac 화면 위에 보인다. |
| Always on top | 앱 창을 이동해도 캐릭터가 앞에 남아 있다. |
| Non-intrusive | click-through 상태에서 아래 앱 링크/버튼 클릭 가능. |
| Behavior | 최소 5개 행동이 자연스럽게 반복된다 (idle/walk/blink/sleep/lie). |
| Performance | Activity Monitor에서 CPU/GPU 사용량이 낮다. 팬 소음 없음. |

Tray/settings (메뉴바에서 show/hide/quit)는 Slice 6 범위이며, Slice 6 완료 시 별도 acceptance로 확인한다.

---

## Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Transparent always-on-top이 macOS spaces/fullscreen에서 다르게 동작 | High | Mac 실기기 QA 우선. Mission Control, 전체화면 앱, 멀티 모니터 테스트. |
| Click-through가 캐릭터 interaction을 막음 | Medium | 전체 click-through vs interactive debug 모드 먼저. 이후 hitbox 기반 전환 추가. |
| 3D 캐릭터가 companion용으로 너무 무거움 | Medium | 2D/primitive 먼저. 성능 예산 확인 후 GLB 추가 (Slice 8). |
| 앱이 귀엽지 않고 짜증스럽게 느껴짐 | High | 기본값은 차분하고 느린 행동. 기본 소리 없음. 쉬운 hide/pause. |
| Electron 패키징/signing friction | Medium | 로컬 MVP 동작 확인 후 패키징 진행. 우선 수동 실행으로 문서화. |
| Electron transparent window 한계 | Medium | Unity + 네이티브 브리지가 plan B. Electron이 한계에 부딪히면 검토. |

---

## Market reference

**malang.lab "MacPet"** (ADHD 도마뱀, [Instagram](https://www.instagram.com/reel/DZUKpTyz7T7/)) — 동일 컨셉 시장 검증 사례. 게시 2일 만에 좋아요 6,700+.

기술 스택: Unity(C#) + Objective-C 네이티브 브리지. 벽 타기·점프·춤 행동 포함.

Screen Friend 시사점:
- Electron transparent overlay 한계 시 Unity plan B.
- 벽 타기·점프·춤은 Slice 5 확장 후보.
- Meshy 협업 — Slice 9 AI 커스텀 캐릭터 시 API 검토.

---

## Final response format

매 태스크 후 보고:

1. 변경 요약
2. 변경된 파일 목록
3. 실행한 명령 / 테스트와 raw pass/fail 결과
4. 수동 테스트 방법
5. 알려진 한계 / TODO
6. 재시작 필요 여부
7. 토큰/사용량 정보 (가능하면)

Token usage 불가 시:
```
Token usage: not available
```

---

## Claude/agent-specific notes

- 이 `CLAUDE.md`를 먼저 읽는다.
- 파일 직접 검사, 명령 실행, 터미널 접근, 결과 검증이 불가능하면 명확하게 말한다.
- typecheck, build, 브라우저 검증, 패키지 배포가 실제 실행되지 않은 경우 실행됐다고 주장하지 않는다.
- red-lane 영역 (app signing, notarization, 파괴적 ops, 실제 API 키 노출) 태스크는 짧은 계획을 먼저 제시하고 승인 후 구현한다.
- 관련 없는 수정 파일이 있으면 편집 전에 멈추고 보고한다.
- commit, push, merge, auto-merge, 파괴적 명령은 명시적 요청 없이 실행하지 않는다.
