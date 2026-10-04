import * as THREE from "three";
import type { Silhouette } from "@/data/chairs";
import { luminance, type Mats } from "./materials";
import { Beam, Extruded, Slab, Tube, archShape, ellipseShape, type Vec3 } from "./parts";

type P = { m: Mats; color: string };

const mirror = (pts: Vec3[]): Vec3[] => pts.map(([x, y, z]) => [-x, y, z]);

// Points along an arch for rattan / cane frames.
function archPoints(hw: number, base: number, straight: number, z: number, steps = 18): Vec3[] {
  const pts: Vec3[] = [[-hw, base, z], [-hw, base + straight, z]];
  for (let i = 1; i < steps; i++) {
    const a = Math.PI - (i / steps) * Math.PI;
    pts.push([Math.cos(a) * hw, base + straight + Math.sin(a) * hw, z]);
  }
  pts.push([hw, base + straight, z], [hw, base, z]);
  return pts;
}

function CrossBack({ m }: P) {
  const x = 0.2, zf = 0.19, zb = -0.19;
  return (
    <group>
      <Slab position={[0, 0.44, 0]} size={[0.46, 0.04, 0.44]} radius={0.012} material={m.woodSeat} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Beam a={[s * x, 0, zf]} b={[s * x, 0.43, zf]} r1={0.015} r2={0.02} material={m.wood} />
          <Beam a={[s * x, 0, zb]} b={[s * x, 0.93, zb - 0.035]} r1={0.017} r2={0.02} material={m.wood} />
          <Beam a={[s * x, 0.2, zf]} b={[s * x, 0.2, zb]} r1={0.011} material={m.wood} />
        </group>
      ))}
      <Beam a={[-x, 0.2, zf]} b={[x, 0.2, zf]} r1={0.011} material={m.wood} />
      <Slab position={[0, 0.88, zb - 0.033]} size={[0.42, 0.07, 0.028]} radius={0.01} material={m.wood} />
      <Slab position={[0, 0.56, zb - 0.021]} size={[0.4, 0.04, 0.022]} radius={0.008} material={m.wood} />
      <Beam a={[-0.185, 0.58, zb - 0.024]} b={[0.185, 0.855, zb - 0.03]} r1={0.012} material={m.wood} />
      <Beam a={[0.185, 0.58, zb - 0.024]} b={[-0.185, 0.855, zb - 0.03]} r1={0.012} material={m.wood} />
    </group>
  );
}

function Ghost({ m }: P) {
  const ring = ellipseShape(0.19, 0.27, [0.15, 0.23]);
  const panel = ellipseShape(0.15, 0.23);
  const front = (s: number): Vec3[] => [[s * 0.19, 0, 0.19], [s * 0.205, 0.14, 0.2], [s * 0.195, 0.3, 0.19], [s * 0.2, 0.44, 0.18]];
  return (
    <group>
      <Slab position={[0, 0.455, 0]} size={[0.46, 0.03, 0.44]} radius={0.012} material={m.acrylic} />
      <Slab position={[0, 0.425, 0]} size={[0.42, 0.03, 0.4]} radius={0.01} material={m.acrylic} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Tube points={front(s)} r={0.014} material={m.acrylic} detail={40} />
          <Beam a={[s * 0.19, 0, -0.19]} b={[s * 0.19, 0.44, -0.17]} r1={0.013} r2={0.016} material={m.acrylic} />
          <Beam a={[s * 0.12, 0.46, -0.18]} b={[s * 0.15, 0.55, -0.2]} r1={0.01} material={m.acrylic} />
        </group>
      ))}
      <Extruded shape={ring} depth={0.018} position={[0, 0.73, -0.2]} rotation={[-0.1, 0, 0]} material={m.acrylic} />
      <Extruded shape={panel} depth={0.008} bevel={0.002} position={[0, 0.73, -0.2]} rotation={[-0.1, 0, 0]} material={m.acrylic} />
    </group>
  );
}

