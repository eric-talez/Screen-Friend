import { type ChangeEvent, useEffect, useRef, useState } from "react";
import CharacterStage from "./components/CharacterStage";
import SceneViewer from "./components/SceneViewer";
import { listCharacterAssets } from "./character/characterAssets";

// Slice 3: the Electron shell loads the same app with ?mode=overlay to get a
// minimal transparent character stage instead of the full sandbox page.
// Slice 4: &interactive=1 marks a debug launch where click-through is off.
// Slice 6: the desktop preload bridge pushes runtime tray toggles; in the
// browser sandbox the bridge is absent and the URL param stays in charge.
declare global {
  interface Window {
    screenFriend?: {
      shell: string;
      shellVersion: string;
      onInteractiveChanged?: (callback: (interactive: boolean) => void) => () => void;
      getSelectedCharacterId?: () => Promise<string>;
      setSelectedCharacterId?: (id: string) => Promise<void>;
    };
  }
}

const overlayParams = new URLSearchParams(window.location.search);
const isOverlayMode = overlayParams.get("mode") === "overlay";
const isInteractive = overlayParams.get("interactive") === "1";
// Slice 9B: ?asset=placeholder-sprite previews the sprite renderer; unknown
// values fall back to "default-css" via getCharacterAsset().
const assetIdFromUrl = overlayParams.get("asset");
const assetIdParam = assetIdFromUrl ?? "default-css";

if (isOverlayMode) {
  document.documentElement.classList.add("overlay-mode");
  document.body.classList.add("overlay-mode");
}

const workflowSteps = [
  {
    number: "01",
    title: "Animation sandbox",
    text: "Prototype the companion's idle, walk, blink, lie-down, and sleepy loops.",
  },
  {
    number: "02",
    title: "Desktop overlay",
    text: "Transparent always-on-top Electron overlay — live on the real Mac desktop.",
  },
  {
    number: "03",
    title: "Optional customization",
    text: "AI-generated character support (Slice 9) — planned after asset pipeline and persistence.",
  },
];

type GenerationState = "idle" | "ready" | "generating" | "success" | "error";

function OverlayApp() {
  const [interactive, setInteractive] = useState(isInteractive);
  // URL ?asset= is a dev override; when absent, load from persisted setting.
  const [assetId, setAssetId] = useState(assetIdParam);

  useEffect(() => {
    return window.screenFriend?.onInteractiveChanged?.(setInteractive);
  }, []);

  useEffect(() => {
    if (assetIdFromUrl === null) {
      void window.screenFriend?.getSelectedCharacterId?.().then(setAssetId);
    }
  }, []);

  return (
    <div className="overlay-shell">
      {interactive && <span className="overlay-debug-badge">interactive</span>}
      <CharacterStage overlay assetId={assetId} />
    </div>
  );
}

