import { AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame } from "remotion";
import { display } from "../fonts";
import { Blossom, FlowerVine, Lotus, Palm, Rose, RoseStem } from "./art/Botanicals";
import { C, clamp, ease } from "./palette";

export type CollageProps = {
  readonly monogram: string;
};

// Cream paper panel with a printed floral border, like a page from a Mughal album.
function AlbumPanel({ x, y, w, h, band = 34, children }: { x: number; y: number; w: number; h: number; band?: number; children?: React.ReactNode }) {
  const dots = [];
  const step = 26;
  for (let i = 0; i * step < w; i++) {
    dots.push([x + i * step + 13, y + band / 2], [x + i * step + 13, y + h - band / 2]);
  }
  for (let i = 1; i * step < h - band; i++) {
    dots.push([x + band / 2, y + i * step + 13], [x + w - band / 2, y + i * step + 13]);
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#f6e9cf" />
      <rect x={x} y={y} width={w} height={h} fill="none" stroke="#e9cf9a" strokeWidth={band * 2} opacity={0.9} />
      {dots.map(([dx, dy], i) => (
        <circle key={i} cx={dx} cy={dy} r={4.5} fill={i % 3 === 0 ? "#d97a8f" : i % 3 === 1 ? "#7fa36a" : "#e2a23d"} />
      ))}
      <rect x={x + band} y={y + band} width={w - band * 2} height={h - band * 2} fill="#fbf2df" stroke="#c97a8a" strokeWidth={3} />
      <rect x={x + band + 12} y={y + band + 12} width={w - band * 2 - 24} height={h - band * 2 - 24} fill="none" stroke="#d8b46a" strokeWidth={2} />
      {children}
    </g>
  );
}

// Cusped (scalloped) mehrab arch outline.
function mehrab(x: number, y: number, w: number, h: number) {
  const cx = x + w / 2;
  return `M${x} ${y + h} L${x} ${y + w * 0.42} Q${x} ${y + w * 0.3} ${x + w * 0.12} ${y + w * 0.3} Q${x + w * 0.12} ${y + w * 0.16} ${x + w * 0.26} ${y + w * 0.16} Q${x + w * 0.3} ${y + w * 0.04} ${x + w * 0.4} ${y + w * 0.06} Q${cx} ${y + w * 0.04} ${cx} ${y} Q${cx} ${y + w * 0.04} ${x + w * 0.6} ${y + w * 0.06} Q${x + w * 0.7} ${y + w * 0.04} ${x + w * 0.74} ${y + w * 0.16} Q${x + w * 0.88} ${y + w * 0.16} ${x + w * 0.88} ${y + w * 0.3} Q${x + w} ${y + w * 0.3} ${x + w} ${y + w * 0.42} L${x + w} ${y + h} Z`;
}

// Window inside the jharokha frame, in canvas coordinates; the couple's photo is clipped to it.
const WIN = { x: 380, y: 1390, w: 320, h: 560 };

function Bird({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={22} ry={11} fill="#3fa0a0" />
      <circle cx={20} cy={-6} r={8} fill="#3fa0a0" />
      <path d="M27 -6 l9 2 l-9 3 Z" fill="#e2a23d" />
      <path d="M-4 -4 Q-16 -30 -30 -24 Q-16 -10 -4 -4 Z" fill="#e57fa3" />
      <path d="M-20 2 L-46 12 L-40 0 Z" fill="#2f7a7a" />
    </g>
  );
}

function Drift({ i, children }: { i: number; children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [i * 3, i * 3 + 28], [0, 1], { ...clamp, easing: ease });
  const dx = (random(`dx${i}`) - 0.5) * 80;
  const dy = (random(`dy${i}`) - 0.5) * 80;
  return <g transform={`translate(${dx * (1 - t)} ${dy * (1 - t)})`} opacity={t}>{children}</g>;
}

