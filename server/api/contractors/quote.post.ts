import { INBOX } from "../../utils/inbox";

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
    lines?: { sku: string; qty: number; net: number; name: string }[];
  }>(event);

  if (!body?.company?.trim() || !body?.email?.trim() || !body.lines?.length) {
    throw createError({ statusCode: 400, statusMessage: "Company, email, and at least one SKU are required." });
  }
  const verified = await verifyShipAddress({
    street: body.street || "",
    city: body.city || "",
    state: body.state || "",
    zip: body.zip || "",
  });

  const total = Math.round(body.lines.reduce((sum, line) => sum + line.net * line.qty, 0) * 100) / 100;
  const lines = body.lines
    .map((line) => `${line.qty} × ${line.sku} (${line.name}) @ $${line.net.toFixed(2)}`)
    .join("\n");
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
        finish: body.finish || "",
        fulfillment,
        ship_to: shipTo,
        address_verified: verified.matched,
        notes: body.notes || "",
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
