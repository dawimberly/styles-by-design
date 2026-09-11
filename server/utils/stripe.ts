import { createHash, randomBytes } from "node:crypto";
import Stripe from "stripe";
import type { ShipAddress } from "./address";
import type { PricedLine } from "./catalog-order";

/** Latest Stripe API version from stripe-best-practices. */
export const STRIPE_API_VERSION = "2026-08-26.dahlia" as const;

/**
 * Candidate product tax codes from https://docs.stripe.com/tax/tax-codes
 * Confirm with a tax advisor before going live — these are not legal advice.
 * Cabinets (physical goods): txcd_99999999 General - Tangible Goods
 * Design services: txcd_20060022 Interior Decorating
 */
export const CANDIDATE_CABINET_TAX_CODE = "txcd_99999999";
export const CANDIDATE_DESIGN_TAX_CODE = "txcd_20060022";

export function stripeSecretKey() {
  const key = useRuntimeConfig().stripeSecretKey?.trim() || process.env.STRIPE_SECRET_KEY?.trim() || "";
  return key;
}

/** Same key-shape check as Paq'in Family House (dirty-ink) — this project uses a different Stripe account. */
export function hasStripeSecret() {
  const key = stripeSecretKey();
  return (
    key.startsWith("sk_test_") ||
    key.startsWith("sk_live_") ||
    key.startsWith("rk_test_") ||
    key.startsWith("rk_live_")
  );
}

export function stripeNotConfiguredError() {
  const raw = stripeSecretKey();
  const hint = !raw
    ? "missing"
    : raw.startsWith("pk_")
      ? "publishable_key_not_secret"
      : raw.startsWith("sk_") || raw.startsWith("rk_")
        ? "unexpected_key_format"
        : "present_but_not_sk_or_rk";
  return createError({
    statusCode: 503,
    statusMessage:
      hint === "publishable_key_not_secret"
        ? "STRIPE_SECRET_KEY must be a secret or restricted key (sk_/rk_), not a publishable key."
        : "Stripe is not connected. Add this site’s own STRIPE_SECRET_KEY on Vercel (Styles by Design account — not Paq’in Family House).",
  });
}

export function stripeClient() {
  if (!hasStripeSecret()) {
    throw stripeNotConfiguredError();
  }
  return new Stripe(stripeSecretKey(), {
    apiVersion: STRIPE_API_VERSION,
    typescript: true,
  });
}

export function cabinetTaxCode() {
  return useRuntimeConfig().stripeCabinetTaxCode?.trim() || CANDIDATE_CABINET_TAX_CODE;
}

export function designTaxCode() {
  return useRuntimeConfig().stripeDesignTaxCode?.trim() || CANDIDATE_DESIGN_TAX_CODE;
}

export function stripeAddress(addr: ShipAddress): Stripe.AddressParam {
  return {
    line1: addr.street,
    city: addr.city,
    state: addr.state,
    postal_code: addr.zip,
    country: "US",
  };
}

export function letterSuffix(length = 8) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const bytes = randomBytes(length);
  return Array.from(bytes, (byte) => alphabet[byte % 26]).join("");
}

export function checkoutIdempotencyKey(input: {
  company: string;
  email: string;
  finish: string;
  fulfillment: string;
  shipTo: string;
  lines: PricedLine[];
}) {
  const payload = JSON.stringify({
    company: input.company,
    email: input.email,
    finish: input.finish,
    fulfillment: input.fulfillment,
    shipTo: input.shipTo,
    lines: input.lines.map((line) => [line.sku, line.qty, line.roomLabel]),
  });
  return `sbd_co_${createHash("sha256").update(payload).digest("hex").slice(0, 32)}`;
}

export async function findOrCreateCustomer(
  stripe: Stripe,
  input: {
    email: string;
    name?: string;
    company: string;
    phone?: string;
    address: ShipAddress;
  },
) {
  const email = input.email.trim().toLowerCase();
  const listed = await stripe.customers.list({ email, limit: 1 });
  const address = stripeAddress(input.address);
  const shipping: Stripe.CustomerCreateParams.Shipping = {
    name: (input.name || input.company).slice(0, 100),
    address,
    phone: input.phone || undefined,
  };
  const shared = {
    name: (input.name || input.company).slice(0, 256),
    phone: input.phone || undefined,
    description: input.company.slice(0, 350),
    address,
    shipping,
    metadata: { company: input.company.slice(0, 400) },
  };

  if (listed.data[0]) {
    return stripe.customers.update(listed.data[0].id, shared);
  }
  return stripe.customers.create({ email, ...shared });
}

export function checkoutLineItems(lines: PricedLine[], taxCode: string): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return lines.map((line) => {
    const room = line.roomLabel;
    const title = room ? `${room} · ${line.name} (${line.sku})` : `${line.name} (${line.sku})`;
    return {
      quantity: line.qty,
      price_data: {
        currency: "usd",
        unit_amount: Math.round(line.net * 100),
        tax_behavior: "exclusive",
        product_data: {
          name: title.slice(0, 120),
          tax_code: taxCode,
          metadata: { sku: line.sku, room: room.slice(0, 400) },
        },
      },
    };
  });
}
