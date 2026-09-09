import {
  BOARD_HEIGHT_IN,
  BOARD_WIDTH_IN,
  FOOTPRINT_COLORS,
  type PlanFootprint,
  type PlanLine,
} from "./kitchen-plan";

export const LAYOUT_SHAPES = [
  { id: "single", name: "Single wall", blurb: "One wall." },
  { id: "galley", name: "Galley", blurb: "Two parallel walls." },
  { id: "ell", name: "L-shaped", blurb: "Two walls at a corner." },
  { id: "u", name: "U-shaped", blurb: "Three walls." },
] as const;

export type LayoutShapeId = (typeof LAYOUT_SHAPES)[number]["id"];

export type LayoutInput = {
  shape: LayoutShapeId;
  aInches: number;
  bInches: number;
  /** U-shape right arm; defaults to bInches when omitted. */
  cInches?: number;
};

const PAD = 24;
const COLOR = FOOTPRINT_COLORS[0].value;

function wall(label: string, x: number, y: number, length: number, angle: number): PlanLine {
  return {
    id: crypto.randomUUID(),
    xInches: x,
    yInches: y,
    lengthInches: Math.max(12, length),
    angleDeg: angle,
    color: COLOR,
    label,
  };
}

export function buildLayout(input: LayoutInput): { lines: PlanLine[]; footprint: PlanFootprint | null } {
  const a = Math.min(Math.max(24, input.aInches), BOARD_WIDTH_IN - PAD * 2);
  const b = Math.min(Math.max(24, input.bInches), BOARD_HEIGHT_IN - PAD * 2);
  const c = Math.min(Math.max(24, input.cInches ?? input.bInches), BOARD_HEIGHT_IN - PAD * 2);
  const x = PAD;
  const y = PAD;
  let lines: PlanLine[] = [];

  if (input.shape === "single") {
    lines = [wall("Wall", x, y + 72, a, 0)];
  } else if (input.shape === "galley") {
    lines = [wall("North", x, y, a, 0), wall("South", x, y + b, a, 0)];
  } else if (input.shape === "ell") {
    // L: short wall up (b), long wall right (a), meeting at lower-left.
    lines = [wall("Short", x, y, b, 90), wall("Long", x, y + b, a, 0)];
  } else {
    // U: left arm (b), back/south (a), right arm (c). Opens upward.
    lines = [wall("Left", x, y, b, 90), wall("Back", x, y + b, a, 0), wall("Right", x + a, y + (b - c), c, 90)];
  }

  return { lines, footprint: null };
}

/** Freestanding peninsula / island rectangle (not a room-shape template). */
export function buildIsland(widthInches = 72, depthInches = 36, label = "Peninsula"): PlanFootprint {
  const w = Math.min(Math.max(24, widthInches), BOARD_WIDTH_IN - PAD * 2) / 6;
  const d = Math.min(Math.max(18, depthInches), BOARD_HEIGHT_IN - PAD * 2) / 6;
  const x = (BOARD_WIDTH_IN / 6 - w) / 2;
  const y = (BOARD_HEIGHT_IN / 6 - d) / 2;
  return {
    id: crypto.randomUUID(),
    points: [
      { x, y },
      { x: x + w, y },
      { x: x + w, y: y + d },
      { x, y: y + d },
    ],
    closed: true,
    color: FOOTPRINT_COLORS[1]?.value || COLOR,
    label,
  };
}
