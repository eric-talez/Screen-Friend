import type { ThreeElements } from "@react-three/fiber";

function LaptopModel() {
  return (
    <group rotation={[0, -0.22, 0]}>
      <mesh receiveShadow castShadow position={[0, -0.08, 0]}>
        <boxGeometry args={[3.25, 0.16, 2.15]} />
        <meshStandardMaterial color="#cdd5d3" roughness={0.54} metalness={0.35} />
      </mesh>

      <mesh receiveShadow castShadow position={[0, 0.02, -0.18]}>
        <boxGeometry args={[2.82, 0.035, 1.08]} />
        <meshStandardMaterial color="#263238" roughness={0.74} metalness={0.08} />
      </mesh>

      <mesh receiveShadow castShadow position={[0, 0.045, 0.72]}>
        <boxGeometry args={[0.92, 0.038, 0.42]} />
        <meshStandardMaterial color="#aab6b5" roughness={0.7} metalness={0.18} />
      </mesh>

      {[-0.9, -0.45, 0, 0.45, 0.9].map((x) => (
        <mesh key={x} receiveShadow castShadow position={[x, 0.07, -0.32]}>
          <boxGeometry args={[0.28, 0.028, 0.16]} />
          <meshStandardMaterial color="#dfe6e4" roughness={0.78} />
        </mesh>
      ))}

      <group position={[0, 0.78, -1.04]} rotation={[-0.24, 0, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[2.85, 1.72, 0.12]} />
          <meshStandardMaterial color="#141c21" roughness={0.48} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0, 0.066]}>
          <planeGeometry args={[2.48, 1.36]} />
          <meshStandardMaterial color="#164f55" roughness={0.48} emissive="#123738" />
        </mesh>
        <mesh position={[0, 0, 0.071]}>
          <planeGeometry args={[1.82, 1.02]} />
          <meshStandardMaterial
            color="#2f756f"
            roughness={0.38}
            emissive="#1d5855"
            emissiveIntensity={0.42}
            transparent
            opacity={0.64}
          />
        </mesh>
        <mesh position={[0, -0.01, 0.084]} scale={[0.68, 0.68, 0.68]}>
          <ringGeometry args={[0.7, 0.73, 48]} />
          <meshStandardMaterial
            color="#d8f2ff"
            emissive="#24746d"
            emissiveIntensity={0.32}
            transparent
            opacity={0.34}
          />
        </mesh>
        <mesh position={[0.62, 0.18, 0.072]}>
          <sphereGeometry args={[0.18, 24, 16]} />
          <meshStandardMaterial color="#d99b34" roughness={0.42} />
        </mesh>
        <CreatureModel
          position={[-0.16, -0.12, 0.26]}
          rotation={[0.08, -0.2, -0.03]}
          scale={[0.48, 0.48, 0.48]}
        />
      </group>
    </group>
  );
}

function CreatureModel(props: ThreeElements["group"]) {
  return (
    <group {...props}>
      <mesh castShadow position={[0, 0.13, 0]} scale={[0.7, 0.24, 0.3]}>
        <sphereGeometry args={[0.5, 32, 18]} />
        <meshStandardMaterial color="#d99b34" roughness={0.65} />
      </mesh>

      <mesh castShadow position={[0.46, 0.18, -0.02]} scale={[0.3, 0.22, 0.24]}>
        <sphereGeometry args={[0.5, 32, 18]} />
        <meshStandardMaterial color="#e6b54b" roughness={0.62} />
      </mesh>

      <mesh castShadow position={[-0.52, 0.12, 0]} rotation={[0, 0, 1.32]}>
        <coneGeometry args={[0.12, 0.78, 18]} />
        <meshStandardMaterial color="#24746d" roughness={0.7} />
      </mesh>

      {[
        [-0.2, -0.02, 0.25],
        [0.22, -0.02, 0.24],
        [-0.16, -0.02, -0.25],
        [0.25, -0.02, -0.23],
      ].map(([x, y, z]) => (
        <mesh key={`${x}-${z}`} castShadow position={[x, y, z]} scale={[0.18, 0.08, 0.1]}>
          <sphereGeometry args={[0.5, 18, 12]} />
          <meshStandardMaterial color="#124a46" roughness={0.7} />
        </mesh>
      ))}

      {[-0.08, 0.08].map((z) => (
        <mesh key={z} castShadow position={[0.64, 0.32, z]} scale={[0.05, 0.05, 0.05]}>
          <sphereGeometry args={[0.5, 16, 12]} />
          <meshStandardMaterial color="#101416" roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

function StageSurface() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
      <circleGeometry args={[4.1, 64]} />
      <meshStandardMaterial color="#31423f" roughness={0.82} />
    </mesh>
  );
}

function MacBookScene() {
  return (
    <group>
      <StageSurface />
      <LaptopModel />
    </group>
  );
}

export default MacBookScene;
