import {
  BOARD_HEIGHT_IN,
  BOARD_WIDTH_IN,
  CELLS_PER_FOOT,
  INCH_PX,
  PLAN_CELL_PX,
  PLAN_COLS,
  PLAN_ROWS,
  inchesToFeetInches,
  labelMeta,
  lineEndpoints,
  scaleLegend,
  type PlanFootprint,
  type PlanItem,
  type PlanLabelId,
  type PlanLine,
} from "./kitchen-plan";

/** Public Northville stock widths only — no prices. */
export type StockKind = "base" | "wall" | "tall" | "sink-base" | "corner" | "filler" | "appliance";

export type StockSku = {
  sku: string;
  kind: StockKind;
  width: number;
  depth: number;
  height?: number;
  labelId: PlanLabelId;
};

export const STOCK_WIDTHS = [9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42] as const;

export const STOCK_SKUS: StockSku[] = [
  ...([12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42] as const).map((w) => ({
    sku: `B${String(w).padStart(2, "0")}`,
    kind: "base" as const,
    width: w,
    depth: 24,
    height: 34.5,
    labelId: "base-cab" as PlanLabelId,
  })),
  { sku: "B06-FD", kind: "base", width: 6, depth: 24, height: 34.5, labelId: "base-cab" },
  { sku: "B09-FD", kind: "base", width: 9, depth: 24, height: 34.5, labelId: "base-cab" },
  ...([12, 15, 18, 21, 24, 27, 30, 33, 36] as const).map((w) => ({
    sku: `DB${w}-3`,
    kind: "base" as const,
    width: w,
    depth: 24,
    height: 34.5,
    labelId: "base-cab" as PlanLabelId,
  })),
  { sku: "SB30", kind: "sink-base", width: 30, depth: 24, height: 34.5, labelId: "sink" },
  { sku: "SB33", kind: "sink-base", width: 33, depth: 24, height: 34.5, labelId: "sink" },
  { sku: "SB36", kind: "sink-base", width: 36, depth: 24, height: 34.5, labelId: "sink" },
  { sku: "SB42", kind: "sink-base", width: 42, depth: 24, height: 34.5, labelId: "sink" },
  { sku: "FSB36", kind: "sink-base", width: 36, depth: 24, height: 34.5, labelId: "sink" },
  { sku: "LS33", kind: "corner", width: 33, depth: 33, height: 34.5, labelId: "base-cab" },
  { sku: "LS36", kind: "corner", width: 36, depth: 36, height: 34.5, labelId: "base-cab" },
  { sku: "BBC33", kind: "corner", width: 33, depth: 24, height: 34.5, labelId: "base-cab" },
  { sku: "BBC42", kind: "corner", width: 42, depth: 24, height: 34.5, labelId: "base-cab" },
  ...([9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39] as const).flatMap((w) =>
    ([30, 36, 42] as const).map((h) => ({
      sku: `W${String(w).padStart(2, "0")}${h}`,
      kind: "wall" as const,
      width: w,
      depth: 12,
      height: h,
      labelId: "wall-cab" as PlanLabelId,
    })),
  ),
  { sku: "W3012", kind: "wall", width: 30, depth: 12, height: 12, labelId: "wall-cab" },
  { sku: "W3612", kind: "wall", width: 36, depth: 12, height: 12, labelId: "wall-cab" },
  { sku: "WDC2430", kind: "wall", width: 24, depth: 12, height: 30, labelId: "wall-cab" },
  { sku: "WP1884", kind: "tall", width: 18, depth: 24, height: 84, labelId: "base-cab" },
  { sku: "WP2484", kind: "tall", width: 24, depth: 24, height: 84, labelId: "base-cab" },
  { sku: "WP3084", kind: "tall", width: 30, depth: 24, height: 84, labelId: "base-cab" },
  { sku: "OC3084", kind: "tall", width: 30, depth: 24, height: 84, labelId: "base-cab" },
  { sku: "OC3390", kind: "tall", width: 33, depth: 24, height: 90, labelId: "base-cab" },
  { sku: "DW24", kind: "appliance", width: 24, depth: 24, height: 34.5, labelId: "dishwasher" },
  { sku: "RG30", kind: "appliance", width: 30, depth: 24, height: 36, labelId: "range" },
  { sku: "RF36", kind: "appliance", width: 36, depth: 30, height: 70, labelId: "fridge" },
];