function Rattan({ m }: P) {
  const frame = archPoints(0.21, 0.5, 0.2, -0.2);
  const shape = new THREE.Shape();
  shape.moveTo(-0.205, 0);
  shape.lineTo(-0.205, 0.2);
  shape.absarc(0, 0.2, 0.205, Math.PI, 0, true);
  shape.lineTo(0.205, 0);
  shape.lineTo(-0.205, 0);
  return (
    <group>
      <Slab position={[0, 0.44, 0]} size={[0.46, 0.065, 0.44]} radius={0.028} material={m.rattan} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Beam a={[s * 0.18, 0, 0.17]} b={[s * 0.2, 0.42, 0.19]} r1={0.013} r2={0.017} material={m.rattanPole} />
          <Beam a={[s * 0.18, 0, -0.17]} b={[s * 0.2, 0.42, -0.19]} r1={0.013} r2={0.017} material={m.rattanPole} />
          <Beam a={[s * 0.19, 0.2, 0.18]} b={[s * 0.19, 0.2, -0.18]} r1={0.008} material={m.rattanPole} />
        </group>
      ))}
      <Tube points={frame} r={0.014} material={m.rattanPole} />
      <mesh position={[0, 0.5, -0.2]} rotation={[-0.08, 0, 0]} material={m.cane} castShadow receiveShadow>
        <shapeGeometry args={[shape, 40]} />
      </mesh>
      <Beam a={[-0.2, 0.45, -0.19]} b={[-0.21, 0.52, -0.2]} r1={0.012} material={m.rattanPole} />
      <Beam a={[0.2, 0.45, -0.19]} b={[0.21, 0.52, -0.2]} r1={0.012} material={m.rattanPole} />
    </group>
  );
}

function Bentwood({ m }: P) {
  const L: Vec3[] = [[-0.16, 0.47, -0.16], [-0.17, 0.66, -0.19], [-0.13, 0.88, -0.215], [-0.05, 0.98, -0.22]];
  const outer: Vec3[] = [...L, ...mirror(L).reverse()];
  const inner: Vec3[] = [[-0.1, 0.6, -0.195], [-0.09, 0.78, -0.212], [-0.04, 0.88, -0.22], [0.04, 0.88, -0.22], [0.09, 0.78, -0.212], [0.1, 0.6, -0.195]];
  return (
    <group>
      <mesh position={[0, 0.455, 0]} material={m.caneSeat} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.04, 56]} />
      </mesh>
      <mesh position={[0, 0.43, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.wood} castShadow>
        <torusGeometry args={[0.205, 0.016, 14, 56]} />
      </mesh>
      <Tube points={outer} r={0.013} material={m.wood} />
      <Tube points={inner} r={0.008} material={m.wood} detail={40} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Beam a={[s * 0.19, 0, -0.2]} b={[s * 0.16, 0.47, -0.16]} r1={0.013} r2={0.015} material={m.wood} />
          <Tube points={[[s * 0.12, 0.43, 0.17], [s * 0.15, 0.2, 0.2], [s * 0.17, 0, 0.23]]} r={0.014} material={m.wood} detail={30} />
        </group>
      ))}
      <mesh position={[0, 0.2, 0.0]} rotation={[Math.PI / 2, 0, 0]} material={m.wood} castShadow>
        <torusGeometry args={[0.185, 0.008, 10, 56]} />
      </mesh>
    </group>
  );
}

function Wishbone({ m }: P) {
  const rail: Vec3[] = [[-0.2, 0.7, 0.05], [-0.2, 0.77, -0.1], [-0.12, 0.8, -0.2], [0, 0.8, -0.22], [0.12, 0.8, -0.2], [0.2, 0.77, -0.1], [0.2, 0.7, 0.05]];
  return (
    <group>
      <Slab position={[0, 0.44, 0]} size={[0.46, 0.045, 0.44]} radius={0.016} material={m.cord} />
      <Slab position={[0, 0.41, 0]} size={[0.46, 0.03, 0.44]} radius={0.01} material={m.wood} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Beam a={[s * 0.2, 0, 0.19]} b={[s * 0.2, 0.42, 0.18]} r1={0.014} r2={0.018} material={m.wood} />
          <Beam a={[s * 0.2, 0, -0.21]} b={[s * 0.19, 0.42, -0.17]} r1={0.014} r2={0.018} material={m.wood} />
          <Beam a={[s * 0.2, 0.7, 0.05]} b={[s * 0.2, 0.44, 0.1]} r1={0.014} material={m.wood} />
          <Beam a={[0, 0.62, -0.2]} b={[s * 0.08, 0.46, -0.18]} r1={0.011} material={m.wood} />
        </group>
      ))}
      <Beam a={[0, 0.8, -0.22]} b={[0, 0.62, -0.2]} r1={0.013} material={m.wood} />
      <Tube points={rail} r={0.017} material={m.wood} />
    </group>
  );
}

