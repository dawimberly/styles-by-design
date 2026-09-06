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
    lines?: { sku: string; qty: number; net: number; name: string }[];
  }>(event);

  if (!body?.company?.trim() || !body?.email?.trim() || !body.lines?.length) {
    throw createError({ statusCode: 400, statusMessage: "Company, email, and at least one SKU are required." });
  }

  const total = Math.round(body.lines.reduce((sum, line) => sum + line.net * line.qty, 0) * 100) / 100;
  const lines = body.lines
    .map((line) => `${line.qty} × ${line.sku} (${line.name}) @ $${line.net.toFixed(2)}`)
    .join("\n");

  const res = await $fetch<{ success?: string; message?: string }>(
    `https://formsubmit.co/ajax/${encodeURIComponent(INBOX)}`,
    {
      method: "POST",
      headers: { Accept: "application/json" },
      body: {
        _subject: "Styles by Design contractor quote",
        _template: "table",
        _captcha: "false",
        company: body.company,
        name: body.name || "",
        email: body.email,
        phone: body.phone || "",
        finish: body.finish || "",
        notes: body.notes || "",
        total: `$${total.toFixed(2)}`,
        lines,
      },
    },
  );

  if (!res?.success && res?.message && /error/i.test(res.message)) {
    throw createError({ statusCode: 502, statusMessage: "Could not send the quote email." });
  }

  return {
    ok: true,
    total,
    message: `Quote sent to ${INBOX}. We will confirm stock and ship-to from the estimator list.`,
  };
});