export function stockBySku(sku: string) {
  return STOCK_SKUS.find((s) => s.sku.toUpperCase() === sku.toUpperCase()) || null;
}

export function stocksForLabel(labelId: PlanLabelId) {
  if (labelId === "wall-cab") return STOCK_SKUS.filter((s) => s.kind === "wall");
  if (labelId === "base-cab") return STOCK_SKUS.filter((s) => s.kind === "base" || s.kind === "corner" || s.kind === "tall");
  if (labelId === "sink") return STOCK_SKUS.filter((s) => s.kind === "sink-base");
  if (labelId === "dishwasher") return STOCK_SKUS.filter((s) => s.sku === "DW24");
  if (labelId === "range") return STOCK_SKUS.filter((s) => s.sku === "RG30");
  if (labelId === "fridge") return STOCK_SKUS.filter((s) => s.sku === "RF36");
  return [];
}

export function defaultSkuForLabel(labelId: PlanLabelId) {
  const list = stocksForLabel(labelId);
  if (labelId === "base-cab") return list.find((s) => s.sku === "B24") || list[0];
  if (labelId === "wall-cab") return list.find((s) => s.sku === "W2430") || list[0];
  if (labelId === "sink") return list.find((s) => s.sku === "SB36") || list[0];
  return list[0] || null;
}

export function guessSku(item: Pick<PlanItem, "labelId" | "widthInches" | "depthInches">) {
  const list = stocksForLabel(item.labelId);
  if (!list.length) return undefined;
  const exact = list.find((s) => s.width === item.widthInches && Math.abs(s.depth - item.depthInches) < 0.6);
  if (exact) return exact.sku;
  const byWidth = list.find((s) => s.width === item.widthInches);
  return byWidth?.sku;
}

export function itemDisplayName(item: PlanItem) {
  return item.sku || labelMeta(item.labelId).name;
}

export type PackedModule = { sku: string; width: number; filler?: boolean };

/** Greedy pack of stock widths along a wall. Leftover under 6" becomes a filler. */
export function packWallRun(lengthInches: number, kind: "base" | "wall"): PackedModule[] {
  const widths = kind === "wall" ? [36, 33, 30, 27, 24, 21, 18, 15, 12, 9] : [36, 33, 30, 27, 24, 21, 18, 15, 12, 9, 6];
  const prefix = kind === "wall" ? "W" : "B";
  const suffix = kind === "wall" ? "30" : "";
  const out: PackedModule[] = [];
  let left = Math.max(0, Math.round(lengthInches * 4) / 4);
  while (left >= 6) {
    const w = widths.find((n) => n <= left) || 0;
    if (!w) break;
    const sku =
      kind === "wall"
        ? `${prefix}${String(w).padStart(2, "0")}${suffix}`
        : w === 6
          ? "B06-FD"
          : w === 9
            ? "B09-FD"
            : `${prefix}${String(w).padStart(2, "0")}`;
    out.push({ sku, width: w });
    left = Math.round((left - w) * 4) / 4;
  }
  if (left >= 0.25) out.push({ sku: `FLR${Math.round(left)}`, width: left, filler: true });
  return out;
}

export type WallSnap = {
  line: PlanLine;
  t: number;
  dist: number;
  px: number;
  py: number;
};

export function projectOnWall(px: number, py: number, line: PlanLine): WallSnap {
  const { x1, y1, x2, y2 } = lineEndpoints(line);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const qx = x1 + t * dx;
  const qy = y1 + t * dy;
  return { line, t, dist: Math.hypot(px - qx, py - qy), px: qx, py: qy };
}

