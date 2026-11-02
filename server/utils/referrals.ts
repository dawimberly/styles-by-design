/** Partner rates live here so checkout never trusts a client-supplied price or percent. */

export const CONTRACTOR_DISCOUNT = 0.2;

export const REFERRAL_COOKIE = "sbd_ref";

export type ReferralPartner = {
  id: string;
  name: string;
  /** Fraction off list price. 0.15 is 15% off retail. */
  discount: number;
};

export type PriceChannel = "contractor" | "retail";

/**
 * Public referral codes. The code is an attribution key, not a price.
 * `flipfixer` is The Flip Fixer → 15% off list.
 */
export const REFERRAL_PARTNERS: Record<string, ReferralPartner> = {
  flipfixer: {
    id: "flipfixer",
    name: "The Flip Fixer",
    discount: 0.15,
  },
};

export function normalizeReferralCode(raw: unknown): string {
  return String(raw ?? "").trim().toLowerCase();
}

export function lookupReferral(raw: unknown): ReferralPartner | null {
  const code = normalizeReferralCode(raw);
  if (!code) return null;
  return REFERRAL_PARTNERS[code] ?? null;
}

/** Round half-up to cents. Same rule the contractor trade price already uses. */
export function applyListDiscount(list: number, discount: number): number {
  const rate = discountRate(discount);
  return Math.round(list * (1 - rate) * 100) / 100;
}

/**
 * One channel, one rate.
 * Contractor orders always take the trade rate and drop any referral.
 * Retail orders take the partner rate, or full list when the code is missing or unknown.
 */
export function discountForChannel(channel: PriceChannel, referralCode?: unknown): {
  discount: number;
  referral: ReferralPartner | null;
} {
  if (channel === "contractor") {
    return { discount: CONTRACTOR_DISCOUNT, referral: null };
  }
  const referral = lookupReferral(referralCode);
  return { discount: referral?.discount ?? 0, referral };
}

export function formatDiscountLabel(input: { discount?: string; channel?: string; referral?: string }) {
  const rate = Number(input.discount);
  if (!Number.isFinite(rate) || rate <= 0) {
    if (input.channel === "retail") return "Retail price";
    return "";
  }
  const pct = Math.round(rate * 100);
  if (input.referral) return `${pct}% off retail`;
  if (input.channel === "contractor") return `${pct}% trade discount`;
  return `${pct}% off retail`;
}

function discountRate(discount: number): number {
  if (!Number.isFinite(discount) || discount < 0 || discount >= 1) {
    throw new Error(`Invalid discount rate: ${discount}`);
  }
  return discount;
}