function Velvet({ m }: P) {
  return (
    <group>
      <Slab position={[0, 0.5, 0.01]} size={[0.48, 0.12, 0.46]} radius={0.045} material={m.velvet} />
      <group position={[0, 0.74, -0.2]} rotation={[-0.14, 0, 0]}>
        <Slab position={[0, 0, 0]} size={[0.46, 0.44, 0.08]} radius={0.04} material={m.velvet} />
        {[-0.115, 0, 0.115].map((x) => (
          <Slab key={x} position={[x * 1.0, 0, 0.04]} size={[0.006, 0.36, 0.006]} radius={0.003} material={m.velvetDark} />
        ))}
      </group>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Beam a={[s * 0.185, 0, 0.19]} b={[s * 0.2, 0.45, 0.2]} r1={0.011} r2={0.02} material={m.gold} />
          <Beam a={[s * 0.185, 0, -0.19]} b={[s * 0.2, 0.45, -0.2]} r1={0.011} r2={0.02} material={m.gold} />
        </group>
      ))}
    </group>
  );
}

function Infinity({ m }: P) {
  const x = 0.2;
  return (
    <group>
      <Slab position={[0, 0.455, 0]} size={[0.44, 0.05, 0.42]} radius={0.018} material={m.linen} />
      <Slab position={[0, 0.42, 0]} size={[0.46, 0.03, 0.44]} radius={0.01} material={m.metal} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Beam a={[s * x, 0, 0.19]} b={[s * x, 0.42, 0.19]} r1={0.012} r2={0.014} material={m.metal} />
          <Beam a={[s * x, 0, -0.19]} b={[s * x, 0.92, -0.22]} r1={0.012} r2={0.014} material={m.metal} />
        </group>
      ))}
      <Beam a={[-x, 0.9, -0.215]} b={[x, 0.9, -0.215]} r1={0.013} material={m.metal} />
      <Beam a={[-x, 0.55, -0.185]} b={[x, 0.55, -0.185]} r1={0.011} material={m.metal} />
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.078, 0.73, -0.2]} rotation={[-0.1, 0, 0]} material={m.metal} castShadow>
          <torusGeometry args={[0.078, 0.009, 14, 56]} />
        </mesh>
      ))}
    </group>
  );
}

function CaneBack({ m }: P) {
  const x = 0.2;
  return (
    <group>
      <Slab position={[0, 0.44, 0]} size={[0.46, 0.04, 0.44]} radius={0.012} material={m.woodSeat} />
      <Slab position={[0, 0.475, 0.0]} size={[0.43, 0.035, 0.41]} radius={0.016} material={m.linen} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Beam a={[s * x, 0, 0.19]} b={[s * x, 0.43, 0.19]} r1={0.014} r2={0.019} material={m.wood} />
          <Beam a={[s * x, 0, -0.19]} b={[s * x, 0.92, -0.225]} r1={0.016} r2={0.02} material={m.wood} />
          <Beam a={[s * x, 0.2, 0.19]} b={[s * x, 0.2, -0.19]} r1={0.01} material={m.wood} />
        </group>
      ))}
      <Slab position={[0, 0.9, -0.222]} size={[0.42, 0.06, 0.026]} radius={0.01} material={m.wood} />
      <Slab position={[0, 0.54, -0.196]} size={[0.4, 0.045, 0.024]} radius={0.01} material={m.wood} />
      <mesh position={[0, 0.72, -0.21]} rotation={[-0.1, 0, 0]} material={m.cane} castShadow receiveShadow>
        <planeGeometry args={[0.36, 0.3]} />
      </mesh>
    </group>
  );
}

