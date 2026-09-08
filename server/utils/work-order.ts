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
  skuLines: string;
  statusLabel?: string;
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
        trade_total: order.total,
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
