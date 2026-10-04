import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

export type Vec3 = [number, number, number];

const UP = new THREE.Vector3(0, 1, 0);

// A round beam between two points. r1 is the radius at `a`, r2 at `b`.
export function Beam({
  a,
  b,
  r1 = 0.012,
  r2,
  material,
  segments = 20,
}: {
  a: Vec3;
  b: Vec3;
  r1?: number;
  r2?: number;
  material: THREE.Material;
  segments?: number;
}) {
  const { position, quaternion, length } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    return {
      position: va.clone().add(vb).multiplyScalar(0.5),
      length: dir.length(),
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize()),
    };
  }, [a, b]);
  return (
    <mesh position={position} quaternion={quaternion} material={material} castShadow={!material.transparent} receiveShadow>
      <cylinderGeometry args={[r2 ?? r1, r1, length, segments]} />
    </mesh>
  );
}

// A smooth tube following a curve through points.
export function Tube({
  points,
  r = 0.01,
  material,
  closed = false,
  detail = 80,
}: {
  points: Vec3[];
  r?: number;
  material: THREE.Material;
  closed?: boolean;
  detail?: number;
}) {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), closed, "catmullrom", 0.5);
    return new THREE.TubeGeometry(curve, detail, r, 14, closed);
  }, [points, r, closed, detail]);
  return <mesh geometry={geometry} material={material} castShadow={!material.transparent} receiveShadow />;
}

// A soft-edged slab.
export function Slab({
  position,
  size,
  radius = 0.008,
  material,
  rotation,
}: {
  position: Vec3;
  size: Vec3;
  radius?: number;
  material: THREE.Material;
  rotation?: Vec3;
}) {
  return (
    <RoundedBox args={size} radius={radius} smoothness={4} position={position} rotation={rotation} material={material} castShadow={!material.transparent} receiveShadow />
  );
}

// An extruded flat shape (frames, oval backs, arches).
export function Extruded({
  shape,
  depth = 0.02,
  bevel = 0.004,
  position = [0, 0, 0],
  rotation,
  material,
}: {
  shape: THREE.Shape;
  depth?: number;
  bevel?: number;
  position?: Vec3;
  rotation?: Vec3;
  material: THREE.Material;
}) {
  const geometry = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 48,
    });
    g.translate(0, 0, -depth / 2);
    return g;
  }, [shape, depth, bevel]);
  return <mesh geometry={geometry} position={position} rotation={rotation} material={material} castShadow={!material.transparent} receiveShadow />;
}

export function ellipseShape(rx: number, ry: number, hole?: [number, number]) {
  const s = new THREE.Shape();
  s.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0);
  if (hole) {
    const h = new THREE.Path();
    h.absellipse(0, 0, hole[0], hole[1], 0, Math.PI * 2, true, 0);
    s.holes.push(h);
  }
  return s;
}

export function archShape(halfWidth: number, straight: number, hole?: { inset: number }) {
  const build = (hw: number, st: number, bottom: number) => {
    const s = new THREE.Shape();
    s.moveTo(-hw, bottom);
    s.lineTo(-hw, st);
    s.absarc(0, st, hw, Math.PI, 0, true);
    s.lineTo(hw, bottom);
    s.lineTo(-hw, bottom);
    return s;
  };
  const shape = build(halfWidth, straight, 0);
  if (hole) {
    const i = hole.inset;
    const p = new THREE.Path();
    p.moveTo(-halfWidth + i, i);
    p.lineTo(halfWidth - i, i);
    p.lineTo(halfWidth - i, straight);
    p.absarc(0, straight, halfWidth - i, 0, Math.PI, false);
    p.lineTo(-halfWidth + i, i);
    shape.holes.push(p);
  }
  return shape;
}