export function nearestWall(px: number, py: number, lines: PlanLine[], maxDist = 30): WallSnap | null {
  let best: WallSnap | null = null;
  for (const line of lines) {
    const snap = projectOnWall(px, py, line);
    if (!best || snap.dist < best.dist) best = snap;
  }
  if (!best || best.dist > maxDist) return null;
  return best;
}

/** Place a cabinet so its back edge sits on the wall and width runs along the wall. */
export function placeOnWall(
  line: PlanLine,
  alongInches: number,
  width: number,
  depth: number,
  inward = 1,
): { xInches: number; yInches: number; rotationDeg: number; wallId: string } {
  const rad = (line.angleDeg * Math.PI) / 180;
  const along = Math.max(0, Math.min(line.lengthInches - width, alongInches));
  const bx = line.xInches + Math.cos(rad) * along;
  const by = line.yInches + Math.sin(rad) * along;
  const nx = -Math.sin(rad) * inward;
  const ny = Math.cos(rad) * inward;
  return {
    xInches: bx + nx * 0,
    yInches: by + ny * 0,
    rotationDeg: line.angleDeg,
    wallId: line.id,
  };
}

export function snapItemToNearestWall(item: PlanItem, lines: PlanLine[], maxDist = 24): PlanItem {
  if (!lines.length) return item;
  const cx = item.xInches + item.widthInches / 2;
  const cy = item.yInches + item.depthInches / 2;
  const hit = nearestWall(cx, cy, lines, maxDist);
  if (!hit) return item;
  const placed = placeOnWall(
    hit.line,
    hit.t * hit.line.lengthInches - item.widthInches / 2,
    item.widthInches,
    item.depthInches,
  );
  return { ...item, ...placed };
}

/** Distance along a wall from the wall start to the item's origin. */
export function alongWall(item: Pick<PlanItem, "xInches" | "yInches">, line: PlanLine) {
  const rad = (line.angleDeg * Math.PI) / 180;
  return (item.xInches - line.xInches) * Math.cos(rad) + (item.yInches - line.yInches) * Math.sin(rad);
}

function sameRunLayer(a: PlanItem, b: PlanItem) {
  const aWall = a.labelId === "wall-cab";
  const bWall = b.labelId === "wall-cab";
  return aWall === bWall;
}

function isStockBox(item: PlanItem) {
  return labelMeta(item.labelId).category === "appliance";
}

/** Stick to a neighboring box edge on the same wall when within a few inches. */
export function snapToNeighborBoxes(item: PlanItem, others: PlanItem[], lines: PlanLine[], tol = 3): PlanItem {
  if (!item.wallId) return item;
  const line = lines.find((l) => l.id === item.wallId);
  if (!line) return item;
  let along = alongWall(item, line);
  const siblings = others.filter(
    (o) => o.id !== item.id && o.wallId === item.wallId && isStockBox(o) && sameRunLayer(o, item),
  );
  let best: { along: number; dist: number } | null = null;
  for (const sib of siblings) {
    const s0 = alongWall(sib, line);
    const s1 = s0 + sib.widthInches;
    for (const edge of [s0 - item.widthInches, s1]) {
      const dist = Math.abs(along - edge);
      if (dist <= tol && (!best || dist < best.dist)) best = { along: edge, dist };
    }
  }
  if (!best) return item;
  const placed = placeOnWall(line, best.along, item.widthInches, item.depthInches);
  return { ...item, ...placed };
}

