import { Easing } from "remotion";

// Pastel Mughal-garden palette taken from the reference invite.
export const C = {
  cream: "#f8f1e4",
  stripe: "#f1e5d2",
  paper: "#efe3c8",
  sage: "#a9cfb2",
  sageLight: "#c8e3cd",
  sageDark: "#7eae8c",
  pink: "#ec9bbb",
  pinkLight: "#f9d3e1",
  pinkDeep: "#d4568c",
  magenta: "#b13379",
  dustyPink: "#cf8aa2",
  rose: "#e77a9f",
  leaf: "#5f8f4a",
  leafDark: "#3f6b34",
  leafLight: "#9cc66b",
  grass: "#c6e79a",
  gold: "#b0843f",
  goldLight: "#d9b56a",
  textGold: "#9c6f35",
  textGreen: "#5d8a3a",
  wood: "#8a5a3c",
  sky: "#eef3f1",
};

export const ease = Easing.bezier(0.25, 0.8, 0.25, 1);
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
