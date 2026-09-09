import {
  BOARD_HEIGHT_IN,
  BOARD_WIDTH_IN,
  inchesToFeetInches,
  labelMeta,
  lineEndpoints,
  type PlanFootprint,
  type PlanItem,
  type PlanLabelId,
  type PlanLine,
} from "./kitchen-plan";
import { buildTakeoff, itemDisplayName } from "./kitchen-stock";

const PAGE_W = 1224;
const PAGE_H = 792;
const MARGIN = 36;

function pdfEscape(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return [parseInt(n.slice(0, 2), 16) / 255, parseInt(n.slice(2, 4), 16) / 255, parseInt(n.slice(4, 6), 16) / 255];
}

function markFor(id: PlanLabelId) {
  if (id === "outlet") return "E";
  if (id === "plumbing") return "P";
  if (id === "window") return "W";
  if (id === "door") return "D";
  if (id === "note") return "N";
  return "";
}

class PageStream {
  parts: string[] = [];
  w = PAGE_W;
  h = PAGE_H;

  fill(hex: string) {
    const [r, g, b] = hexRgb(hex);
    this.parts.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg`);
  }
  stroke(hex: string) {
    const [r, g, b] = hexRgb(hex);
    this.parts.push(`${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG`);
  }
  width(n: number) {
    this.parts.push(`${n} w`);
  }
  rect(x: number, y: number, w: number, h: number, mode: "s" | "f" | "B" = "s") {
    this.parts.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re ${mode}`);
  }
  line(x1: number, y1: number, x2: number, y2: number) {
    this.parts.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  }
  circle(cx: number, cy: number, r: number, mode: "s" | "f" | "B" = "B") {
    const k = 0.5522847498 * r;
    this.parts.push(
      `${(cx + r).toFixed(2)} ${cy.toFixed(2)} m`,
      `${(cx + r).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx + k).toFixed(2)} ${(cy + r).toFixed(2)} ${cx.toFixed(2)} ${(cy + r).toFixed(2)} c`,
      `${(cx - k).toFixed(2)} ${(cy + r).toFixed(2)} ${(cx - r).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx - r).toFixed(2)} ${cy.toFixed(2)} c`,
      `${(cx - r).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx - k).toFixed(2)} ${(cy - r).toFixed(2)} ${cx.toFixed(2)} ${(cy - r).toFixed(2)} c`,
      `${(cx + k).toFixed(2)} ${(cy - r).toFixed(2)} ${(cx + r).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx + r).toFixed(2)} ${cy.toFixed(2)} c ${mode}`,
    );
  }
  text(x: number, y: number, size: number, value: string, font = "F1") {
    this.parts.push(`BT /${font} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${pdfEscape(value)}) Tj ET`);
  }
  raw() {
    return this.parts.join("\n");
  }
}

function layout() {
  const titleH = 48;
  const side = 250;
  const x0 = MARGIN;
  const y0 = MARGIN;
  const drawW = PAGE_W - MARGIN * 2 - side;
  const drawH = PAGE_H - MARGIN - titleH;
  const scale = Math.min(drawW / BOARD_WIDTH_IN, drawH / BOARD_HEIGHT_IN);
  return { x0, y0, drawW, drawH, scale, titleH, side, mapX: (inches: number) => x0 + inches * scale, mapY: (inches: number) => y0 + (BOARD_HEIGHT_IN - inches) * scale };
}

