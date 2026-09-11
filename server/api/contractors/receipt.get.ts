export default defineEventHandler(async (event) => {
  const id = String(getQuery(event).session_id || "").trim();
  if (!id.startsWith("cs_")) {
    throw createError({ statusCode: 400, statusMessage: "Missing checkout session." });
  }

  const stripe = stripeClient();
  const session = await stripe.checkout.sessions.retrieve(id, {
    expand: ["line_items", "invoice"],
  });
  if (session.payment_status === "unpaid") {
    throw createError({ statusCode: 409, statusMessage: "This checkout is not paid yet." });
  }

  const invoice =
    session.invoice && typeof session.invoice !== "string"
      ? session.invoice
      : null;

  return {
    id: session.id,
    paid: session.payment_status === "paid",
    subtotal: `$${((session.amount_subtotal || 0) / 100).toFixed(2)}`,
    tax: `$${((session.total_details?.amount_tax || 0) / 100).toFixed(2)}`,
    total: `$${((session.amount_total || 0) / 100).toFixed(2)}`,
    email: session.customer_email || session.metadata?.email || "",
    company: session.metadata?.company || "",
    invoiceUrl: invoice?.hosted_invoice_url || null,
  };
});
