import Stripe from "stripe";
import { notifyOrderAlert, notifyPaidAwaitingStaff } from "../../utils/work-order";
import { workOrderFromSession } from "../../utils/staff-orders";
import { stripeClient, stripeWebhookSecret } from "../../utils/stripe";

export default defineEventHandler(async (event) => {
  const stripe = stripeClient();
  const secret = stripeWebhookSecret();
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

  switch (parsed.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = parsed.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "unpaid") return { received: true };
      if ((session.metadata?.source || "styles-by-design") !== "styles-by-design") return { received: true };
      try {
        await fulfillPaidCheckout(stripe, session.id);
      } catch (error) {
        console.error("Paid checkout notification failed", error);
      }
      return { received: true };
    }
    case "checkout.session.async_payment_failed": {
      const session = parsed.data.object as Stripe.Checkout.Session;
      try {
        await notifyFailedCheckout(session);
      } catch (error) {
        console.error("Failed checkout notification failed", error);
      }
      return { received: true };
    }
    case "invoice.paid": {
      const invoice = parsed.data.object as Stripe.Invoice;
      if (invoice.metadata?.kind === "design_invoice" && !invoice.metadata?.staff_notified) {
        try {
          await notifyDesignInvoicePaid(stripe, invoice);
        } catch (error) {
          console.error("Design invoice notification failed", error);
        }
      }
      return { received: true };
    }
    default:
      return { received: true };
  }
});

async function fulfillPaidCheckout(stripe: Stripe, sessionId: string) {
  const full = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["line_items"] });
  if (full.payment_status === "unpaid") return;
  if (full.metadata?.staff_notified) return;

  await notifyPaidAwaitingStaff(workOrderFromSession(full));
  await stripe.checkout.sessions.update(sessionId, {
    metadata: {
      ...(full.metadata || {}),
      staff_notified: new Date().toISOString(),
    },
  });
}

async function notifyFailedCheckout(session: Stripe.Checkout.Session) {
  const meta = session.metadata || {};
  if (!meta.company) return;
  await notifyOrderAlert("PAYMENT FAILED — do not send to Divya", {
    paid: false,
    stripeSession: session.id,
    company: meta.company,
    name: meta.name || "",
    email: meta.email || session.customer_email || "",
    phone: meta.phone || "",
    finish: meta.finish || "",
    fulfillment: meta.fulfillment || "",
    shipTo: meta.ship_to || "",
    addressVerified: meta.address_verified || "",
    notes: `${meta.notes || ""}\n\nStripe async payment failed. Do not send to Divya.`.trim(),
    total: `$${((session.amount_total || 0) / 100).toFixed(2)}`,
    skuLines: "",
    statusLabel: "PAYMENT FAILED — do not place on Cabinets To Go",
  });
}

async function notifyDesignInvoicePaid(stripe: Stripe, invoice: Stripe.Invoice) {
  const email = invoice.metadata?.email || invoice.customer_email || "";
  await notifyOrderAlert("DESIGN INVOICE PAID", {
    paid: true,
    stripeSession: invoice.id,
    company: invoice.metadata?.company || "",
    name: invoice.metadata?.name || "",
    email,
    phone: invoice.metadata?.phone || "",
    finish: "",
    fulfillment: "Design invoice",
    shipTo: invoice.metadata?.ship_to || "",
    notes: invoice.metadata?.notes || invoice.description || "",
    total: `$${((invoice.amount_paid || 0) / 100).toFixed(2)}`,
    skuLines: invoice.hosted_invoice_url || "",
    statusLabel: "DESIGN INVOICE PAID",
  });
  await stripe.invoices.update(invoice.id, {
    metadata: {
      ...(invoice.metadata || {}),
      staff_notified: new Date().toISOString(),
    },
  });
}
