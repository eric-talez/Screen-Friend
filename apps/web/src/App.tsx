import { type ChangeEvent, useEffect, useRef, useState } from "react";
import CharacterStage from "./components/CharacterStage";
import SceneViewer from "./components/SceneViewer";

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
    };
  }
}

const overlayParams = new URLSearchParams(window.location.search);
const isOverlayMode = overlayParams.get("mode") === "overlay";
const isInteractive = overlayParams.get("interactive") === "1";

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
    text: "Later package the character into a transparent always-on-top Mac window.",
  },
  {
    number: "03",
    title: "Optional customization",
    text: "AI-generated character support can return after the companion loop works.",
  },
];

type GenerationState = "idle" | "ready" | "generating" | "success" | "error";

function OverlayApp() {
  const [interactive, setInteractive] = useState(isInteractive);

  useEffect(() => {
    return window.screenFriend?.onInteractiveChanged?.(setInteractive);
  }, []);

  return (
    <div className="overlay-shell">
      {interactive && <span className="overlay-debug-badge">interactive</span>}
      <CharacterStage overlay />
    </div>
  );
}

function App() {
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
      label: generationState === "success" ? "Experimental viewer showing preview" : "Character sandbox comes next",
      detail:
        generationState === "success"
          ? "The current 3D scene remains a prototype, not the desktop companion MVP."
          : "Next slices should replace this with a bottom-of-screen character stage.",
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
            A future Mac desktop companion: a small character that lives near the
            bottom of the screen, stays above other windows, walks around, blinks,
            lies down, gets sleepy, and loops soft ambient behaviors.
          </p>
          <div className="hero-actions" aria-label="Current slice status">
            <span className="status-pill">Slice 1 · Character sandbox</span>
            <span className="status-pill muted">Desktop overlay planned</span>
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
          <p>Temporary 3D prototype. Future slices should focus on the companion behavior loop.</p>
        </aside>
      </section>

      <section id="sandbox" className="sandbox-section" aria-labelledby="sandbox-title">
        <div className="section-heading">
          <p className="section-kicker">Slice 1 · Character behavior sandbox</p>
          <h2 id="sandbox-title">The companion lives here first.</h2>
          <p className="sandbox-note">
            Idle, walk, blink, lie down, sleepy, and sleep loop on a weighted
            random scheduler. The same engine will later drive the transparent
            desktop overlay.
          </p>
        </div>
        <CharacterStage />
      </section>

      <section className="explanation-section" aria-labelledby="explanation-title">
        <p className="section-kicker">Corrected MVP focus</p>
        <h2 id="explanation-title">Build the character first, then the desktop overlay.</h2>
        <p>
          The existing upload and MacBook viewer remain as prototype material,
          but the core product is a screen companion with animation states and
          an eventual transparent always-on-top desktop window.
        </p>
      </section>

      <section id="workflow" className="workflow-section" aria-labelledby="workflow-title">
        <div className="section-heading">
          <p className="section-kicker">Pivot roadmap preview</p>
          <h2 id="workflow-title">The next work starts with character behavior.</h2>
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
