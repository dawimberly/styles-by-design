export default defineEventHandler(async (event) => {
  requireEmployee(event);
  const body = await readBody<{ id?: string }>(event);
  const id = body?.id?.trim() || "";
  if (!id.startsWith("cs_")) {
    throw createError({ statusCode: 400, statusMessage: "Missing checkout session." });
  }

  const stripe = stripeClient();
  const full = await stripe.checkout.sessions.retrieve(id, { expand: ["line_items"] });
  if (full.payment_status !== "paid") {
    throw createError({ statusCode: 409, statusMessage: "Stripe has not marked this session paid." });
  }
  if (full.metadata?.sent_to_divya) {
    throw createError({ statusCode: 409, statusMessage: "This order was already sent to Divya." });
  }

  await sendOrderToDivya(workOrderFromSession(full));
  const sentAt = new Date().toISOString();
  await stripe.checkout.sessions.update(id, {
    metadata: {
      ...(full.metadata || {}),
      sent_to_divya: sentAt,
    },
  });
  return { ok: true, sentTo: ctgOrderInbox(), sentAt };
});