function App() {
  const assets = listCharacterAssets();
  const initialAssetId = assets.some((a) => a.id === assetIdParam) ? assetIdParam : "default-css";
  const [selectedAssetId, setSelectedAssetId] = useState(initialAssetId);

  useEffect(() => {
    const sf = window.screenFriend;
    if (sf?.getSelectedCharacterId) {
      void sf.getSelectedCharacterId().then((id) => {
        const valid = assets.some((a) => a.id === id) ? id : "default-css";
        setSelectedAssetId(valid);
      });
    }
  }, []);

  const handleAssetChange = (id: string) => {
    setSelectedAssetId(id);
    const url = new URL(window.location.href);
    url.searchParams.set("asset", id);
    window.history.replaceState(null, "", url.toString());
    void window.screenFriend?.setSelectedCharacterId?.(id);
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generationState, setGenerationState] = useState<GenerationState>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Optional customization prototype is idle.");
  const objectUrlRef = useRef<string | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearMockTimers = () => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  };

  const revokePreviewUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearMockTimers();
      revokePreviewUrl();
    };
  }, []);

  const handleImageSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    clearMockTimers();

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      revokePreviewUrl();
      setSelectedFile(null);
      setPreviewUrl(null);
      setProgress(0);
      setGenerationState("error");
      setMessage("Choose a PNG, JPG, WEBP, or another image file for the customization prototype.");
      event.target.value = "";
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(file);
    revokePreviewUrl();
    objectUrlRef.current = nextPreviewUrl;
    setSelectedFile(file);
    setPreviewUrl(nextPreviewUrl);
    setProgress(0);
    setGenerationState("ready");
    setMessage("Image selected for the optional character customization prototype.");
  };

  const handleGenerate = () => {
    if (!selectedFile || generationState === "generating") {
      return;
    }

    clearMockTimers();
    setGenerationState("generating");
    setProgress(12);
    setMessage("Reading image details for a mock customization pass.");

    timersRef.current = [
      window.setTimeout(() => {
        setProgress(38);
        setMessage("Building a mock character customization preview.");
      }, 650),
      window.setTimeout(() => {
        setProgress(72);
        setMessage("Preparing the experimental viewer handoff.");
      }, 1400),
      window.setTimeout(() => {
        setProgress(100);
        setGenerationState("success");
        setMessage("Mock customization preview is ready in the experimental viewer.");
        timersRef.current = [];
      }, 2300),
    ];
  };

  const statusItems = [
    {
      label: selectedFile ? "Reference image selected" : "Customization prototype idle",
      detail: selectedFile ? selectedFile.name : "The companion MVP does not require an image yet.",
      state: selectedFile ? "complete" : generationState === "error" ? "error" : "active",
    },
    {
      label:
        generationState === "generating"
          ? "Running mock customization"
          : generationState === "success"
            ? "Mock customization complete"
            : "Future customization ready",
      detail:
        generationState === "idle"
          ? "Upload is optional and reserved for future character customization."
          : generationState === "ready"
            ? "Click Mock customize to simulate a later customization flow."
            : message,
      state:
        generationState === "generating"
          ? "active"
          : generationState === "success"
            ? "complete"
            : generationState === "error"
              ? "error"
              : selectedFile
                ? "active"
                : "pending",
    },
    {
      label: generationState === "success" ? "Experimental viewer showing preview" : "Desktop companion is live",
      detail:
        generationState === "success"
          ? "The current 3D scene remains a prototype, not the desktop companion MVP."
          : "The desktop companion is now live. This 3D prototype is a future customization placeholder.",
      state: generationState === "success" ? "complete" : "pending",
    },
  ];
  const canGenerate = Boolean(selectedFile) && generationState !== "generating";
  const fileSummary = selectedFile ? `${selectedFile.name} · ${selectedFile.type || "image"}` : null;
  const viewerCaption =
    generationState === "success"
      ? "Experimental customization preview is shown here for now."
      : "Experimental 3D prototype. The MVP will move toward a bottom-of-screen companion stage.";

  return (
    <main className="app-shell">
      <header className="site-header" aria-label="Screen Friend header">
        <a className="brand" href="#top" aria-label="Screen Friend home">
          <span className="brand-mark" aria-hidden="true" />
          <span>Screen Friend</span>
        </a>
        <nav className="nav-links" aria-label="Page sections">
          <a href="#sandbox">Sandbox</a>
          <a href="#workflow">Roadmap</a>
          <a href="#workspace">Prototype</a>
        </nav>
      </header>

      <section id="top" className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">Desktop companion direction</p>
          <h1 id="hero-title">Screen Friend / 화면 친구</h1>
          <p className="hero-text">
            A Mac desktop companion: a small character that lives near the bottom
            of the screen, stays above other windows, walks around, blinks, lies
            down, gets sleepy, and loops soft ambient behaviors — without
            interrupting your work.
          </p>
          <div className="hero-actions" aria-label="Current slice status">
            <span className="status-pill">Slices 0–8.5 complete</span>
            <span className="status-pill muted">Desktop overlay live</span>
          </div>
        </div>
        <aside className="hero-preview" aria-label="Demo preview card">
          <div className="mini-laptop" aria-hidden="true">
            <div className="mini-screen">
              <span />
            </div>
            <div className="mini-base">
              <span />
            </div>
          </div>
          <p>Temporary 3D prototype. The companion is live on desktop; this viewer is future customization placeholder material.</p>
        </aside>
      </section>

      <section id="sandbox" className="sandbox-section" aria-labelledby="sandbox-title">
        <div className="section-heading">
          <p className="section-kicker">Web sandbox · Character behavior prototype</p>
          <h2 id="sandbox-title">The companion behavior loop.</h2>
          <p className="sandbox-note">
            Idle, walk, blink, lie down, sleepy, and sleep loop on a weighted
            random scheduler. The real desktop companion runs the same engine
            inside a transparent always-on-top Electron overlay.
          </p>
        </div>
        <div className="asset-selector" role="group" aria-label="Character asset">
          {assets.map((asset) => (
            <label
              key={asset.id}
              className={`asset-option${selectedAssetId === asset.id ? " selected" : ""}`}
            >
              <input
                className="asset-option-input"
                type="radio"
                name="sandbox-asset"
                value={asset.id}
                checked={selectedAssetId === asset.id}
                onChange={() => handleAssetChange(asset.id)}
              />
              {asset.name}
            </label>
          ))}
        </div>
        <CharacterStage assetId={selectedAssetId} />
      </section>

      <section className="explanation-section" aria-labelledby="explanation-title">
        <p className="section-kicker">MVP status</p>
        <h2 id="explanation-title">The desktop companion is live — this page is the behavior sandbox.</h2>
        <p>
          The existing upload and MacBook viewer remain as future customization
          prototype material. The desktop companion (Electron overlay, click-through,
          tray controls, persistence, animation polish) is already working. Next:
          Slice 9 optional AI custom character.
        </p>
      </section>

      <section id="workflow" className="workflow-section" aria-labelledby="workflow-title">
        <div className="section-heading">
          <p className="section-kicker">Roadmap — Slices 0–8.5 complete</p>
          <h2 id="workflow-title">What's been built and what comes next.</h2>
        </div>
        <div className="workflow-grid">
          {workflowSteps.map((step) => (
            <article className="workflow-card" key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workspace" className="demo-grid" aria-label="Screen Friend prototype workspace">
        <article className="panel upload-panel">
          <div className="panel-heading">
            <p className="section-kicker">Future customization prototype</p>
            <h2>Optional image reference</h2>
          </div>
          <div className="upload-dropzone" aria-label="Image selection panel">
            {previewUrl ? (
              <img className="image-preview" src={previewUrl} alt="Selected source preview" />
            ) : (
              <div className="upload-empty-state">
                <div className="upload-icon" aria-hidden="true">
                  +
                </div>
                <p>Select a source image for a later character customization idea.</p>
                <span>This is not required for the Screen Friend MVP</span>
              </div>
            )}
          </div>
          {fileSummary && <p className="file-summary">{fileSummary}</p>}
          <div className="upload-actions">
            <label className="secondary-action" htmlFor="source-image">
              {selectedFile ? "Change image" : "Choose image"}
            </label>
            <input
              id="source-image"
              className="file-input"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageSelect}
            />
            <button className="primary-action" type="button" onClick={handleGenerate} disabled={!canGenerate}>
              {generationState === "generating" ? "Mocking..." : "Mock customize"}
            </button>
          </div>
          {generationState === "error" && <p className="error-message">{message}</p>}
        </article>

        <article className="panel status-panel">
          <div className="panel-heading">
            <p className="section-kicker">Prototype status</p>
            <h2>Customization mock</h2>
          </div>
          <ol className="status-list">
            {statusItems.map((item, index) => (
              <li className={`status-item ${item.state}`} key={item.label}>
                <span aria-hidden="true">{index + 1}</span>
                <div>
                  <p>{item.label}</p>
                  <small>{item.detail}</small>
                </div>
              </li>
            ))}
          </ol>
          <div className="mock-progress" aria-label={`Mock generation progress ${progress}%`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <p className="status-message">{message}</p>
        </article>

        <article id="viewer" className="panel viewer-panel">
          <div className="panel-heading">
            <p className="section-kicker">Experimental 3D prototype</p>
            <h2>Character sandbox placeholder</h2>
          </div>
          <div className="viewer-placeholder" aria-label="Mock 3D viewer placeholder">
            <SceneViewer />
            <p>{viewerCaption}</p>
          </div>
        </article>
      </section>
    </main>
  );
}

export default isOverlayMode ? OverlayApp : App;