function drawGrid(p: PageStream, L: ReturnType<typeof layout>) {
  p.stroke("#d9d0c2");
  p.width(0.3);
  for (let inch = 0; inch <= BOARD_WIDTH_IN; inch += 6) {
    const x = L.mapX(inch);
    p.line(x, L.mapY(0), x, L.mapY(BOARD_HEIGHT_IN));
  }
  for (let inch = 0; inch <= BOARD_HEIGHT_IN; inch += 6) {
    const y = L.mapY(inch);
    p.line(L.mapX(0), y, L.mapX(BOARD_WIDTH_IN), y);
  }
  p.stroke("#1f2a2440");
  p.width(0.7);
  for (let inch = 0; inch <= BOARD_WIDTH_IN; inch += 12) {
    const x = L.mapX(inch);
    p.line(x, L.mapY(0), x, L.mapY(BOARD_HEIGHT_IN));
  }
  for (let inch = 0; inch <= BOARD_HEIGHT_IN; inch += 12) {
    const y = L.mapY(inch);
    p.line(L.mapX(0), y, L.mapX(BOARD_WIDTH_IN), y);
  }
  p.stroke("#1f2a24");
  p.width(1);
  p.rect(L.mapX(0), L.mapY(BOARD_HEIGHT_IN), BOARD_WIDTH_IN * L.scale, BOARD_HEIGHT_IN * L.scale, "s");
}

function drawWalls(p: PageStream, lines: PlanLine[], L: ReturnType<typeof layout>, faded = false) {
  for (const line of lines) {
    const e = lineEndpoints(line);
    p.stroke(faded ? "#8a918c" : line.color || "#1f2a24");
    p.width(faded ? 1.2 : 2.4);
    p.line(L.mapX(e.x1), L.mapY(e.y1), L.mapX(e.x2), L.mapY(e.y2));
    if (!faded) {
      p.fill("#1f2a24");
      const mx = L.mapX((e.x1 + e.x2) / 2);
      const my = L.mapY((e.y1 + e.y2) / 2) + 6;
      const label = `${line.label ? `${line.label} | ` : ""}${inchesToFeetInches(line.lengthInches)}`;
      p.text(mx - 24, my, 8, label);
    }
  }
}

function drawFootprints(p: PageStream, footprints: PlanFootprint[], L: ReturnType<typeof layout>) {
  for (const fp of footprints) {
    if (!fp.closed || fp.points.length < 3) continue;
    const pts = fp.points.map((pt) => ({ x: L.mapX(pt.x * 6), y: L.mapY(pt.y * 6) }));
    p.stroke(fp.color);
    p.width(1);
    const start = pts[0];
    const cmds = [`${start.x.toFixed(2)} ${start.y.toFixed(2)} m`];
    for (let i = 1; i < pts.length; i++) cmds.push(`${pts[i].x.toFixed(2)} ${pts[i].y.toFixed(2)} l`);
    cmds.push("h S");
    p.parts.push(cmds.join(" "));
  }
}

