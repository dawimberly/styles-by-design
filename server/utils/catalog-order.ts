import { cabinetCatalog, contractorPrice, flattenSkus } from "./cabinets";

export type OrderLineInput = {
  sku?: string;
  qty?: number;
  roomLabel?: string;
};

export type PricedLine = {
  sku: string;
  name: string;
  qty: number;
  net: number;
  roomLabel: string;
};

const MAX_LINES = 100;

export function resolveFinish(finish?: string) {
  const catalog = cabinetCatalog();
  const value = (finish || "").trim() || catalog.finish_options[0];
  if (!catalog.finish_options.includes(value)) {
    throw createError({ statusCode: 400, statusMessage: `Unknown finish: ${value}` });
  }
  return value;
}

/** Price contractor cart lines from the catalog. Never trust client-supplied unit amounts. */
export function priceContractorLines(finish: string, lines: OrderLineInput[] | undefined): PricedLine[] {
  if (!lines?.length) {
    throw createError({ statusCode: 400, statusMessage: "At least one SKU is required." });
  }
  if (lines.length > MAX_LINES) {
    throw createError({
      statusCode: 400,
      statusMessage: `Checkout allows at most ${MAX_LINES} line items. Split the order.`,
    });
  }

  const bySku = new Map(flattenSkus().map((row) => [row.sku, row]));
  const priced: PricedLine[] = [];

  for (const line of lines) {
    const sku = String(line.sku || "").trim();
    const qty = Math.floor(Number(line.qty) || 0);
    if (!sku) {
      throw createError({ statusCode: 400, statusMessage: "Each line needs a SKU." });
    }
    if (qty < 1 || qty > 999) {
      throw createError({ statusCode: 400, statusMessage: `Quantity for ${sku} must be between 1 and 999.` });
    }
    const row = bySku.get(sku);
    if (!row) {
      throw createError({ statusCode: 400, statusMessage: `Unknown SKU ${sku}.` });
    }
    const net = contractorPrice(row.option, finish);
    if (net == null) {
      throw createError({ statusCode: 400, statusMessage: `No trade price for ${sku} in ${finish}.` });
    }
    priced.push({
      sku,
      name: row.name,
      qty,
      net,
      roomLabel: (line.roomLabel || "").trim(),
    });
  }

  return priced;
}

export function lineTotalCents(lines: PricedLine[]) {
  return lines.reduce((sum, line) => sum + Math.round(line.net * 100) * line.qty, 0);
}
