// Line icons, 24px grid, 1.5 stroke. Decorative by default (aria-hidden);
// pass `title` to make one meaningful to screen readers.
const paths = {
  chair: "M7 3h10v8H7zM6 11h12v2H6zM7 13v8M17 13v8M7 17h10",
  table: "M3 8h18v2H3zM5 10v10M19 10v10M8 10l-2 6M16 10l2 6",
  linen: "M4 5h16v4l-2 11H6L4 9zM4 9h16M9 9v11M15 9v11",
  plate: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z",
  glass: "M7 3h10l-1 7a4 4 0 0 1-8 0zM12 14v7M8 21h8",
  flatware: "M7 3v7a2 2 0 0 0 4 0V3M9 3v18M16 3c-2 0-3 3-3 6s1 4 3 4v8",
  tent: "M12 3 2 20h20zM12 3v17M8 20l4-8 4 8",
  light: "M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z",
  sofa: "M4 10V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M2 12a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v6H2zM5 18v2M19 18v2",
  arch: "M4 21V10a8 8 0 0 1 16 0v11M8 21V10a4 4 0 0 1 8 0v11",
  floor: "M3 15l9-5 9 5-9 5zM3 15v2l9 5 9-5v-2M12 20v2",
  candle: "M10 9h4v12h-4zM12 3c1.5 2 1.5 3.5 0 5-1.5-1.5-1.5-3 0-5zM7 21h10",
  chafer: "M3 13h18M5 13a7 7 0 0 1 14 0M12 4v2M6 13v4h12v-4M8 17l-1 3M16 17l1 3",
  heat: "M12 21V9M8 21h8M8 5h8l-1 4H9zM10 2c0 1 1 1 1 2M14 2c0 1-1 1-1 2",
  games: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3.5 9.5c3 1 6 1 8.5-1s5.5-2.5 8.5-1M3.5 14.5c3-1 6-1 8.5 1s5.5 2.5 8.5 1",
  truck: "M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-.1M17 19a2 2 0 1 0 0-.1",
  check: "M5 12l5 5L20 7",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
  phone: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z",
  calendar: "M4 6h16v15H4zM4 10h16M8 3v4M16 3v4",
  quote: "M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
  pin: "M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12zM12 6a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4",
  users: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3",
  arrow: "M5 12h14M13 6l6 6-6 6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  chat: "M4 5h16v11H8l-4 4z",
  heart: "M12 20s-7-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.5-9 9-9 9z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4",
  menu: "M3 7h18M3 12h18M3 17h18",
  close: "M6 6l12 12M18 6L6 18",
  ruler: "M3 17 17 3l4 4L7 21zM7 13l2 2M10 10l2 2M13 7l2 2",
  home: "M3 11l9-7 9 7M5 9.5V20h14V9.5M10 20v-6h4v6",
  chart: "M4 20h16M7 16v-5M12 16V7M17 16v-8",
  wallet: "M3 7h18v12H3zM3 7l3-3h12l3 3M16 13h2",
  mail: "M3 6h18v12H3zM3 6l9 7 9-7",
  sliders: "M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1M15 4v4M9 10v4M17 16v4",
  inbox: "M3 13h5l2 3h4l2-3h5M5 5h14l2 8v6H3v-6z",
  block: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM5.6 5.6l12.8 12.8",
  download: "M12 4v11M7 10l5 5 5-5M5 20h14",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2",
  info: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v6M12 7.5v.5",
} as const;

export type IconName = keyof typeof paths;
export const iconNames = Object.keys(paths) as IconName[];

export function Icon({
  name,
  size = 20,
  className = "",
  strokeWidth = 1.5,
  title,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path d={paths[name]} />
    </svg>
  );
}
