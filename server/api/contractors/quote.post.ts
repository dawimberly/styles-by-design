import { INBOX } from "../../utils/inbox";
import { formatShipTo, verifyShipAddress } from "../../utils/address";
import { priceContractorLines, resolveFinish, lineTotalCents } from "../../utils/catalog-order";

export default defineEventHandler(async (event) => {
  requireContractor(event);
  const body = await readBody<{
    company?: string;
    name?: string;
    email?: string;
    phone?: string;
    finish?: string;
    notes?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    fulfillment?: "drop_ship" | "delivery";
    lines?: { sku: string; qty: number; roomLabel?: string }[];
  }>(event);

  if (!body?.company?.trim() || !body?.email?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Company and email are required." });
  }

  const finish = resolveFinish(body.finish);
  const priced = priceContractorLines(finish, body.lines);
  const verified = await verifyShipAddress({
    street: body.street || "",
    city: body.city || "",
    state: body.state || "",
    zip: body.zip || "",
  });

  const total = lineTotalCents(priced) / 100;
  const lines = priced
    .map((line) => {
      const room = line.roomLabel;
      const where = room ? `[${room}] ` : "";
      return `${where}${line.qty} × ${line.name} (${line.sku}) @ $${line.net.toFixed(2)}`;
    })
    .join("\n");
  const rooms = [...new Set(priced.map((line) => line.roomLabel).filter(Boolean))].join(", ");
  const shipTo = formatShipTo(verified);
  const fulfillment = body.fulfillment === "delivery" ? "Jobsite delivery" : "Drop-ship via Cabinets To Go account";

  const res = await $fetch<{ success?: string; message?: string }>(
    `https://formsubmit.co/ajax/${encodeURIComponent(INBOX)}`,
    {
      method: "POST",
      headers: { Accept: "application/json" },
      body: {
        _subject: "HOLD — Cabinets To Go dealer packet (pay SBD first)",
        _template: "table",
        _captcha: "false",
        dealer_account: "Styles by Design Cabinets To Go account",
        status: "Do not place on CTG until funds are confirmed",
        company: body.company,
        name: body.name || "",
        email: body.email,
        phone: body.phone || "",
        finish,
        fulfillment,
        ship_to: shipTo,
        address_verified: verified.matched,
        notes: body.notes || "",
        rooms: rooms || "(not labeled)",
        trade_total: `$${total.toFixed(2)}`,
        sku_lines: lines,
      },
    },
  );

  if (!res?.success && res?.message && /error/i.test(res.message)) {
    throw createError({ statusCode: 502, statusMessage: "Could not send the order packet." });
  }

  return {
    ok: true,
    total,
    message: `Packet sent to ${INBOX}. Pay Styles by Design; after funds clear we enter this on Cabinets To Go for ${fulfillment.toLowerCase()} to ${shipTo}.`,
  };
});
