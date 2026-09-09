import {
  CELL_INCHES,
  labelMeta,
  lineEndpoints,
  type PlanFootprint,
  type PlanItem,
  type PlanLine,
} from "./kitchen-plan";
import { stockBySku } from "./kitchen-stock";

export type KitchenExportOpts = {
  lines: PlanLine[];
  items: PlanItem[];
  footprints: PlanFootprint[];
  jobId?: string;
};

function inchesToFt(inches: number) {
  return Math.round((inches / 12) * 100) / 100;
}

function planBoundsInches(lines: PlanLine[], footprints: PlanFootprint[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const line of lines) {
    const e = lineEndpoints(line);
    minX = Math.min(minX, e.x1, e.x2);
    minY = Math.min(minY, e.y1, e.y2);
    maxX = Math.max(maxX, e.x1, e.x2);
    maxY = Math.max(maxY, e.y1, e.y2);
  }
  for (const fp of footprints) {
    for (const p of fp.points) {
      const x = p.x * CELL_INCHES;
      const y = p.y * CELL_INCHES;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (!Number.isFinite(minX)) return { lengthIn: 0, widthIn: 0 };
  return {
    lengthIn: Math.max(0, maxX - minX),
    widthIn: Math.max(0, maxY - minY),
  };
}

function footprintSizeFt(fp: PlanFootprint) {
  const xs = fp.points.map((p) => p.x);
  const ys = fp.points.map((p) => p.y);
  const w = (Math.max(...xs) - Math.min(...xs)) * CELL_INCHES;
  const d = (Math.max(...ys) - Math.min(...ys)) * CELL_INCHES;
  return { width_ft: inchesToFt(w), depth_ft: inchesToFt(d) };
}

function peninsulaFromFootprints(footprints: PlanFootprint[]) {
  const hit =
    footprints.find((f) => f.closed && /peninsula|island/i.test(f.label || "")) ||
    footprints.find((f) => f.closed && f.points.length >= 4);
  if (!hit) return undefined;
  return { label: hit.label || "Peninsula", ...footprintSizeFt(hit) };
}

export function buildRoomScanJson(opts: KitchenExportOpts) {
  const bounds = planBoundsInches(opts.lines, opts.footprints);
  const length_ft = inchesToFt(bounds.lengthIn) || 1;
  const width_ft = inchesToFt(bounds.widthIn) || 1;
  const height_ft = 8;
  const doors = opts.items
    .filter((item) => item.labelId === "door")
    .map((item, i) => ({
      identifier: item.id || `door-${i + 1}`,
      category: "door",
      width_ft: inchesToFt(item.widthInches),
      height_ft: 6.67,
    }));
  const windows = opts.items
    .filter((item) => item.labelId === "window")
    .map((item, i) => ({
      identifier: item.id || `window-${i + 1}`,
      category: "window",
      width_ft: inchesToFt(item.widthInches),
      height_ft: 3,
    }));
  const walls = opts.lines.map((line, i) => ({
    identifier: line.id || `wall-${i + 1}`,
    category: "wall",
    label: line.label || undefined,
    width_ft: inchesToFt(line.lengthInches),
    height_ft,
  }));
  const peninsula = peninsulaFromFootprints(opts.footprints);
  return {
    source: "StylesKitchenEstimator",
    version: "1",
    roomType: "kitchen",
    identifier: opts.jobId || `kitchen-${Date.now()}`,
    dimensions: {
      length_ft,
      width_ft,
      height_ft,
      unit: "ft",
    },
    wallCount: walls.length,
    doorCount: doors.length,
    windowCount: windows.length,
    floorArea_sqft: Math.round(length_ft * width_ft * 100) / 100,
    walls,
    doors,
    windows,
    ...(peninsula ? { peninsula } : {}),
  };
}

function takeoffKind(item: PlanItem): "base" | "wall" | "filler" | "appliance" {
  const sku = (item.sku || "").toUpperCase();
  if (item.note?.toLowerCase().includes("filler") || sku.startsWith("FLR")) return "filler";
  if (item.labelId === "wall-cab") return "wall";
  if (item.labelId === "base-cab" || item.labelId === "sink") return "base";
  if (
    item.labelId === "dishwasher" ||
    item.labelId === "fridge" ||
    item.labelId === "range" ||
    item.labelId === "counter"
  ) {
    return "appliance";
  }
  const stock = stockBySku(sku);
  if (stock?.kind === "wall") return "wall";
  if (stock?.kind === "appliance") return "appliance";
  return "base";
}

export function buildCabinetTakeoffJson(opts: KitchenExportOpts) {
  const appliances = opts.items.filter((item) => labelMeta(item.labelId).category === "appliance");
  const map = new Map<
    string,
    { sku: string; name: string; qty: number; width_in: number; kind: ReturnType<typeof takeoffKind>; wallId?: string; note?: string }
  >();
  for (const item of appliances) {
    const sku = item.sku || labelMeta(item.labelId).name;
    const key = `${sku}|${item.wallId || ""}|${item.widthInches}|${item.note || ""}`;
    const hit = map.get(key);
    if (hit) hit.qty += 1;
    else {
      map.set(key, {
        sku,
        name: labelMeta(item.labelId).name,
        qty: 1,
        width_in: item.widthInches,
        kind: takeoffKind(item),
        wallId: item.wallId,
        note: item.note,
      });
    }
  }
  return {
    source: "StylesKitchenEstimator",
    roomType: "kitchen",
    items: [...map.values()].sort((a, b) => a.sku.localeCompare(b.sku)),
  };
}

export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
