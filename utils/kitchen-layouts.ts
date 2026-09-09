import {
  BOARD_HEIGHT_IN,
  BOARD_WIDTH_IN,
  FOOTPRINT_COLORS,
  type PlanFootprint,
  type PlanItem,
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

export function buildLShape(longInches: number, returnInches: number) {
  return buildLayout({ shape: "ell", aInches: longInches, bInches: returnInches });
}

export type MeasuredLInput = {
  /** Slot 2 — kitchen depth / long wall (default 124). */
  kitchenDepthIn: number;
  /** Slot 1 — peninsula length (default 71). */
  peninsulaLengthIn: number;
  /** Fixed peninsula box depth (default 24). */
  peninsulaDepthIn?: number;
  /** Slot 3 — living-end gap peninsula end → door wall (default 39). */
  livingEndGapIn: number;
  /** Slot 4 — optional L return / range-wall length. */
  rangeWallIn?: number;
  /** Slot 5 — optional aisle peninsula face → range wall. */
  aisleWidthIn?: number;
};

/**
 * L + peninsula from taped job photos. No cabinets — walls, peninsula fill, and a living-end door only.
 */
export function buildMeasuredLKitchen(input: MeasuredLInput): {
  lines: PlanLine[];
  footprints: PlanFootprint[];
  door: PlanItem;
} {
  const depth = Math.min(Math.max(24, input.kitchenDepthIn || 124), BOARD_WIDTH_IN - PAD * 2);
  const penLen = Math.min(Math.max(24, input.peninsulaLengthIn || 71), depth - 12);
  const penDep = Math.min(Math.max(18, input.peninsulaDepthIn ?? 24), 48);
  const gap = Math.max(12, input.livingEndGapIn || 39);
  const rangeWall = Math.min(
    Math.max(48, input.rangeWallIn || Math.max(96, penLen + 24)),
    BOARD_HEIGHT_IN - PAD * 2,
  );
  const aisle = Math.max(30, input.aisleWidthIn || 42);

  const x = PAD;
  const y = PAD;
  const long = wall("Long / depth", x, y + rangeWall, depth, 0);
  const range = wall("Range wall", x, y, rangeWall, 90);
  const livingLen = Math.max(48, Math.min(rangeWall, 72));
  const living = wall("Living end", x + depth, y + rangeWall - livingLen, livingLen, 90);

  // Peninsula: east end leaves `gap` to living wall; west face prefers aisle off range wall.
  let penX = x + depth - gap - penLen;
  if (input.aisleWidthIn != null) penX = x + aisle;
  penX = Math.max(x + 12, Math.min(penX, x + depth - gap - penLen));
  const penY = y + rangeWall - penDep;
  const penW = penLen / 6;
  const penH = penDep / 6;
  const penCellsX = penX / 6;
  const penCellsY = penY / 6;
  const peninsula: PlanFootprint = {
    id: crypto.randomUUID(),
    points: [
      { x: penCellsX, y: penCellsY },
      { x: penCellsX + penW, y: penCellsY },
      { x: penCellsX + penW, y: penCellsY + penH },
      { x: penCellsX, y: penCellsY + penH },
    ],
    closed: true,
    color: FOOTPRINT_COLORS[1]?.value || COLOR,
    label: "Peninsula",
  };

  const doorWidth = 36;
  const doorDepth = 6;
  const doorAlong = Math.max(0, (livingLen - doorWidth) / 2);
  const rad = (living.angleDeg * Math.PI) / 180;
  const door: PlanItem = {
    id: crypto.randomUUID(),
    labelId: "door",
    xInches: living.xInches + Math.cos(rad) * doorAlong,
    yInches: living.yInches + Math.sin(rad) * doorAlong,
    widthInches: doorWidth,
    depthInches: doorDepth,
    rotationDeg: living.angleDeg,
    wallId: living.id,
    note: "Living end",
  };

  return { lines: [range, long, living], footprints: [peninsula], door };
}
