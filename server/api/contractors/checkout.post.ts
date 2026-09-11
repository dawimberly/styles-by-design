import { formatShipTo, verifyShipAddress } from "../../utils/address";
import { checkoutIdempotencyKey, checkoutLineItems, cabinetTaxCode, findOrCreateCustomer, stripeClient } from "../../utils/stripe";
import { priceContractorLines, resolveFinish } from "../../utils/catalog-order";

type Body = {
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
};

export default defineEventHandler(async (event) => {
  requireContractor(event);
  const stripe = stripeClient();
  const body = await readBody<Body>(event);

  if (!body?.company?.trim() || !body?.email?.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Company and email are required." });
  }

  const finish = resolveFinish(body.finish);
  const lines = priceContractorLines(finish, body.lines);
  const verified = await verifyShipAddress({
    street: body.street || "",
    city: body.city || "",
    state: body.state || "",
    zip: body.zip || "",
  });

  const origin = getRequestURL(event).origin;
  const shipTo = formatShipTo(verified);
  const fulfillment = body.fulfillment === "delivery" ? "Jobsite delivery" : "Drop-ship via Cabinets To Go account";
  const rooms = [...new Set(lines.map((line) => line.roomLabel).filter(Boolean))].join(", ");
  const company = body.company.trim();
  const email = body.email.trim();
  const name = (body.name || "").trim();
  const phone = (body.phone || "").trim();
  const metadata = {
    company: company.slice(0, 400),
    name: name.slice(0, 400),
    email: email.slice(0, 400),
    phone: phone.slice(0, 400),
    finish: finish.slice(0, 400),
    fulfillment: fulfillment.slice(0, 400),
    ship_to: shipTo.slice(0, 500),
    address_verified: verified.matched.slice(0, 400),
    notes: (body.notes || "").slice(0, 500),
    rooms: rooms.slice(0, 400),
    kind: "contractor_cabinets",
    source: "styles-by-design",
  };

  let session;
  try {
    const customer = await findOrCreateCustomer(stripe, {
      email,
      name,
      company,
      phone,
      address: verified,
    });

    session = await stripe.checkout.sessions.create(
      {
        // Checkout Studio fixed_by_ui
        ui_mode: "form",
        billing_address_collection: "auto",
        phone_number_collection: { enabled: false },
        automatic_tax: { enabled: false },
        submit_type: "auto",
        integration_identifier: "custom_embedded_web_0001",
        // sample_only — keep real contractor values (not placeholders)
        mode: "payment",
        line_items: checkoutLineItems(lines, cabinetTaxCode()),
        // Existing Styles by Design order context (not Studio-managed)
        customer: customer.id,
        customer_update: { address: "auto", name: "auto", shipping: "auto" },
        return_url: `${origin}/contractors/paid?session_id={CHECKOUT_SESSION_ID}`,
        metadata,
        invoice_creation: {
          enabled: true,
          invoice_data: {
            description: `Stock cabinets — ${company}`.slice(0, 350),
            footer: "Trade cabinet order for Styles by Design.",
            metadata,
          },
        },
        shipping_address_collection: { allowed_countries: ["US"] },
        payment_intent_data: {
          description: `Cabinets — ${company}`.slice(0, 350),
          metadata,
        },
      },
      { idempotencyKey: checkoutIdempotencyKey({ company, email, finish, fulfillment, shipTo, lines }) },
    );
  } catch (error) {
    console.error("Stripe checkout session failed", error);
    throw createError({ statusCode: 502, statusMessage: "Could not start Stripe checkout. Try again." });
  }

  if (!session.client_secret) {
    throw createError({ statusCode: 502, statusMessage: "Stripe did not return a checkout client secret." });
  }

  return { client_secret: session.client_secret, session_id: session.id };
});