function Windsor({ m }: P) {
  const bow: Vec3[] = [[-0.2, 0.5, -0.15], [-0.21, 0.7, -0.19], [-0.14, 0.9, -0.21], [0, 0.95, -0.215], [0.14, 0.9, -0.21], [0.21, 0.7, -0.19], [0.2, 0.5, -0.15]];
  return (
    <group>
      <Slab position={[0, 0.45, 0]} size={[0.46, 0.05, 0.42]} radius={0.02} material={m.paint} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Beam a={[s * 0.15, 0, 0.12]} b={[s * 0.2, 0.43, 0.16]} r1={0.013} r2={0.021} material={m.paint} />
          <Beam a={[s * 0.15, 0, -0.12]} b={[s * 0.2, 0.43, -0.16]} r1={0.013} r2={0.021} material={m.paint} />
          <Beam a={[s * 0.175, 0.2, 0.14]} b={[s * 0.175, 0.2, -0.14]} r1={0.009} material={m.paint} />
        </group>
      ))}
      <Beam a={[-0.175, 0.2, 0]} b={[0.175, 0.2, 0]} r1={0.009} material={m.paint} />
      {[-0.15, -0.1, -0.05, 0, 0.05, 0.1, 0.15].map((x) => (
        <Beam key={x} a={[x, 0.47, -0.17]} b={[x, 0.92, -0.213]} r1={0.008} material={m.paint} />
      ))}
      <Tube points={bow} r={0.015} material={m.paint} />
    </group>
  );
}

function Louis({ m, color }: P) {
  const frameMat = luminance(color) > 0.7 ? m.fabricIvory : m.fabricIvory;
  void frameMat;
  return (
    <group>
      <Slab position={[0, 0.465, 0]} size={[0.5, 0.075, 0.46]} radius={0.03} material={m.fabricIvory} />
      <Slab position={[0, 0.41, 0]} size={[0.52, 0.04, 0.48]} radius={0.014} material={m.gold} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Beam a={[s * 0.205, 0, 0.2]} b={[s * 0.215, 0.4, 0.21]} r1={0.011} r2={0.022} material={m.gold} segments={24} />
          <Beam a={[s * 0.205, 0, -0.2]} b={[s * 0.205, 0.5, -0.2]} r1={0.011} r2={0.02} material={m.gold} segments={24} />
        </group>
      ))}
      {[-1, 1].map((s) => (
        <Beam key={`p${s}`} a={[s * 0.2, 0.46, -0.2]} b={[s * 0.17, 0.66, -0.215]} r1={0.014} r2={0.012} material={m.gold} />
      ))}
      <Extruded shape={ellipseShape(0.2, 0.27, [0.168, 0.238])} depth={0.04} position={[0, 0.78, -0.21]} rotation={[-0.1, 0, 0]} material={m.gold} />
      <Extruded shape={ellipseShape(0.172, 0.242)} depth={0.05} bevel={0.012} position={[0, 0.78, -0.205]} rotation={[-0.1, 0, 0]} material={m.fabricIvory} />
      <mesh position={[0, 1.07, -0.24]} material={m.gold} castShadow>
        <sphereGeometry args={[0.022, 20, 16]} />
      </mesh>
    </group>
  );
}

