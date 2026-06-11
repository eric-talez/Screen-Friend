import { useEffect, useRef, useState } from "react";
import { DEFAULT_CSS_ASSET } from "../character/characterAssets";
import { createBehaviorEngine, type CharacterState } from "../character/behaviorEngine";

const FRAME_INTERVAL_MS = 1_000 / 30; // 30fps budget per roadmap performance target.

// Slice 5: how close (px) the cursor must get to the character to trigger a reaction.
const REACT_RADIUS_PX = 90;
// Only react to recent cursor movement; a parked or long-gone cursor should
// not keep retriggering reactions every time the cooldown expires.
const POINTER_FRESH_MS = 400;

// Slice 8: use the asset registry for class names and labels.
const asset = DEFAULT_CSS_ASSET;

interface CharacterStageProps {
  /** Slice 3: render as a transparent desktop overlay (no card chrome/status). */
  overlay?: boolean;
}

function CharacterStage({ overlay = false }: CharacterStageProps) {
  const [state, setState] = useState<CharacterState | null>(null);
  const engineRef = useRef(createBehaviorEngine());
  const stageRef = useRef<HTMLDivElement | null>(null);
  // Pointer position and stage rect live in refs so mousemove never re-renders
  // and the rAF loop never queries the DOM.
  const pointerRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const stageRectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const cacheRect = () => {
      stageRectRef.current = stageRef.current?.getBoundingClientRect() ?? null;
    };
    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY, t: performance.now() };
    };

    cacheRect();
    // Layout can shift after mount (fonts, sections above the stage) and the
    // rect is viewport-relative, so scroll moves it too. Refresh on both, and
    // once a second as a cheap catch-all; pointer math stays ref-only.
    const refreshId = window.setInterval(cacheRect, 1_000);
    window.addEventListener("resize", cacheRect);
    window.addEventListener("scroll", cacheRect, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.clearInterval(refreshId);
      window.removeEventListener("resize", cacheRect);
      window.removeEventListener("scroll", cacheRect);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let accumulator = 0;

    const loop = (now: number) => {
      const dt = Math.min(now - lastTime, 250); // Clamp after tab switches.
      lastTime = now;
      accumulator += dt;
      if (accumulator >= FRAME_INTERVAL_MS) {
        const engine = engineRef.current;
        const pointer = pointerRef.current;
        const rect = stageRectRef.current;
        if (pointer && rect && rect.width > 0 && now - pointer.t <= POINTER_FRESH_MS) {
          // Character center: engine x is normalized to stage width; the body
          // sits just above the stage floor.
          const characterX = rect.left + engine.getState().x * rect.width;
          const characterY = rect.bottom - 60;
          const distance = Math.hypot(pointer.x - characterX, pointer.y - characterY);
          if (distance <= REACT_RADIUS_PX) {
            engine.notifyMouseNear((pointer.x - rect.left) / rect.width);
          }
        }
        const next = engine.tick(accumulator);
        accumulator = 0;
        setState({ ...next });
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const action = state?.action ?? "idle";
  const x = state?.x ?? 0.5;
  const direction = state?.direction ?? 1;
  const blinking = state?.blinking ?? false;
  const eyesClosed = blinking || action === "sleep" || action === "sleepy";

  return (
    <div
      ref={stageRef}
      className={`character-stage${overlay ? " character-stage--overlay" : ""}`}
      aria-label={overlay ? "Screen Friend desktop companion" : "Character behavior sandbox stage"}
    >
      {!overlay && (
        <div className="stage-status" aria-live="polite">
          <span className={`stage-action-pill action-${action}`}>{asset.actionAssets[action].label}</span>
          <span className="stage-hint">Web sandbox · the future desktop overlay will replace this stage</span>
        </div>
      )}
      <div className="stage-ground" aria-hidden="true" />
      <div
        className={`companion ${asset.actionAssets[action].className}`}
        style={{
          left: `${(x * 100).toFixed(2)}%`,
          transform: `translateX(-50%) scaleX(${direction})`,
        }}
        aria-hidden="true"
      >
        {action === "sleep" && <span className="companion-zzz">Z z</span>}
        {action === "react" && <span className="companion-react-mark">!</span>}
        <div className="companion-body">
          <div className="companion-tail" />
          <div className="companion-head">
            <div className={`companion-eye ${eyesClosed ? "closed" : ""}`} />
            <div className={`companion-eye ${eyesClosed ? "closed" : ""}`} />
          </div>
          <div className="companion-leg front" />
          <div className="companion-leg back" />
        </div>
      </div>
    </div>
  );
}

export default CharacterStage;