function itemCorners(item: PlanItem) {
  const rad = (item.rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [
    { x: 0, y: 0 },
    { x: item.widthInches, y: 0 },
    { x: item.widthInches, y: item.depthInches },
    { x: 0, y: item.depthInches },
  ].map((pt) => ({
    x: item.xInches + pt.x * cos - pt.y * sin,
    y: item.yInches + pt.x * sin + pt.y * cos,
  }));
}

function drawBoxes(p: PageStream, items: PlanItem[], L: ReturnType<typeof layout>, labeled: boolean) {
  for (const item of items) {
    const mapped = itemCorners(item).map((pt) => ({ x: L.mapX(pt.x), y: L.mapY(pt.y) }));
    const color = labelMeta(item.labelId).color;
    p.fill(color);
    p.stroke("#1f2a24");
    p.width(0.7);
    p.parts.push(
      `${mapped[0].x.toFixed(2)} ${mapped[0].y.toFixed(2)} m ${mapped[1].x.toFixed(2)} ${mapped[1].y.toFixed(2)} l ${mapped[2].x.toFixed(2)} ${mapped[2].y.toFixed(2)} l ${mapped[3].x.toFixed(2)} ${mapped[3].y.toFixed(2)} l h B`,
    );
    if (!labeled) continue;
    const cx = mapped.reduce((s, pt) => s + pt.x, 0) / 4;
    const cy = mapped.reduce((s, pt) => s + pt.y, 0) / 4;
    p.fill("#1f2a24");
    p.text(cx - 16, cy + 2, 7, itemDisplayName(item).slice(0, 18));
    p.text(cx - 16, cy - 8, 6, `${inchesToFeetInches(item.widthInches)}x${inchesToFeetInches(item.depthInches)}`);
  }
}

function header(p: PageStream, title: string, subtitle: string, pageNo: number, pages: number) {
  p.fill("#1f2a24");
  p.text(MARGIN, PAGE_H - 28, 16, title, "F2");
  p.text(MARGIN, PAGE_H - 42, 9, subtitle);
  p.text(PAGE_W - 120, PAGE_H - 28, 9, `Page ${pageNo} of ${pages}`);
}

export type PlanPdfOpts = {
  lines: PlanLine[];
  items: PlanItem[];
  footprints: PlanFootprint[];
  title?: string;
  studio?: string;
};

function sheetWalls(opts: PlanPdfOpts) {
  const p = new PageStream();
  p.fill("#f7f3ea");
  p.rect(0, 0, PAGE_W, PAGE_H, "f");
  header(p, opts.title || "Kitchen plan", `${opts.studio || "Styles by Design"}  |  Page 1 - Walls and room  |  6\" grid, bold = 1'`, 1, 4);
  const L = layout();
  drawGrid(p, L);
  drawFootprints(p, opts.footprints, L);
  drawWalls(p, opts.lines, L, false);
  p.fill("#1f2a24");
  let y = PAGE_H - 70;
  const sx = PAGE_W - 240;
  p.text(sx, y, 11, "Wall schedule", "F2");
  y -= 14;
  if (!opts.lines.length) p.text(sx, y, 8, "(no walls yet)");
  else {
    for (const line of opts.lines.slice(0, 18)) {
      p.text(sx, y, 8, `${line.label || "Wall"}  ${inchesToFeetInches(line.lengthInches)}  ${Math.round(line.angleDeg)} deg`);
      y -= 12;
    }
  }
  return p.raw();
}

function sheetUtilities(opts: PlanPdfOpts) {
  const p = new PageStream();
  p.fill("#f7f3ea");
  p.rect(0, 0, PAGE_W, PAGE_H, "f");
  header(p, opts.title || "Kitchen plan", `${opts.studio || "Styles by Design"}  |  Page 2 - Utilities (numbered outlets, not under cabinets)`, 2, 4);
  const L = layout();
  drawGrid(p, L);
  drawWalls(p, opts.lines, L, true);
  const utilities = opts.items.filter((item) => labelMeta(item.labelId).category === "utility");
  drawBoxes(p, utilities.filter((item) => item.labelId === "door" || item.labelId === "window" || item.labelId === "note"), L, true);
  const points = utilities.filter((item) => item.labelId === "outlet" || item.labelId === "plumbing");
  const sx = PAGE_W - 240;
  let y = PAGE_H - 70;
  p.fill("#1f2a24");
  p.text(sx, y, 11, "Utility callouts", "F2");
  y -= 16;
  points.forEach((item, i) => {
    const n = String(i + 1);
    const cx = L.mapX(item.xInches + item.widthInches / 2);
    const cy = L.mapY(item.yInches + item.depthInches / 2);
    p.fill(item.labelId === "outlet" ? "#e2c15a" : "#5b8fa8");
    p.stroke("#1f2a24");
    p.width(1);
    p.circle(cx, cy, 8, "B");
    p.fill("#1f2a24");
    p.text(cx - 3, cy - 3, 9, n);
    p.text(sx, y, 8, `${n}  ${markFor(item.labelId)}  ${labelMeta(item.labelId).name}`);
    y -= 11;
    p.text(sx + 12, y, 7, `@ ${inchesToFeetInches(item.xInches)}, ${inchesToFeetInches(item.yInches)}`);
    y -= 13;
  });
  if (!points.length) p.text(sx, y, 8, "(no outlets or plumbing)");
  y -= 16;
  p.text(sx, y, 8, "E = electrical outlet");
  y -= 11;
  p.text(sx, y, 8, "P = plumbing / water");
  y -= 11;
  p.text(sx, y, 8, "W = window   D = door");
  return p.raw();
}

function sheetCabinets(opts: PlanPdfOpts) {
  const p = new PageStream();
  p.fill("#f7f3ea");
  p.rect(0, 0, PAGE_W, PAGE_H, "f");
  header(p, opts.title || "Kitchen plan", `${opts.studio || "Styles by Design"}  |  Page 3 - Appliances and stock cabinets`, 3, 4);
  const L = layout();
  drawGrid(p, L);
  drawWalls(p, opts.lines, L, true);
  const cabinets = opts.items.filter((item) => labelMeta(item.labelId).category === "appliance");
  drawBoxes(p, cabinets, L, true);
  const sx = PAGE_W - 240;
  let y = PAGE_H - 70;
  p.fill("#1f2a24");
  p.text(sx, y, 11, "Cabinet / appliance list", "F2");
  y -= 14;
  if (!cabinets.length) p.text(sx, y, 8, "(none placed)");
  for (const item of cabinets.slice(0, 22)) {
    p.text(sx, y, 8, `${itemDisplayName(item)}  ${inchesToFeetInches(item.widthInches)}`);
    y -= 12;
  }
  return p.raw();
}

function sheetTakeoff(opts: PlanPdfOpts) {
  const p = new PageStream();
  p.fill("#f7f3ea");
  p.rect(0, 0, PAGE_W, PAGE_H, "f");
  header(p, opts.title || "Kitchen plan", `${opts.studio || "Styles by Design"}  |  Page 4 - Stock takeoff (no prices)`, 4, 4);
  const rows = buildTakeoff(opts.items.filter((item) => labelMeta(item.labelId).category === "appliance"));
  p.fill("#1f2a24");
  p.text(MARGIN, PAGE_H - 72, 12, "Qty    SKU              Description                         Width", "F2");
  p.stroke("#1f2a24");
  p.width(0.6);
  p.line(MARGIN, PAGE_H - 78, PAGE_W - MARGIN, PAGE_H - 78);
  let y = PAGE_H - 96;
  if (!rows.length) p.text(MARGIN, y, 10, "No stock cabinets on the plan yet.");
  for (const row of rows) {
    p.text(MARGIN, y, 10, `${String(row.qty).padEnd(6, " ")} ${row.sku.padEnd(16, " ")} ${row.name.padEnd(32, " ")} ${inchesToFeetInches(row.width)}${row.note ? `  ${row.note}` : ""}`);
    y -= 16;
    if (y < 80) break;
  }
  p.text(MARGIN, 56, 9, "Northville stock boxes only. Fillers are field-cut. Not a custom cabinet shop drawing.");
  p.text(MARGIN, 42, 9, "Separate pages keep outlets out from under cabinets. Attach all four sheets to the purchase email.");
  return p.raw();
}

function buildPdf(pages: string[]) {
  const objects: string[] = [];
  const add = (body: string) => {
    objects.push(body);
    return objects.length;
  };
  const font1 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const font2 = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  const contentIds: number[] = [];
  const pageIds: number[] = [];
  for (const stream of pages) {
    const bytes = new TextEncoder().encode(stream);
    contentIds.push(add(`<< /Length ${bytes.length} >>\nstream\n${stream}\nendstream`));
  }
  const kidsPlace = objects.length + 1 + pages.length;
  for (let i = 0; i < pages.length; i++) {
    pageIds.push(
      add(
        `<< /Type /Page /Parent ${kidsPlace} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${font1} 0 R /F2 ${font2} 0 R >> >> /Contents ${contentIds[i]} 0 R >>`,
      ),
    );
  }
  const pagesId = add(`<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`);
  const catalogId = add(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  let out = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(out.length);
    out += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const xref = out.length;
  out += `xref\n0 ${objects.length + 1}\n`;
  out += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) out += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  out += `trailer << /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(out);
}

export function buildPlanPdf(opts: PlanPdfOpts) {
  return buildPdf([sheetWalls(opts), sheetUtilities(opts), sheetCabinets(opts), sheetTakeoff(opts)]);
}

export function downloadPdf(filename: string, bytes: Uint8Array) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
