"use client";

import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Silhouette } from "@/data/chairs";
import { createMats } from "./materials";
import { flutes, marble } from "./textures";
import { ChairModel } from "./models";

type Quality = "high" | "low";

declare global {
  interface Window {
    __chairReady?: boolean;
  }
}

function ReadySignal({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    if (++frames.current === 24) {
      window.__chairReady = true;
      onReady?.();
    }
  });
  return null;
}

function LookAt({ y }: { y: number }) {
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    camera.lookAt(0, y, 0);
  }, [camera, y]);
  return null;
}

// The room: a circular hotel lobby with a polished dark marble floor, brass inlay,
// fluted walls and warm wall lights. The camera orbits inside it.
function Lobby({ quality }: { quality: Quality }) {
  const high = quality === "high";
  const floorTex = useMemo(() => {
    const t = marble();
    t.repeat.set(2.5, 2.5);
    return t;
  }, []);
  const fluteTex = useMemo(() => flutes(), []);
  const brass = useMemo(() => new THREE.MeshStandardMaterial({ color: "#c9a560", metalness: 1, roughness: 0.3 }), []);
  const glow = useMemo(() => new THREE.MeshBasicMaterial({ color: "#ffd9a0", toneMapped: false }), []);
  const sconces = useMemo(
    () => Array.from({ length: 12 }, (_, i) => ({ a: ((i + 0.5) / 12) * Math.PI * 2 })),
    [],
  );

  return (
    <group>
      <fog attach="fog" args={["#0c0907", 7, 15]} />
      {/* polished marble: semi-transparent so a mirrored chair below shows through as a reflection */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow renderOrder={1}>
        <circleGeometry args={[9, 128]} />
        <meshPhysicalMaterial
          map={floorTex}
          color="#5a554d"
          roughness={0.3}
          metalness={0.1}
          clearcoat={0.35}
          clearcoatRoughness={0.15}
          transparent
          opacity={0.82}
          envMapIntensity={0.22}
        />
      </mesh>
      {/* brass inlay rings */}
      {[1.28, 1.62].map((r, i) => (
        <mesh key={r} rotation-x={-Math.PI / 2} position-y={0.003} material={brass}>
          <ringGeometry args={[r, r + (i === 0 ? 0.035 : 0.018), 160]} />
        </mesh>
      ))}
      {/* fluted wall */}
      <mesh position-y={3}>
        <cylinderGeometry args={[6, 6, 6, 192, 1, true]} />
        <meshStandardMaterial side={THREE.BackSide} color="#2b241f" bumpMap={fluteTex} bumpScale={5} roughness={0.5} metalness={0.15} />
      </mesh>
      {/* brass band and pilasters */}
      <mesh position-y={0.55} material={brass}>
        <cylinderGeometry args={[5.97, 5.97, 0.06, 160, 1, true]} />
      </mesh>
      <mesh position-y={3.4} material={brass}>
        <cylinderGeometry args={[5.97, 5.97, 0.06, 160, 1, true]} />
      </mesh>
      {sconces.map(({ a }, i) => (
        <group key={i} position={[Math.sin(a) * 5.8, 2.1, -Math.cos(a) * 5.8]} rotation-y={-a}>
          <mesh position={[0, 0.2, 0.03]} material={glow}>
            <boxGeometry args={[0.06, 0.38, 0.03]} />
          </mesh>
          <mesh position={[0, 0.2, 0.01]} material={brass}>
            <boxGeometry args={[0.11, 0.46, 0.02]} />
          </mesh>
          {high && i % 2 === 0 ? <pointLight position={[0, 0.2, 0.5]} intensity={1.6} distance={5} decay={1.6} color="#ffc983" /> : null}
        </group>
      ))}
    </group>
  );
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.14} color="#ffe6c4" />
      <pointLight position={[0, 3.2, 0.6]} intensity={7} distance={9} decay={1.4} color="#ffd9a6" />
      {/* warm key from the front-left, with soft shadows */}
      <spotLight
        position={[-2.6, 3.8, 3]}
        angle={0.42}
        penumbra={1}
        intensity={85}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        color="#ffe0b4"
        target-position={[0, 0.45, 0]}
      />
      {/* cooler rim from behind to separate the chair from the wall */}
      <spotLight position={[2.8, 3.2, -3.2]} angle={0.5} penumbra={1} intensity={40} color="#ffeccc" />
      <Environment resolution={256} frames={1} environmentIntensity={0.55}>
        <Lightformer form="rect" intensity={2.2} color="#ffe2b6" position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[8, 8, 1]} />
        <Lightformer form="rect" intensity={2.6} color="#ffd9a0" position={[-5, 2, 2.5]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#f6ead6" position={[5, 1.8, 2]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#fff0d8" position={[0, 1.6, 6]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#ffd29a" position={[0, 2, -6]} scale={[10, 3, 1]} />
      </Environment>
    </>
  );
}

const DISTANCE: Partial<Record<Silhouette, number>> = { throne: 1.75, louis: 1.12, velvet: 1.0 };

export function ChairScene({
  silhouette,
  color,
  autoRotate = true,
  interactive = true,
  azimuth = 0.62,
  paused = false,
  signalReady = false,
  onReady,
  quality = "high",
}: {
  silhouette: Silhouette;
  color: string;
  autoRotate?: boolean;
  interactive?: boolean;
  azimuth?: number;
  paused?: boolean;
  signalReady?: boolean;
  onReady?: () => void;
  quality?: Quality;
}) {
  const m = useMemo(() => createMats(color), [color]);
  useEffect(() => {
    window.__chairReady = false;
  }, [silhouette, color]);

  const dist = 3.7 * (DISTANCE[silhouette] ?? 1);
  const pos: [number, number, number] = [Math.sin(azimuth) * dist, 1.0, Math.cos(azimuth) * dist];

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      frameloop={paused ? "never" : "always"}
      camera={{ position: pos, fov: 24, near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true, toneMappingExposure: 1.0 }}
      style={{ touchAction: "pan-y" }}
    >
      <color attach="background" args={["#0c0907"]} />
      <Lobby quality={quality} />
      <Lighting />
      <group>
        <ChairModel silhouette={silhouette} m={m} color={color} />
      </group>
      {/* mirrored copy: the floor's reflection */}
      <group scale={[1, -1, 1]}>
        <ChairModel silhouette={silhouette} m={m} color={color} />
      </group>
      <ContactShadows position={[0, 0.004, 0]} opacity={0.7} scale={3} blur={2.2} far={1.2} resolution={512} color="#000000" />
      {interactive ? (
        <OrbitControls
          target={[0, silhouette === "throne" ? 0.72 : 0.5, 0]}
          enablePan={false}
          enableZoom={false}
          autoRotate={autoRotate}
          autoRotateSpeed={0.7}
          minPolarAngle={0.95}
          maxPolarAngle={1.6}
          enableDamping
        />
      ) : null}
      {!interactive ? <LookAt y={silhouette === "throne" ? 0.72 : 0.52} /> : null}
      {signalReady || onReady ? <ReadySignal onReady={onReady} /> : null}
    </Canvas>
  );
}
