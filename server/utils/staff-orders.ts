import type Stripe from "stripe";
import type { WorkOrder } from "./work-order";

export function workOrderFromSession(full: Stripe.Checkout.Session): WorkOrder {
  const meta = full.metadata || {};
  const skuLines = (full.line_items?.data || [])
    .map((item) => `${item.quantity} × ${item.description} @ $${((item.amount_total || 0) / 100).toFixed(2)}`)
    .join("\n");
  return {
    paid: full.payment_status === "paid",
    stripeSession: full.id,
    company: meta.company || "",
    name: meta.name || "",
    email: meta.email || full.customer_email || "",
    phone: meta.phone || "",
    finish: meta.finish || "",
    fulfillment: meta.fulfillment || "Drop-ship via Cabinets To Go account",
    shipTo: meta.ship_to || "",
    addressVerified: meta.address_verified || "",
    notes: meta.notes || "",
    total: `$${((full.amount_total || 0) / 100).toFixed(2)}`,
    skuLines,
  };
}

export function orderSummary(full: Stripe.Checkout.Session) {
  const meta = full.metadata || {};
  return {
    id: full.id,
    paid: full.payment_status === "paid",
    total: `$${((full.amount_total || 0) / 100).toFixed(2)}`,
    email: meta.email || full.customer_email || "",
    company: meta.company || "",
    name: meta.name || "",
    phone: meta.phone || "",
    finish: meta.finish || "",
    fulfillment: meta.fulfillment || "",
    shipTo: meta.ship_to || "",
    addressVerified: meta.address_verified || "",
    notes: meta.notes || "",
    sentToDivya: meta.sent_to_divya || "",
    created: full.created,
  };
}
