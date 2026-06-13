/**
 * Slice 9F-1: mock-only generation scaffold.
 *
 * This panel is feature-flagged (App.tsx renders it only for ?customGen=1) and
 * is a SCAFFOLD ONLY. It does NOT:
 *   - call any AI provider, SDK, or network endpoint
 *   - use an API key or .env
 *   - upload or process any image / personal photo
 *
 * On an explicit button click it simulates work locally and registers a runtime
 * sprite asset that reuses the existing placeholder SVGs via the asset-registry
 * seam (registerCharacterAsset). On any failure it falls back to "default-css".
 *
 * The consent checkbox + IP warning are a forward-looking (mock) consent gate so
 * the real 9F flow can reuse the shape; no image is submitted here.
 */
import { useEffect, useRef, useState } from "react";
import {
  PLACEHOLDER_SPRITE_ASSET,
  registerCharacterAsset,
  type CharacterAssetDefinition,
} from "../character/characterAssets";

type MockStatus = "idle" | "generating" | "success" | "error";

interface MockGenerationPanelProps {
  /** Called with the new runtime asset ID on success, or "default-css" on failure. */
  onGenerated: (assetId: string) => void;
}

function MockGenerationPanel({ onGenerated }: MockGenerationPanelProps) {
  const [consented, setConsented] = useState(false);
  const [status, setStatus] = useState<MockStatus>("idle");
  const [message, setMessage] = useState(
    "Mock only — no API call, no upload, no provider, no key.",
  );
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => clearTimers, []);

  const handleGenerate = () => {
    // Explicit user action only. No auto-generation anywhere.
    if (!consented || status === "generating") {
      return;
    }

    clearTimers();
    setStatus("generating");
    setMessage("Simulating a local mock generation (no network)…");

    timersRef.current = [
      window.setTimeout(() => {
        setMessage("Composing a placeholder-based runtime asset…");
      }, 500),
      window.setTimeout(() => {
        // Reuse the existing placeholder sprite SVGs — no new assets, no upload.
        // Narrow the discriminated union so actionAssets is the sprite variant.
        if (PLACEHOLDER_SPRITE_ASSET.renderer !== "sprite") {
          onGenerated("default-css");
          setStatus("error");
          setMessage("Mock generation failed — fell back to default-css.");
          timersRef.current = [];
          return;
        }
        const id = `mock-generated-${Date.now()}`;
        const asset: CharacterAssetDefinition = {
          id,
          name: "Mock Generated",
          renderer: "sprite",
          actionAssets: PLACEHOLDER_SPRITE_ASSET.actionAssets,
        };

        try {
          registerCharacterAsset(asset);
          onGenerated(id);
          setStatus("success");
          setMessage("Mock asset registered and selected. No AI was used.");
        } catch {
          // Failure path falls back to default-css; error is surfaced, not swallowed.
          onGenerated("default-css");
          setStatus("error");
          setMessage("Mock generation failed — fell back to default-css.");
        }
        timersRef.current = [];
      }, 1100),
    ];
  };

  return (
    <section className="mock-gen-panel" aria-labelledby="mock-gen-title">
      <p className="section-kicker">Slice 9F-1 · experimental</p>
      <h3 id="mock-gen-title">Mock custom generation</h3>
      <p className="mock-gen-warning" role="note">
        We stylize, not copy. Do not upload characters you don't own.
      </p>
      <p className="mock-gen-note">
        Mock only — no API call, no upload, no provider, no key. This only
        registers a local placeholder-based runtime asset.
      </p>
      <label className="mock-gen-consent">
        <input
          type="checkbox"
          checked={consented}
          onChange={(e) => setConsented(e.target.checked)}
        />
        I understand this is a mock consent gate; no image is submitted or
        processed.
      </label>
      <button
        className="primary-action"
        type="button"
        onClick={handleGenerate}
        disabled={!consented || status === "generating"}
      >
        {status === "generating" ? "Generating mock…" : "Generate mock asset"}
      </button>
      <p className="status-message" aria-live="polite">
        {message}
      </p>
    </section>
  );
}

export default MockGenerationPanel;