/** Snap to nearest wall, then neighbor edges, then shift so two stock boxes do not share a run segment. */
export function settleStockItem(item: PlanItem, others: PlanItem[], lines: PlanLine[], maxDist = 24): PlanItem {
  if (!isStockBox(item) || !lines.length) return item;
  let next = snapItemToNearestWall(item, lines, maxDist);
  next = snapToNeighborBoxes(next, others, lines);
  if (!next.wallId) return next;
  const line = lines.find((l) => l.id === next.wallId);
  if (!line) return next;

  const siblings = others.filter(
    (o) => o.id !== next.id && o.wallId === next.wallId && isStockBox(o) && sameRunLayer(o, next),
  );
  let along = alongWall(next, line);
  for (let guard = 0; guard < 48; guard++) {
    let pushed = false;
    for (const sib of siblings) {
      const s0 = alongWall(sib, line);
      const s1 = s0 + sib.widthInches;
      if (along < s1 && along + next.widthInches > s0) {
        along = s1;
        pushed = true;
      }
    }
    if (!pushed) break;
  }
  along = Math.max(0, Math.min(Math.max(0, line.lengthInches - next.widthInches), along));
  const placed = placeOnWall(line, along, next.widthInches, next.depthInches);
  return { ...next, ...placed, sku: next.sku || guessSku(next) };
}

export function fillWallWithStock(line: PlanLine, kind: "base" | "wall"): PlanItem[] {
  const packed = packWallRun(line.lengthInches, kind);
  const labelId: PlanLabelId = kind === "wall" ? "wall-cab" : "base-cab";
  const depth = kind === "wall" ? 12 : 24;
  let along = 0;
  const out: PlanItem[] = [];
  for (const mod of packed) {
    const pos = placeOnWall(line, along, mod.width, depth);
    out.push({
      id: crypto.randomUUID(),
      labelId,
      sku: mod.sku,
      wallId: line.id,
      xInches: pos.xInches,
      yInches: pos.yInches,
      widthInches: mod.width,
      depthInches: depth,
      rotationDeg: pos.rotationDeg,
      note: mod.filler ? "Filler - cut on site" : undefined,
    });
    along += mod.width;
  }
  return out;
}

export type TakeoffLine = { sku: string; name: string; qty: number; width: number; note?: string };

