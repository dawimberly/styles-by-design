import { cabinetCatalog, flattenSkus, listPrice } from "./cabinets";
import { applyListDiscount, CONTRACTOR_DISCOUNT } from "./referrals";

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

export class CatalogPriceError extends Error {}

export function resolveFinish(finish?: string) {
  const catalog = cabinetCatalog();
  const value = (finish || "").trim() || catalog.finish_options[0];
  if (!catalog.finish_options.includes(value)) {
    throw createError({ statusCode: 400, statusMessage: `Unknown finish: ${value}` });
  }
  return value;
}

/**
 * Price cart lines from the catalog at a server-side discount.
 * `discount` is a fraction off list (0 = retail). Client unit prices are ignored.
 */
export function quoteCatalogLines(
  finish: string,
  lines: OrderLineInput[] | undefined,
  discount: number,
): PricedLine[] {
  if (!lines?.length) {
    throw new CatalogPriceError("At least one SKU is required.");
  }
  if (lines.length > MAX_LINES) {
    throw new CatalogPriceError(`An order allows at most ${MAX_LINES} line items. Split the order.`);
  }

  const bySku = new Map(flattenSkus().map((row) => [row.sku, row]));
  const priced: PricedLine[] = [];

  for (const line of lines) {
    const sku = String(line.sku || "").trim();
    const qty = Math.floor(Number(line.qty) || 0);
    if (!sku) {
      throw new CatalogPriceError("Each line needs a SKU.");
    }
    if (qty < 1 || qty > 999) {
      throw new CatalogPriceError(`Quantity for ${sku} must be between 1 and 999.`);
    }
    const row = bySku.get(sku);
    if (!row) {
      throw new CatalogPriceError(`Unknown SKU ${sku}.`);
    }
    const list = listPrice(row.option, finish);
    if (list == null) {
      throw new CatalogPriceError(`No list price for ${sku} in ${finish}.`);
    }
    priced.push({
      sku,
      name: row.name,
      qty,
      net: applyListDiscount(list, discount),
      roomLabel: (line.roomLabel || "").trim(),
    });
  }

  return priced;
}

export function priceCatalogLines(finish: string, lines: OrderLineInput[] | undefined, discount: number): PricedLine[] {
  try {
    return quoteCatalogLines(finish, lines, discount);
  } catch (error) {
    if (error instanceof CatalogPriceError) {
      throw createError({ statusCode: 400, statusMessage: error.message });
    }
    throw error;
  }
}

/** Price contractor cart lines at the trade rate. Never stacks a referral discount. */
export function priceContractorLines(finish: string, lines: OrderLineInput[] | undefined): PricedLine[] {
  return priceCatalogLines(finish, lines, CONTRACTOR_DISCOUNT);
}

export function lineTotalCents(lines: PricedLine[]) {
  return lines.reduce((sum, line) => sum + Math.round(line.net * 100) * line.qty, 0);
}
