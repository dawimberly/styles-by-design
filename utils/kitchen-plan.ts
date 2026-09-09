export const CELL_INCHES = 6;
/** Graph-paper squares per full (bold) foot square: 2 × 6" = 1'. */
export const CELLS_PER_FOOT = 2;
/** Board ~16' × 14' — sized to fit a laptop screen without huge scrolling. */
export const PLAN_COLS = 32;
export const PLAN_ROWS = 28;
export const PLAN_CELL_PX = 18;

export const PLAN_STEPS = [
  {
    id: 1,
    title: "Walls",
    blurb: "One typed line per wall — any inch length, then rotate and drag.",
  },
  {
    id: 2,
    title: "Utilities",
    blurb: "Doors, windows, outlets, and plumbing.",
  },
  {
    id: 3,
    title: "Appliances & cabinets",
    blurb: "Sink, DW, fridge, range, and cabinet runs.",
  },
  {
    id: 4,
    title: "Package & send",
    blurb: "Email the design with the cabinet purchase for San Antonio shipping.",
  },
] as const;

export type PlanStepId = (typeof PLAN_STEPS)[number]["id"];

export type PlanLabelCategory = "utility" | "appliance";

export const FOOTPRINT_COLORS = [
  { id: "brass", name: "Brass", value: "#c9a66b" },
  { id: "slate", name: "Slate", value: "#6b7c8a" },
  { id: "sage", name: "Sage", value: "#8a9a7b" },
  { id: "clay", name: "Clay", value: "#a67c5d" },
  { id: "sky", name: "Sky", value: "#7aa2b5" },
  { id: "sand", name: "Sand", value: "#d4c4a8" },
  { id: "ink", name: "Ink", value: "#1f2a24" },
  { id: "blush", name: "Blush", value: "#c4a090" },
] as const;

export const PLAN_LABELS = [
  { id: "window", name: "Window", color: "#9ec5e8", cols: 6, rows: 1, category: "utility" as const },
  { id: "door", name: "Door", color: "#d4a574", cols: 6, rows: 1, category: "utility" as const },
  { id: "outlet", name: "Electrical outlet", color: "#e2c15a", cols: 1, rows: 1, category: "utility" as const },
  { id: "plumbing", name: "Plumbing / water", color: "#5b8fa8", cols: 1, rows: 1, category: "utility" as const },
  { id: "note", name: "Note", color: "#d9cfc0", cols: 2, rows: 2, category: "utility" as const },
  { id: "counter", name: "Counter", color: "#c4b59a", cols: 6, rows: 4, category: "appliance" as const },
  { id: "sink", name: "Sink", color: "#7aa2b5", cols: 6, rows: 4, category: "appliance" as const },
  { id: "dishwasher", name: "Dishwasher (DW)", color: "#8a9a7b", cols: 4, rows: 4, category: "appliance" as const },
  { id: "fridge", name: "Fridge", color: "#6b7c8a", cols: 6, rows: 5, category: "appliance" as const },
  { id: "range", name: "Range / cooktop", color: "#a67c5d", cols: 5, rows: 4, category: "appliance" as const },
  { id: "wall-cab", name: "Wall cabinets", color: "#b8a38a", cols: 6, rows: 2, category: "appliance" as const },
  { id: "base-cab", name: "Base cabinets", color: "#9c8b74", cols: 6, rows: 4, category: "appliance" as const },
] as const;

export type PlanLabelId = (typeof PLAN_LABELS)[number]["id"];

export type PlanPoint = { x: number; y: number };

/** Closed or in-progress room / zone polygon in cell-corner coordinates. */
export type PlanFootprint = {
  id: string;
  points: PlanPoint[];
  closed: boolean;
  color: string;
};

export type PlanItem = {
  id: string;
  labelId: PlanLabelId;
  /** Top-left before rotation, in inches from board origin. */
  xInches: number;
  yInches: number;
  widthInches: number;
  depthInches: number;
  /** Rotation in degrees (0 = width along X). */
  rotationDeg: number;
  note?: string;
  /** Northville / appliance SKU when known (B24, W2430, SB36). */
  sku?: string;
  /** Wall line this box is snapped to. */
  wallId?: string;
};

