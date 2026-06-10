import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import MacBookScene from "./MacBookScene";

function SceneViewer() {
  return (
    <div className="viewer-canvas-shell">
      <Canvas
        camera={{ position: [4, 3, 5], fov: 42 }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#172026"]} />
        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#d8f2ff", "#24312e", 1.1]} />
        <directionalLight
          castShadow
          intensity={2.2}
          position={[3.5, 5, 3]}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <MacBookScene />
        <ContactShadows
          opacity={0.45}
          scale={7}
          blur={2.5}
          far={4}
          position={[0, -0.54, 0]}
        />
        <OrbitControls
          enablePan={false}
          enableDamping
          minDistance={3.4}
          maxDistance={8}
          target={[0, 0.2, 0]}
        />
      </Canvas>
    </div>
  );
}

export default SceneViewer;
