export default defineEventHandler(async (event) => {
  requireEmployee(event);
  const stripe = stripeClient();
  const listed = await stripe.checkout.sessions.list({ limit: 40, status: "complete" });
  const paid = listed.data.filter(
    (session) =>
      session.payment_status === "paid" &&
      Boolean(session.metadata?.company) &&
      (session.metadata?.source || "styles-by-design") === "styles-by-design",
  );
  return { orders: paid.map(orderSummary) };
});