/** Dimensioned wall / run — inch precision, not locked to the 6" grid. */
export type PlanLine = {
  id: string;
  xInches: number;
  yInches: number;
  lengthInches: number;
  angleDeg: number;
  color: string;
  label?: string;
};

export type PlanBox = {
  id: string;
  labelId: PlanLabelId;
  w: number;
  d: number;
  h: number;
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
};

export function labelMeta(id: PlanLabelId) {
  return PLAN_LABELS.find((l) => l.id === id) || PLAN_LABELS[0];
}

export function labelsForCategory(category: PlanLabelCategory) {
  return PLAN_LABELS.filter((l) => l.category === category);
}

export function labelOptionText(id: PlanLabelId) {
  const meta = labelMeta(id);
  return `${meta.name} · ${inchesToFeetInches(cellsToInches(meta.cols))} × ${inchesToFeetInches(cellsToInches(meta.rows))}`;
}

export function applyLabelDefaults(id: PlanLabelId) {
  const meta = labelMeta(id);
  return {
    cols: meta.cols,
    rows: meta.rows,
    widthInches: cellsToInches(meta.cols),
    depthInches: cellsToInches(meta.rows),
  };
}

export const BOARD_WIDTH_IN = PLAN_COLS * CELL_INCHES;
export const BOARD_HEIGHT_IN = PLAN_ROWS * CELL_INCHES;
/** Pixels per inch on the plan board. */
export const INCH_PX = PLAN_CELL_PX / CELL_INCHES;

export function lineEndpoints(line: PlanLine) {
  const rad = (line.angleDeg * Math.PI) / 180;
  return {
    x1: line.xInches,
    y1: line.yInches,
    x2: line.xInches + Math.cos(rad) * line.lengthInches,
    y2: line.yInches + Math.sin(rad) * line.lengthInches,
  };
}

export function lineSummary(line: PlanLine) {
  const ends = lineEndpoints(line);
  const name = line.label?.trim() || "Line";
  return `${name}: ${inchesToFeetInches(line.lengthInches)} @ ${Math.round(line.angleDeg)}° from (${ends.x1.toFixed(1)}", ${ends.y1.toFixed(1)}") → (${ends.x2.toFixed(1)}", ${ends.y2.toFixed(1)}")`;
}

export function itemSummary(item: PlanItem) {
  const sku = item.sku ? `${item.sku} · ` : "";
  return `${sku}${labelMeta(item.labelId).name}: ${inchesToFeetInches(item.widthInches)} × ${inchesToFeetInches(item.depthInches)} @ (${item.xInches.toFixed(1)}", ${item.yInches.toFixed(1)}") rot ${Math.round(item.rotationDeg)}°`;
}

export function inchesToFeetInches(inches: number) {
  const ft = Math.floor(inches / 12);
  const inch = inches % 12;
  if (ft === 0) return `${inch}"`;
  if (inch === 0) return `${ft}'`;
  return `${ft}'-${inch}"`;
}

export function cellsToInches(cells: number) {
  return cells * CELL_INCHES;
}

export function cellsToFeet(cells: number) {
  return cells / CELLS_PER_FOOT;
}

export function scaleLegend() {
  return `Each square = ${CELL_INCHES}" · Bold square = 1' (${CELLS_PER_FOOT}×${CELL_INCHES}")`;
}

export function clampPoint(point: PlanPoint): PlanPoint {
  return {
    x: Math.max(0, Math.min(PLAN_COLS, Math.round(point.x))),
    y: Math.max(0, Math.min(PLAN_ROWS, Math.round(point.y))),
  };
}

export function pointsEqual(a: PlanPoint, b: PlanPoint, tol = 0.51) {
  return Math.abs(a.x - b.x) <= tol && Math.abs(a.y - b.y) <= tol;
}

