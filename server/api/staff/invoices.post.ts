import { formatShipTo, verifyShipAddress } from "../../utils/address";
import { designTaxCode, findOrCreateCustomer, stripeClient } from "../../utils/stripe";

export default defineEventHandler(async (event) => {
  requireEmployee(event);
  const stripe = stripeClient();
  const body = await readBody<{
    company?: string;
    name?: string;
    email?: string;
    phone?: string;
    description?: string;
    amount?: number;
    daysUntilDue?: number;
    notes?: string;
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  }>(event);

  const email = body?.email?.trim() || "";
  const company = body?.company?.trim() || "";
  const description = body?.description?.trim() || "";
  const cents = Math.round(Number(body?.amount) * 100);
  const daysUntilDue = Math.min(90, Math.max(1, Math.floor(Number(body?.daysUntilDue) || 14)));

  if (!email || !company || !description) {
    throw createError({ statusCode: 400, statusMessage: "Company, email, and description are required." });
  }
  if (!Number.isFinite(cents) || cents < 100 || cents > 10_000_000) {
    throw createError({ statusCode: 400, statusMessage: "Amount must be between $1.00 and $100,000.00." });
  }

  const verified = await verifyShipAddress({
    street: body?.street || "",
    city: body?.city || "",
    state: body?.state || "",
    zip: body?.zip || "",
  });
  const shipTo = formatShipTo(verified);
  const name = (body?.name || "").trim();
  const phone = (body?.phone || "").trim();
  const metadata = {
    kind: "design_invoice",
    source: "styles-by-design",
    company: company.slice(0, 400),
    name: name.slice(0, 400),
    email: email.slice(0, 400),
    phone: phone.slice(0, 400),
    ship_to: shipTo.slice(0, 500),
    notes: (body?.notes || "").slice(0, 500),
  };

  const customer = await findOrCreateCustomer(stripe, {
    email,
    name,
    company,
    phone,
    address: verified,
  });

  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: "send_invoice",
    days_until_due: daysUntilDue,
    automatic_tax: { enabled: true },
    description: description.slice(0, 350),
    footer: "Styles by Design — San Antonio interior design. Sales tax is calculated by Stripe Tax where registered.",
    metadata,
  });

  await stripe.invoiceItems.create({
    customer: customer.id,
    invoice: invoice.id,
    amount: cents,
    currency: "usd",
    description: description.slice(0, 350),
    tax_behavior: "exclusive",
    tax_code: designTaxCode(),
  });

  const sent = await stripe.invoices.sendInvoice(invoice.id);
  return {
    ok: true,
    id: sent.id,
    status: sent.status,
    hostedInvoiceUrl: sent.hosted_invoice_url,
    invoicePdf: sent.invoice_pdf,
    total: `$${((sent.amount_due || cents) / 100).toFixed(2)}`,
  };
});
