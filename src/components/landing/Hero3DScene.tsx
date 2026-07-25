import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, Line } from "@react-three/drei";
import * as THREE from "three";

const GOLD = "#d4a853";
const GOLD_LIGHT = "#f0d48a";

/** Petits nœuds lumineux représentant menu / commandes / stock / factures / stats, reliés au cœur central. */
function Nodes({ groupRef }: { groupRef: React.RefObject<THREE.Group | null> }) {
  const nodePositions = useMemo<[number, number, number][]>(
    () => [
      [1.9, 0.9, 0.4],
      [-1.7, 1.1, -0.6],
      [1.4, -1.2, 0.8],
      [-1.5, -0.9, 0.5],
      [0.2, 1.7, -0.9],
    ],
    [],
  );

  return (
    <group ref={groupRef}>
      {/* Coeur central : icosaèdre filaire */}
      <Float speed={1.4} rotationIntensity={0.6} floatIntensity={0.8}>
        <mesh>
          <icosahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={GOLD} wireframe transparent opacity={0.85} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={GOLD}
            emissive={GOLD}
            emissiveIntensity={0.35}
            transparent
            opacity={0.06}
            roughness={0.2}
          />
        </mesh>
      </Float>

      {nodePositions.map((pos, i) => (
        <group key={i}>
          <Line points={[[0, 0, 0], pos]} color={GOLD} transparent opacity={0.28} lineWidth={1} />
          <Float speed={1.6 + i * 0.15} rotationIntensity={0.3} floatIntensity={1.4}>
            <mesh position={pos}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial
                color={GOLD_LIGHT}
                emissive={GOLD}
                emissiveIntensity={1.1}
                roughness={0.3}
              />
            </mesh>
          </Float>
        </group>
      ))}
    </group>
  );
}

function Scene() {
  const groupRef = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const g = groupRef.current;
    if (!g) return;
    g.rotation.y += delta * 0.12;
    // parallax léger vers la position du curseur (souris uniquement, no-op sur mobile)
    pointer.current.x = state.pointer.x;
    pointer.current.y = state.pointer.y;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, pointer.current.y * 0.15, 0.03);
    g.position.x = THREE.MathUtils.lerp(g.position.x, pointer.current.x * 0.25, 0.03);
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 3, 4]} intensity={2} color={GOLD_LIGHT} />
      <pointLight position={[-4, -2, -3]} intensity={0.8} color={GOLD} />
      <Nodes groupRef={groupRef} />
      <Sparkles count={40} scale={6} size={2} speed={0.3} color={GOLD} opacity={0.5} />
    </>
  );
}

export default function Hero3DScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 5.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <Scene />
    </Canvas>
  );
}