// Opening collage of painted panels; a paper tag in the middle reveals the couple's gold monogram.
export function CollageScene({ monogram }: CollageProps) {
  const frame = useCurrentFrame();
  const zoom = interpolate(frame, [0, 240], [1.1, 1], clamp);
  const ink = interpolate(frame, [40, 85], [0, 1], { ...clamp, easing: ease });
  const pop = interpolate(frame, [80, 100], [0, 1], { ...clamp, easing: ease });
  const photo = interpolate(frame, [20, 50], [0, 1], clamp);
  const [a, b] = monogram.split("");

  return (
    <AbsoluteFill style={{ background: "#e9cfd6", transform: `scale(${zoom})` }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="goldInk" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e9c779" />
            <stop offset="0.5" stopColor="#b0843f" />
            <stop offset="1" stopColor="#d9b56a" />
          </linearGradient>
          <filter id="paperShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx={0} dy={6} stdDeviation={8} floodColor="#6b3b4a" floodOpacity={0.3} />
          </filter>
          <clipPath id="tagInk">
            <rect x={330} y={760} width={420 * ink} height={400} />
          </clipPath>
        </defs>

        <Drift i={0}>
          <AlbumPanel x={20} y={-20} w={520} h={680}>
            <RoseStem x={250} y={300} scale={0.95} />
          </AlbumPanel>
        </Drift>

        <Drift i={1}>
          <g filter="url(#paperShadow)">
            <rect x={330} y={-10} width={470} height={640} fill="#cfd0b6" />
            <path d="M380 640 Q420 420 520 380" stroke="#7d8f5a" strokeWidth={5} fill="none" />
            <ellipse cx={420} cy={560} rx={90} ry={34} fill="#9fb08a" opacity={0.8} transform="rotate(-20 420 560)" />
            <Lotus x={560} y={250} s={1.4} rot={-10} />
            <Lotus x={480} y={520} s={0.9} rot={15} />
            <Lotus x={720} y={560} s={0.6} rot={-25} />
          </g>
        </Drift>

        <Drift i={2}>
          <g filter="url(#paperShadow)">
            <rect x={790} y={-10} width={300} height={400} fill="#efb6c9" />
            {Array.from({ length: 30 }, (_, i) => (
              <Blossom key={i} x={810 + (i % 5) * 60} y={20 + Math.floor(i / 5) * 62 + (i % 2) * 20} r={9} fill={i % 2 ? "#fff3f6" : "#d9708f"} />
            ))}
            <Bird x={900} y={210} s={1.3} />
          </g>
        </Drift>

        <Drift i={3}>
          <g filter="url(#paperShadow)">
            <rect x={810} y={390} width={280} height={300} fill="#c9707f" />
            <path d={mehrab(850, 420, 200, 250)} fill="#f8e8e4" />
            <Rose x={950} y={560} r={42} />
          </g>
        </Drift>

        <Drift i={4}>
          <g filter="url(#paperShadow)">
            <path d={mehrab(-10, 600, 500, 960)} fill={C.dustyPink} />
            <path d={mehrab(20, 640, 440, 920)} fill="none" stroke="#b56a86" strokeWidth={3} />
            <FlowerVine x={230} y={760} h={760} seed="mehrabVine" />
          </g>
        </Drift>

        <Drift i={5}>
          <g filter="url(#paperShadow)">
            <AlbumPanel x={440} y={660} w={640} h={760} band={30}>
              <RoseStem x={860} y={1030} scale={0.85} />
            </AlbumPanel>
          </g>
        </Drift>

        <Drift i={6}>
          <g filter="url(#paperShadow)">
            <path d={mehrab(-20, 1380, 360, 560)} fill="#fbe9e1" />
            <path d="M80 1800 Q60 1720 110 1700 L210 1700 Q260 1720 240 1800 Q230 1850 160 1860 Q90 1850 80 1800 Z" fill="#f4f0f6" stroke="#8a7aa8" strokeWidth={3} />
            <path d="M120 1740 q40 30 80 0 M110 1790 q50 30 100 0" stroke="#8a7aa8" strokeWidth={2} fill="none" />
            {Array.from({ length: 10 }, (_, i) => (
              <path key={`s${i}`} d={`M160 1700 Q${120 + i * 9} 1640 ${70 + i * 20} ${1560 + (i % 3) * 30}`} stroke={C.leaf} strokeWidth={3} fill="none" />
            ))}
            {Array.from({ length: 18 }, (_, i) => (
              <Blossom
                key={i}
                x={160 + (random(`vase-x${i}`) - 0.5) * 190}
                y={1610 + (random(`vase-y${i}`) - 0.5) * 120}
                r={14 + random(`vase-r${i}`) * 8}
                fill={["#d9342b", "#f08a3a", "#c53b6f", "#2f4f9a", "#f7c1d6"][i % 5]}
              />
            ))}
          </g>
        </Drift>

        <Drift i={7}>
          <g filter="url(#paperShadow)">
            <rect x={770} y={1470} width={330} height={470} fill="#e7a3a8" />
            <path d="M820 1940 L820 1620 Q820 1540 930 1540 Q1040 1540 1040 1620 L1040 1940 Z" fill={C.wood} />
            <path d="M840 1940 L840 1630 Q840 1565 930 1565 Q1020 1565 1020 1630 L1020 1940 Z" fill="#b07a55" />
            {[1640, 1730, 1820].map((yy) =>
              [850, 935].map((xx) => <rect key={`${xx}${yy}`} x={xx} y={yy} width={75} height={75} rx={6} fill="#c99470" stroke="#8a5a3c" strokeWidth={3} />),
            )}
            <line x1={930} y1={1565} x2={930} y2={1940} stroke="#6d452c" strokeWidth={4} />
          </g>
        </Drift>

        <Drift i={8}>
          <g filter="url(#paperShadow)">
            <rect x={300} y={1260} width={480} height={700} fill="#d77a9b" />
            {Array.from({ length: 24 }, (_, i) => (
              <g key={i}>
                <circle cx={318} cy={1290 + i * 28} r={6} fill="#f2b8cb" />
                <circle cx={762} cy={1290 + i * 28} r={6} fill="#f2b8cb" />
              </g>
            ))}
            {Array.from({ length: 16 }, (_, i) => (
              <circle key={i} cx={330 + i * 28} cy={1280} r={6} fill="#f2b8cb" />
            ))}
            <rect x={340} y={1300} width={400} height={680} fill="#8a4a3c" />
            <path d={mehrab(WIN.x - 8, WIN.y - 8, WIN.w + 16, WIN.h + 40)} fill="#f2e6dc" />
          </g>
        </Drift>
      </svg>

      <Img
        src={staticFile("wedding/couple-walk-bw.jpg")}
        style={{
          position: "absolute",
          left: WIN.x,
          top: WIN.y,
          width: WIN.w,
          height: WIN.h,
          objectFit: "cover",
          objectPosition: "50% 30%",
          opacity: photo,
          clipPath: `path("${mehrab(0, 0, WIN.w, WIN.h + 40)}")`,
        }}
      />

      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        <Drift i={9}>
          <g filter="url(#paperShadow)">
            <path
              d="M330 770 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t20 0 L752 1150 q-20 8 -40 0 t-40 0 t-40 0 t-40 0 t-40 0 t-40 0 t-40 0 t-40 0 t-40 0 t-40 0 t-22 0 Z"
              fill={C.paper}
            />
            {Array.from({ length: 22 }, (_, i) => (
              <line key={i} x1={345} y1={790 + i * 16} x2={735} y2={790 + i * 16} stroke="#d9c9a4" strokeWidth={1} opacity={0.6} />
            ))}
          </g>
          <g clipPath="url(#tagInk)">
            <text x={470} y={1080} textAnchor="middle" fontFamily={display} fontSize={290} fill="url(#goldInk)">
              {a}
            </text>
            <text x={600} y={1060} textAnchor="middle" fontFamily={display} fontSize={250} fill="url(#goldInk)">
              {b}
            </text>
          </g>
          <g opacity={pop} transform={`translate(392 1010) scale(${0.3 * (0.4 + pop * 0.6)})`}>
            <Palm x={0} y={0} h={520} lean={-20} sway={0} seed="tagPalm" />
          </g>
          <g opacity={pop}>
            <Bird x={680} y={830} s={0.9} />
            <Blossom x={720} y={860} r={12} fill={C.rose} />
          </g>
        </Drift>
      </svg>
    </AbsoluteFill>
  );
}
