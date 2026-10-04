import * as THREE from "three";
import { caneWeave, cordWeave, woodGrain } from "./textures";

const lighten = (hex: string, t: number) => new THREE.Color(hex).lerp(new THREE.Color("#ffffff"), t);
const darken = (hex: string, t: number) => new THREE.Color(hex).lerp(new THREE.Color("#000000"), t);

export function luminance(hex: string) {
  const c = new THREE.Color(hex);
  return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
}

// Every material a chair might need, tinted by the chosen finish.
export function createMats(color: string) {
  const grain = woodGrain();
  const caneMeters = caneWeave([24, 24]);
  const caneBox = caneWeave([3, 3]);
  const cordBox = cordWeave([11, 11]);

  const wood = new THREE.MeshPhysicalMaterial({ color, map: grain, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.4 });
  const woodSeat = new THREE.MeshPhysicalMaterial({
    color: lighten(color, 0.04),
    map: grain,
    roughness: 0.55,
    clearcoat: 0.25,
  });
  const paint = new THREE.MeshPhysicalMaterial({ color, roughness: 0.42, clearcoat: 0.6, clearcoatRoughness: 0.25 });

  const rattan = new THREE.MeshStandardMaterial({ color, map: cordBox, bumpMap: cordBox, bumpScale: 1.2, roughness: 0.78 });
  const rattanPole = new THREE.MeshStandardMaterial({ color: darken(color, 0.1), map: grain, roughness: 0.7 });
  const cane = new THREE.MeshStandardMaterial({
    color: lighten(color, 0.15),
    map: caneMeters,
    bumpMap: caneMeters,
    bumpScale: 1.5,
    roughness: 0.85,
    side: THREE.DoubleSide,
  });
  const caneSeat = new THREE.MeshStandardMaterial({ color: "#d9bf92", map: caneBox, bumpMap: caneBox, bumpScale: 1, roughness: 0.8 });
  const cord = new THREE.MeshStandardMaterial({ color: "#d8c29b", map: cordBox, bumpMap: cordBox, bumpScale: 1.4, roughness: 0.85 });

  const velvet = new THREE.MeshPhysicalMaterial({
    color: darken(color, 0.22),
    roughness: 0.95,
    sheen: 0.8,
    sheenRoughness: 0.45,
    sheenColor: lighten(color, 0.22),
  });
  const velvetDark = new THREE.MeshPhysicalMaterial({ color: darken(color, 0.35), roughness: 0.95, sheen: 0.6 });

  const linen = new THREE.MeshStandardMaterial({ color: "#efe8da", roughness: 0.95 });
  const fabricIvory = new THREE.MeshPhysicalMaterial({ color: "#f0e9dc", roughness: 0.9, sheen: 0.8, sheenRoughness: 0.5, sheenColor: new THREE.Color("#ffffff") });

  const gold = new THREE.MeshPhysicalMaterial({ color: "#d9b255", metalness: 1, roughness: 0.3, clearcoat: 0.3 });
  const metal = new THREE.MeshPhysicalMaterial({ color, metalness: 1, roughness: 0.3, clearcoat: 0.25 });
  const blackMetal = new THREE.MeshPhysicalMaterial({ color: "#1f1d1b", metalness: 0.7, roughness: 0.4 });

  // Glossy clear acrylic: mostly transparent with strong reflections, so edges and
  // curves catch the studio lights instead of washing out.
  const acrylic = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color).lerp(new THREE.Color("#e8eef0"), 0.5),
    metalness: 0.1,
    roughness: 0.03,
    transparent: true,
    opacity: 0.38,
    ior: 1.5,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    specularIntensity: 1,
    envMapIntensity: 3.2,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const shell = new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.3,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2,
    side: THREE.DoubleSide,
  });

  return {
    wood, woodSeat, paint, rattan, rattanPole, cane, caneSeat, cord,
    velvet, velvetDark, linen, fabricIvory, gold, metal, blackMetal, acrylic, shell,
  };
}

export type Mats = ReturnType<typeof createMats>;
