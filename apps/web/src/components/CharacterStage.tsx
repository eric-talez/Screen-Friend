import { useEffect, useRef, useState } from "react";
import { createBehaviorEngine, type CharacterState } from "../character/behaviorEngine";

const FRAME_INTERVAL_MS = 1_000 / 30; // 30fps budget per roadmap performance target.

const ACTION_LABELS: Record<CharacterState["action"], string> = {
  idle: "Idle",
  walk: "Walking",
  lie: "Lying down",
  sleepy: "Getting sleepy",
  sleep: "Sleeping",
  stretch: "Stretching",
};

interface CharacterStageProps {
  /** Slice 3: render as a transparent desktop overlay (no card chrome/status). */
  overlay?: boolean;
}

function CharacterStage({ overlay = false }: CharacterStageProps) {
  const [state, setState] = useState<CharacterState | null>(null);
  const engineRef = useRef(createBehaviorEngine());

  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let accumulator = 0;

    const loop = (now: number) => {
      const dt = Math.min(now - lastTime, 250); // Clamp after tab switches.
      lastTime = now;
      accumulator += dt;
      if (accumulator >= FRAME_INTERVAL_MS) {
        const next = engineRef.current.tick(accumulator);
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
      className={`character-stage${overlay ? " character-stage--overlay" : ""}`}
      aria-label={overlay ? "Screen Friend desktop companion" : "Character behavior sandbox stage"}
    >
      {!overlay && (
        <div className="stage-status" aria-live="polite">
          <span className={`stage-action-pill action-${action}`}>{ACTION_LABELS[action]}</span>
          <span className="stage-hint">Web sandbox · the future desktop overlay will replace this stage</span>
        </div>
      )}
      <div className="stage-ground" aria-hidden="true" />
      <div
        className={`companion companion-${action}`}
        style={{
          left: `${(x * 100).toFixed(2)}%`,
          transform: `translateX(-50%) scaleX(${direction})`,
        }}
        aria-hidden="true"
      >
        {action === "sleep" && <span className="companion-zzz">Z z</span>}
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
