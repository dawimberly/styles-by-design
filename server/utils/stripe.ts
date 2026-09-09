import Stripe from "stripe";

export function stripeClient() {
  const key = useRuntimeConfig().stripeSecretKey?.trim();
  if (!key) {
    throw createError({
      statusCode: 503,
      statusMessage: "Stripe is not connected. Add STRIPE_SECRET_KEY on Vercel.",
    });
  }
  return new Stripe(key);
}