export function distPoints(a: PlanPoint, b: PlanPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function pointInPolygon(point: PlanPoint, polygon: PlanPoint[]) {
  if (polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const hit = yi > point.y !== yj > point.y && point.x < ((xj - xi) * (point.y - yi)) / (yj - yi || 1e-9) + xi;
    if (hit) inside = !inside;
  }
  return inside;
}

function cross(o: PlanPoint, a: PlanPoint, b: PlanPoint) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

export function convexHull(points: PlanPoint[]): PlanPoint[] {
  const unique = new Map<string, PlanPoint>();
  for (const p of points) {
    const c = clampPoint(p);
    unique.set(`${c.x},${c.y}`, c);
  }
  const sorted = [...unique.values()].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
  if (sorted.length <= 2) return sorted;
  const lower: PlanPoint[] = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: PlanPoint[] = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return [...lower, ...upper];
}

export function combineFootprintsByColor(footprints: PlanFootprint[], color: string): PlanFootprint[] {
  const same = footprints.filter((f) => f.color === color && f.closed && f.points.length >= 3);
  const others = footprints.filter((f) => !(f.color === color && f.closed && f.points.length >= 3));
  if (same.length <= 1) return footprints;
  const hull = convexHull(same.flatMap((f) => f.points));
  if (hull.length < 3) return footprints;
  return [...others, { id: crypto.randomUUID(), points: hull, closed: true, color }];
}

export function rectangleFromPoints(points: PlanPoint[]): PlanPoint[] | null {
  if (points.length < 2) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  if (maxX - minX < 0.5 || maxY - minY < 0.5) return null;
  return [
    { x: minX, y: minY },
    { x: maxX, y: minY },
    { x: maxX, y: maxY },
    { x: minX, y: maxY },
  ];
}

export function footprintLooksRectangular(fp: PlanFootprint, angleTolDeg = 18) {
  if (!fp.closed || fp.points.length < 4) return false;
  const hull = convexHull(fp.points);
  if (hull.length < 4 || hull.length > 6) return false;
  const tol = Math.cos(((90 - angleTolDeg) * Math.PI) / 180);
  let axisAligned = 0;
  for (let i = 0; i < hull.length; i++) {
    const a = hull[i];
    const b = hull[(i + 1) % hull.length];
    const dx = Math.abs(b.x - a.x);
    const dy = Math.abs(b.y - a.y);
    const len = Math.hypot(dx, dy) || 1;
    if (dx / len > tol || dy / len > tol) axisAligned++;
  }
  return axisAligned >= hull.length - 1;
}

export function snapFootprintToRectangle(fp: PlanFootprint): PlanFootprint | null {
  const rect = rectangleFromPoints(fp.points);
  if (!rect) return null;
  return { ...fp, points: rect, closed: true };
}

export function footprintFromWallLines(lines: PlanLine[], color = FOOTPRINT_COLORS[0].value): PlanFootprint | null {
  if (!lines.length) return null;
  const pts: PlanPoint[] = [];
  for (const line of lines) {
    const ends = lineEndpoints(line);
    pts.push(
      { x: ends.x1 / CELL_INCHES, y: ends.y1 / CELL_INCHES },
      { x: ends.x2 / CELL_INCHES, y: ends.y2 / CELL_INCHES },
    );
  }
  const rect = rectangleFromPoints(pts);
  if (!rect) return null;
  return {
    id: crypto.randomUUID(),
    points: rect.map((p) => ({ x: Math.round(p.x), y: Math.round(p.y) })),
    closed: true,
    color,
  };
}

export function footprintPerimeterInches(fp: PlanFootprint) {
  if (fp.points.length < 2) return 0;
  let cells = 0;
  const n = fp.points.length;
  const limit = fp.closed ? n : n - 1;
  for (let i = 0; i < limit; i++) {
    const a = fp.points[i];
    const b = fp.points[(i + 1) % n];
    cells += distPoints(a, b);
  }
  return cellsToInches(cells);
}

export function footprintSummary(fp: PlanFootprint) {
  const colorName = FOOTPRINT_COLORS.find((c) => c.value === fp.color)?.name || fp.color;
  const pts = fp.points.map((p) => `(${p.x * CELL_INCHES}",${p.y * CELL_INCHES}")`).join(" → ");
  return `${colorName} footprint · ${fp.closed ? "closed" : "open"} · ${fp.points.length} pts · peri ~${inchesToFeetInches(Math.round(footprintPerimeterInches(fp)))}: ${pts}`;
}

export function distToLineInches(px: number, py: number, line: PlanLine) {
  const { x1, y1, x2, y2 } = lineEndpoints(line);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-6) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

export function clampInches(x: number, y: number) {
  return {
    x: Math.max(0, Math.min(BOARD_WIDTH_IN, x)),
    y: Math.max(0, Math.min(BOARD_HEIGHT_IN, y)),
  };
}