function Shell({ m }: P) {
  // A scooped tub-style shell: a lathe-turned bowl open at the front, on a seat pan.
  const profile = [[0.2, 0], [0.235, 0.07], [0.28, 0.2], [0.305, 0.36], [0.31, 0.46]].map(([r, y]) => new THREE.Vector2(r, y));
  return (
    <group>
      <mesh position={[0, 0.42, -0.02]} material={m.shell} castShadow receiveShadow>
        <latheGeometry args={[profile, 72, Math.PI - 1.95, 3.9]} />
      </mesh>
      <mesh position={[0, 0.425, 0.02]} scale={[1, 1, 1.12]} material={m.shell} castShadow receiveShadow>
        <cylinderGeometry args={[0.235, 0.215, 0.05, 56]} />
      </mesh>
      {[[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => (
        <Beam key={`${sx}${sz}`} a={[sx * 0.23, 0, sz * 0.23]} b={[sx * 0.1, 0.42, sz * 0.09]} r1={0.011} r2={0.014} material={m.woodSeat} />
      ))}
    </group>
  );
}

function Folding({ m }: P) {
  const slats = [-0.17, -0.1, -0.03, 0.04, 0.11, 0.18];
  return (
    <group>
      {slats.map((z) => (
        <Slab key={z} position={[0, 0.455, z]} size={[0.43, 0.02, 0.055]} radius={0.006} material={m.wood} />
      ))}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Beam a={[s * 0.21, 0.44, -0.2]} b={[s * 0.21, 0.44, 0.2]} r1={0.011} material={m.wood} />
          <Beam a={[s * 0.21, 0, 0.21]} b={[s * 0.21, 0.44, -0.18]} r1={0.011} material={m.wood} />
          <Beam a={[s * 0.21, 0, -0.21]} b={[s * 0.21, 0.44, 0.18]} r1={0.011} material={m.wood} />
          <Beam a={[s * 0.21, 0.44, -0.2]} b={[s * 0.21, 0.9, -0.27]} r1={0.013} material={m.wood} />
        </group>
      ))}
      {[0.62, 0.74, 0.86].map((y) => (
        <Slab key={y} position={[0, y, -0.2 - (y - 0.44) * 0.15]} size={[0.43, 0.06, 0.014]} radius={0.005} rotation={[-0.15, 0, 0]} material={m.wood} />
      ))}
    </group>
  );
}

function Throne({ m, color }: P) {
  const dark = luminance(color) < 0.3;
  const fabric = dark ? m.velvet : m.fabricIvory;
  return (
    <group scale={1.28}>
      <Slab position={[0, 0.51, 0.02]} size={[0.6, 0.14, 0.56]} radius={0.05} material={fabric} />
      <Slab position={[0, 0.41, 0.02]} size={[0.64, 0.06, 0.6]} radius={0.02} material={m.gold} />
      <Extruded shape={archShape(0.36, 0.5, { inset: 0.075 })} depth={0.05} position={[0, 0.5, -0.27]} material={m.gold} />
      <Extruded shape={archShape(0.286, 0.5)} depth={0.07} bevel={0.012} position={[0, 0.5, -0.265]} material={fabric} />
      <mesh position={[0, 1.38, -0.27]} material={m.gold} castShadow>
        <sphereGeometry args={[0.035, 24, 16]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <Slab position={[s * 0.33, 0.7, 0.02]} size={[0.06, 0.06, 0.5]} radius={0.02} material={m.gold} />
          <Beam a={[s * 0.33, 0.5, 0.25]} b={[s * 0.33, 0.7, 0.25]} r1={0.02} material={m.gold} />
          <Beam a={[s * 0.3, 0, 0.26]} b={[s * 0.31, 0.41, 0.27]} r1={0.02} r2={0.034} material={m.gold} segments={24} />
          <Beam a={[s * 0.3, 0, -0.24]} b={[s * 0.31, 0.41, -0.24]} r1={0.02} r2={0.034} material={m.gold} segments={24} />
        </group>
      ))}
    </group>
  );
}

const models: Record<Silhouette, (p: P) => React.JSX.Element> = {
  crossback: CrossBack,
  ghost: Ghost,
  rattan: Rattan,
  bentwood: Bentwood,
  wishbone: Wishbone,
  velvet: Velvet,
  infinity: Infinity,
  cane: CaneBack,
  windsor: Windsor,
  louis: Louis,
  shell: Shell,
  folding: Folding,
  throne: Throne,
};

export function ChairModel({ silhouette, m, color }: { silhouette: Silhouette; m: Mats; color: string }) {
  const Model = models[silhouette];
  return <Model m={m} color={color} />;
}
