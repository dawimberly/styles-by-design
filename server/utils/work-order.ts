import { INBOX, ctgOrderInbox } from "./inbox";

export type WorkOrder = {
  paid: boolean;
  stripeSession?: string;
  company: string;
  name: string;
  email: string;
  phone: string;
  finish: string;
  fulfillment: string;
  shipTo: string;
  addressVerified?: string;
  notes: string;
  total: string;
  tax?: string;
  skuLines: string;
  statusLabel?: string;
  referral?: string;
};

async function sendForm(to: string, subject: string, order: WorkOrder) {
  const res = await $fetch<{ success?: string; message?: string }>(
    `https://formsubmit.co/ajax/${encodeURIComponent(to)}`,
    {
      method: "POST",
      headers: { Accept: "application/json" },
      body: {
        _subject: subject,
        _template: "table",
        _captcha: "false",
        dealer_account: "Styles by Design Cabinets To Go account",
        billing_note:
          "Customer already paid Styles by Design (Stripe). Place on CTG dealer account only — do not charge the jobsite customer. SBD keeps trade commission; CTG invoices the dealer account.",
        ctg_contact: ctgOrderInbox(),
        status:
          order.statusLabel ||
          (order.paid ? "FUNDS CONFIRMED — place this work order on Cabinets To Go" : "UNPAID"),
        stripe_session: order.stripeSession || "",
        company: order.company,
        name: order.name,
        email: order.email,
        phone: order.phone,
        finish: order.finish,
        fulfillment: order.fulfillment,
        ship_to: order.shipTo,
        address_verified: order.addressVerified || order.shipTo,
        notes: order.notes,
        referral: order.referral || "",
        trade_total_paid_to_sbd: order.total,
        sales_tax: order.tax || "",
        sku_lines: order.skuLines,
      },
    },
  );
  if (!res?.success && res?.message && /error/i.test(res.message)) {
    throw createError({ statusCode: 502, statusMessage: `Could not send work order to ${to}.` });
  }
}

export async function notifyPaidAwaitingStaff(order: WorkOrder) {
  await sendForm(INBOX, "PAID — confirm in staff portal, then send to Divya", {
    ...order,
    statusLabel: "PAID — waiting for staff to confirm funds and send to Divya",
    notes: `${order.notes}\n\nOpen /staff, confirm funds, then send to ${ctgOrderInbox()}.`.trim(),
  });
}

export async function notifyOrderAlert(subject: string, order: WorkOrder) {
  await sendForm(INBOX, subject, order);
}

export async function notifyDesignerCall(input: {
  company: string;
  name: string;
  email: string;
  phone: string;
  finish: string;
  shipTo: string;
  addressVerified: string;
  notes: string;
  referralName: string;
  referralId: string;
  discountLabel: string;
  total: string;
  skuLines: string;
}) {
  const subject = input.referralName
    ? `DESIGNER CALL — ${input.referralName} cabinet selections`
    : "DESIGNER CALL — retail cabinet selections";
  const res = await $fetch<{ success?: string; message?: string }>(
    `https://formsubmit.co/ajax/${encodeURIComponent(INBOX)}`,
    {
      method: "POST",
      headers: { Accept: "application/json" },
      body: {
        _subject: subject,
        _template: "table",
        _captcha: "false",
        status:
          "UNPAID — do not collect payment on the shop page. Call the customer, confirm fillers, toe kick, and baseboard, then invoice from /staff/invoices.",
        billing_note: input.referralId
          ? `Partner price (${input.discountLabel}). On /staff/invoices, price the final SKUs with partner code ${input.referralId}. The server applies the rate. Do not use the contractor 20% rate and do not type a client price.`
          : "No partner referral on this request. Invoice at retail list, or confirm a referral code before applying partner pricing.",
        referral: input.referralName || "none",
        referral_code: input.referralId || "",
        discount: input.discountLabel || "Retail price",
        company: input.company,
        name: input.name,
        email: input.email,
        phone: input.phone,
        finish: input.finish,
        ship_to: input.shipTo || "(collect on the call)",
        address_verified: input.addressVerified || "",
        notes: input.notes,
        selection_total_before_tax: input.total,
        sku_lines: input.skuLines,
      },
    },
  );
  if (!res?.success && res?.message && /error/i.test(res.message)) {
    throw createError({ statusCode: 502, statusMessage: "Could not send the designer-call request." });
  }
}

export async function sendOrderToDivya(order: WorkOrder) {
  const to = ctgOrderInbox();
  const packet = {
    ...order,
    statusLabel: "FUNDS CONFIRMED BY STAFF — place this work order on Cabinets To Go",
  };
  await sendForm(to, "PAID — Cabinets To Go work order (Styles by Design)", packet);
  if (to.toLowerCase() !== INBOX.toLowerCase()) {
    await sendForm(INBOX, "COPY — sent to Divya (Cabinets To Go work order)", packet);
  }
}
