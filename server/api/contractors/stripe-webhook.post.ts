import Stripe from "stripe";

export default defineEventHandler(async (event) => {
  const stripe = stripeClient();
  const secret = useRuntimeConfig().stripeWebhookSecret?.trim();
  if (!secret) {
    throw createError({ statusCode: 503, statusMessage: "STRIPE_WEBHOOK_SECRET is not set." });
  }

  const raw = await readRawBody(event);
  const signature = getHeader(event, "stripe-signature");
  if (!raw || !signature) {
    throw createError({ statusCode: 400, statusMessage: "Missing Stripe webhook body or signature." });
  }

  let parsed: Stripe.Event;
  try {
    parsed = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Invalid Stripe signature." });
  }

  if (parsed.type !== "checkout.session.completed") {
    return { ok: true };
  }

  const session = parsed.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") {
    return { ok: true };
  }

  const full = await stripe.checkout.sessions.retrieve(session.id, { expand: ["line_items"] });
  await notifyPaidAwaitingStaff(workOrderFromSession(full));
  return { ok: true };
});
