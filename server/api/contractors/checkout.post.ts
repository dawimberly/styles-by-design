type Line = { sku: string; qty: number; net: number; name: string };

export default defineEventHandler(async (event) => {
  requireContractor(event);
  const stripe = stripeClient();
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
    lines?: Line[];
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

  const origin = getRequestURL(event).origin;
  const shipTo = formatShipTo(verified);
  const fulfillment = body.fulfillment === "delivery" ? "Jobsite delivery" : "Drop-ship via Cabinets To Go account";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: body.email.trim(),
    success_url: `${origin}/contractors/paid?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/contractors/catalog`,
    metadata: {
      company: body.company.trim().slice(0, 400),
      name: (body.name || "").slice(0, 400),
      email: body.email.trim().slice(0, 400),
      phone: (body.phone || "").slice(0, 400),
      finish: (body.finish || "").slice(0, 400),
      fulfillment: fulfillment.slice(0, 400),
      ship_to: shipTo.slice(0, 500),
      address_verified: verified.matched.slice(0, 400),
      notes: (body.notes || "").slice(0, 500),
    },
    line_items: body.lines.map((line) => ({
      quantity: Math.max(1, Math.min(999, Math.floor(line.qty))),
      price_data: {
        currency: "usd",
        unit_amount: Math.round(line.net * 100),
        product_data: {
          name: `${line.name} (${line.sku})`.slice(0, 120),
        },
      },
    })),
  });

  if (!session.url) {
    throw createError({ statusCode: 502, statusMessage: "Stripe did not return a checkout URL." });
  }

  return { url: session.url };
});