export function buildTakeoff(items: PlanItem[]): TakeoffLine[] {
  const map = new Map<string, TakeoffLine>();
  for (const item of items) {
    const sku = item.sku || guessSku(item) || labelMeta(item.labelId).name;
    const key = `${sku}|${item.note || ""}`;
    const existing = map.get(key);
    if (existing) existing.qty += 1;
    else {
      map.set(key, {
        sku,
        name: labelMeta(item.labelId).name,
        qty: 1,
        width: item.widthInches,
        note: item.note,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.sku.localeCompare(b.sku));
}

export function takeoffSummary(items: PlanItem[]) {
  const lines = buildTakeoff(items);
  if (!lines.length) return "(none)";
  return lines
    .map((l) => `- ${l.qty}× ${l.sku} · ${l.name} · ${inchesToFeetInches(l.width)}${l.note ? ` · ${l.note}` : ""}`)
    .join("\n");
}

function esc(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function buildPlanSvg(opts: {
  lines: PlanLine[];
  items: PlanItem[];
  footprints: PlanFootprint[];
  title?: string;
  studio?: string;
}) {
  const w = PLAN_COLS * PLAN_CELL_PX;
  const h = PLAN_ROWS * PLAN_CELL_PX;
  const pad = 72;
  const sheetW = w + pad * 2;
  const sheetH = h + pad * 2 + 160;
  const grid: string[] = [];
  for (let x = 0; x <= PLAN_COLS; x++) {
    const xx = pad + x * PLAN_CELL_PX;
    const bold = x % CELLS_PER_FOOT === 0;
    grid.push(
      `<line x1="${xx}" y1="${pad}" x2="${xx}" y2="${pad + h}" stroke="${bold ? "#1f2a2448" : "#1f2a241f"}" stroke-width="${bold ? 1 : 0.5}"/>`,
    );
  }
  for (let y = 0; y <= PLAN_ROWS; y++) {
    const yy = pad + y * PLAN_CELL_PX;
    const bold = y % CELLS_PER_FOOT === 0;
    grid.push(
      `<line x1="${pad}" y1="${yy}" x2="${pad + w}" y2="${yy}" stroke="${bold ? "#1f2a2448" : "#1f2a241f"}" stroke-width="${bold ? 1 : 0.5}"/>`,
    );
  }
  const fills = opts.footprints
    .filter((f) => f.closed && f.points.length >= 3)
    .map((f) => {
      const pts = f.points.map((p) => `${pad + p.x * PLAN_CELL_PX},${pad + p.y * PLAN_CELL_PX}`).join(" ");
      return `<polygon points="${pts}" fill="${f.color}" fill-opacity="0.18" stroke="${f.color}" stroke-width="2"/>`;
    });
  const walls = opts.lines.map((line) => {
    const e = lineEndpoints(line);
    const x1 = pad + e.x1 * INCH_PX;
    const y1 = pad + e.y1 * INCH_PX;
    const x2 = pad + e.x2 * INCH_PX;
    const y2 = pad + e.y2 * INCH_PX;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    const label = `${line.label ? `${line.label} · ` : ""}${inchesToFeetInches(line.lengthInches)}`;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${line.color}" stroke-width="4" stroke-linecap="round"/>
      <text x="${mx}" y="${my - 6}" text-anchor="middle" font-size="11" font-family="Georgia, serif" fill="#1f2a24">${esc(label)}</text>`;
  });
  const boxes = opts.items.map((item) => {
    const x = pad + item.xInches * INCH_PX;
    const y = pad + item.yInches * INCH_PX;
    const bw = item.widthInches * INCH_PX;
    const bh = item.depthInches * INCH_PX;
    const name = itemDisplayName(item);
    const size = `${inchesToFeetInches(item.widthInches)}×${inchesToFeetInches(item.depthInches)}`;
    return `<g transform="rotate(${item.rotationDeg} ${x} ${y})">
      <rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${labelMeta(item.labelId).color}" fill-opacity="0.85" stroke="#1f2a24" stroke-width="0.8"/>
      <text x="${x + bw / 2}" y="${y + bh / 2 - 3}" text-anchor="middle" font-size="9" font-family="system-ui,sans-serif" fill="#1f2a24">${esc(name)}</text>
      <text x="${x + bw / 2}" y="${y + bh / 2 + 9}" text-anchor="middle" font-size="8" font-family="system-ui,sans-serif" fill="#1f2a24aa">${esc(size)}</text>
    </g>`;
  });
  const takeoff = buildTakeoff(opts.items)
    .map((l) => `${l.qty}× ${l.sku}`)
    .join("   ");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${sheetW}" height="${sheetH}" viewBox="0 0 ${sheetW} ${sheetH}">
  <rect width="${sheetW}" height="${sheetH}" fill="#f7f3ea"/>
  <text x="${pad}" y="36" font-size="20" font-family="Georgia, serif" fill="#1f2a24">${esc(opts.title || "Kitchen plan")}</text>
  <text x="${pad}" y="56" font-size="12" font-family="system-ui,sans-serif" fill="#1f2a24aa">${esc(opts.studio || "Styles by Design")} · ${esc(scaleLegend())} · Board ${inchesToFeetInches(BOARD_WIDTH_IN)} × ${inchesToFeetInches(BOARD_HEIGHT_IN)}</text>
  <rect x="${pad}" y="${pad}" width="${w}" height="${h}" fill="#fbf8f1" stroke="#1f2a2433"/>
  ${grid.join("\n  ")}
  ${fills.join("\n  ")}
  ${walls.join("\n  ")}
  ${boxes.join("\n  ")}
  <text x="${pad}" y="${pad + h + 36}" font-size="12" font-family="Georgia, serif" fill="#1f2a24">Stock takeoff</text>
  <text x="${pad}" y="${pad + h + 56}" font-size="11" font-family="system-ui,sans-serif" fill="#1f2a24">${esc(takeoff || "(no cabinets placed)")}</text>
  <text x="${pad}" y="${pad + h + 84}" font-size="10" font-family="system-ui,sans-serif" fill="#1f2a2488">Northville stock boxes. Fillers are field-cut. Not a custom cabinet shop drawing.</text>
</svg>`;
}

export function downloadTextFile(filename: string, contents: string, mime = "text/plain") {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
