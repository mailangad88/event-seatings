import * as THREE from "three";

// Procedural grayscale textures, tinted by each material's color.
// Everything is generated in code so there are no image files to load.

function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, repeat: [number, number] = [1, 1]) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext("2d")!);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(...repeat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// Seeded pseudo-random so the grain looks the same every render.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

export function woodGrain() {
  return canvasTexture(256, 1024, (ctx) => {
    const r = rng(7);
    ctx.fillStyle = "#f1f1f1";
    ctx.fillRect(0, 0, 256, 1024);
    // broad soft bands
    for (let i = 0; i < 14; i++) {
      const x = r() * 256;
      const g = ctx.createLinearGradient(x - 24, 0, x + 24, 0);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(0.5, `rgba(60,40,20,${0.03 + r() * 0.05})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - 24, 0, 48, 1024);
    }
    // fine grain lines
    for (let i = 0; i < 260; i++) {
      ctx.strokeStyle = `rgba(40,25,10,${0.03 + r() * 0.07})`;
      ctx.lineWidth = 0.4 + r() * 1.0;
      const x = r() * 256;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.bezierCurveTo(x + (r() - 0.5) * 8, 340, x + (r() - 0.5) * 8, 680, x + (r() - 0.5) * 6, 1024);
      ctx.stroke();
    }
  });
}

// Woven cane / rattan: an open diamond lattice.
export function caneWeave(repeat: [number, number] = [4, 4]) {
  return canvasTexture(
    128,
    128,
    (ctx) => {
      ctx.fillStyle = "#cfcfcf";
      ctx.fillRect(0, 0, 128, 128);
      ctx.lineCap = "round";
      for (let i = -128; i <= 256; i += 16) {
        ctx.strokeStyle = "rgba(255,255,255,0.7)";
        ctx.lineWidth = 3.4;
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 128, 128);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i + 128, 0);
        ctx.lineTo(i, 128);
        ctx.stroke();
      }
      for (let i = -128; i <= 256; i += 16) {
        ctx.strokeStyle = "rgba(70,50,30,0.55)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(i + 2, 0);
        ctx.lineTo(i + 130, 128);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(i + 130, 0);
        ctx.lineTo(i + 2, 128);
        ctx.stroke();
      }
    },
    repeat,
  );
}

// Tight over-under weave for rattan seats and wishbone cord.
export function cordWeave(repeat: [number, number] = [3, 3]) {
  return canvasTexture(
    128,
    128,
    (ctx) => {
      ctx.fillStyle = "#e4e4e4";
      ctx.fillRect(0, 0, 128, 128);
      for (let row = 0; row < 16; row++) {
        for (let col = 0; col < 16; col++) {
          const over = (row + col) % 2 === 0;
          ctx.fillStyle = over ? "rgba(255,255,255,0.8)" : "rgba(80,60,40,0.35)";
          if (over) ctx.fillRect(col * 8 + 0.5, row * 8 + 1, 7, 6);
          else ctx.fillRect(col * 8 + 1, row * 8 + 0.5, 6, 7);
        }
      }
    },
    repeat,
  );
}
