"use client";

import { ContactShadows, Environment, Lightformer, OrbitControls, SoftShadows } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Silhouette } from "@/data/chairs";
import { createMats } from "./materials";
import { ChairModel } from "./models";

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

function Studio() {
  return (
    <>
      <SoftShadows size={18} samples={14} focus={0.4} />
      <ambientLight intensity={0.12} />
      <spotLight
        position={[2.4, 3.6, 2.4]}
        angle={0.4}
        penumbra={1}
        intensity={70}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        color="#fff3e2"
      />
      <Environment resolution={256} frames={1} environmentIntensity={0.75}>
        <Lightformer form="rect" intensity={2.6} position={[0, 5, 0]} rotation-x={Math.PI / 2} scale={[9, 9, 1]} />
        <Lightformer form="rect" intensity={3.2} color="#fff1dc" position={[-5, 2.2, 2.5]} rotation-y={Math.PI / 2} scale={[7, 4, 1]} />
        <Lightformer form="rect" intensity={1.8} color="#e9eefb" position={[5, 1.6, -1.5]} rotation-y={-Math.PI / 2} scale={[7, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[0, 1.5, -6]} scale={[10, 4, 1]} />
        <Lightformer form="ring" intensity={2} position={[0, 2.5, 5]} scale={4} />
        <Lightformer form="rect" intensity={2.2} color="#fff6ea" position={[0, 1.6, 6]} scale={[12, 5, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#f3e6d2" position={[0, -3, 0]} rotation-x={-Math.PI / 2} scale={[10, 10, 1]} />
        <Lightformer form="rect" intensity={2} position={[3.5, 3, 3.5]} rotation-y={Math.PI / 4} scale={[5, 5, 1]} />
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
}: {
  silhouette: Silhouette;
  color: string;
  autoRotate?: boolean;
  interactive?: boolean;
  azimuth?: number;
  paused?: boolean;
  signalReady?: boolean;
  onReady?: () => void;
}) {
  const m = useMemo(() => createMats(color), [color]);
  useEffect(() => {
    window.__chairReady = false;
  }, [silhouette, color]);

  const dist = 3.0 * (DISTANCE[silhouette] ?? 1);
  const pos: [number, number, number] = [Math.sin(azimuth) * dist, 1.15, Math.cos(azimuth) * dist];

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      frameloop={paused ? "never" : "always"}
      camera={{ position: pos, fov: 24, near: 0.1, far: 30 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true, toneMappingExposure: 0.88 }}
      style={{ touchAction: "pan-y" }}
    >
      <Studio />
      <group>
        <ChairModel silhouette={silhouette} m={m} color={color} />
      </group>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <shadowMaterial opacity={0.16} color="#2a2018" />
      </mesh>
      <ContactShadows position={[0, 0.001, 0]} opacity={0.5} scale={3.4} blur={2.8} far={1.3} resolution={768} color="#2a2018" />
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
