import { formatShipTo, verifyShipAddress } from "../../utils/address";
import { CatalogPriceError, quoteCatalogLines, resolveFinish } from "../../utils/catalog-order";
import { formatSkuLines } from "../../utils/designer-call";
import { discountForChannel, formatDiscountLabel, lookupReferral } from "../../utils/referrals";
import { cabinetTaxCode, designTaxCode, findOrCreateCustomer, stripeClient } from "../../utils/stripe";

type LineInput = { sku?: string; qty?: number; roomLabel?: string };

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
    finish?: string;
    /** Partner code. The rate comes from the server map. Empty means retail list. */
    referral?: string;
    lines?: LineInput[];
  }>(event);

  const email = body?.email?.trim() || "";
  const company = body?.company?.trim() || "";
  const descriptionInput = body?.description?.trim() || "";
  const daysUntilDue = Math.min(90, Math.max(1, Math.floor(Number(body?.daysUntilDue) || 14)));
  const catalogLines = Array.isArray(body?.lines) ? body.lines.filter((line) => String(line?.sku || "").trim()) : [];

  if (!email || !company) {
    throw createError({ statusCode: 400, statusMessage: "Company and email are required." });
  }
  if (!catalogLines.length && !descriptionInput) {
    throw createError({ statusCode: 400, statusMessage: "Company, email, and description are required." });
  }

  let priced: ReturnType<typeof quoteCatalogLines> | null = null;
  let referralId = "";
  let referralName = "";
  let discountLabel = "";
  let discountRate = 0;
  let finish = "";
  if (catalogLines.length) {
    const code = (body?.referral || "").trim();
    if (code && !lookupReferral(code)) {
      throw createError({ statusCode: 400, statusMessage: `Unknown referral: ${code}` });
    }
    const channel = discountForChannel("retail", code);
    referralId = channel.referral?.id || "";
    referralName = channel.referral?.name || "";
    discountRate = channel.discount;
    discountLabel = formatDiscountLabel({
      discount: channel.discount.toFixed(2),
      channel: "retail",
      referral: referralId,
    });
    finish = resolveFinish(body?.finish);
    try {
      priced = quoteCatalogLines(finish, catalogLines, channel.discount);
    } catch (error) {
      if (error instanceof CatalogPriceError) {
        throw createError({ statusCode: 400, statusMessage: error.message });
      }
      throw error;
    }
  }

  const cents = priced
    ? priced.reduce((sum, line) => sum + Math.round(line.net * 100) * line.qty, 0)
    : Math.round(Number(body?.amount) * 100);
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
  const description = (
    descriptionInput ||
    (priced ? `Stock cabinets — ${company}` : "")
  ).slice(0, 350);
  const notes = [
    (body?.notes || "").trim(),
    priced ? `Priced on the server (${discountLabel}${finish ? `, ${finish}` : ""}).` : "",
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 500);
  const metadata = {
    kind: priced ? (referralId ? "referral_invoice" : "retail_invoice") : "design_invoice",
    source: "styles-by-design",
    channel: priced ? "retail" : "design",
    company: company.slice(0, 400),
    name: name.slice(0, 400),
    email: email.slice(0, 400),
    phone: phone.slice(0, 400),
    ship_to: shipTo.slice(0, 500),
    notes,
    finish: finish.slice(0, 400),
    referral: referralId,
    referral_name: referralName.slice(0, 400),
    discount: priced ? discountRate.toFixed(2) : "",
  };

  const customer = await findOrCreateCustomer(stripe, {
    email,
    name,
    company,
    phone,
    address: verified,
  });

  const footer = priced
    ? referralName
      ? `${referralName} partner cabinet invoice for Styles by Design. Sales tax is calculated by Stripe Tax where registered.`
      : "Retail cabinet invoice for Styles by Design. Sales tax is calculated by Stripe Tax where registered."
    : "Styles by Design — San Antonio interior design. Sales tax is calculated by Stripe Tax where registered.";

  const invoice = await stripe.invoices.create({
    customer: customer.id,
    collection_method: "send_invoice",
    days_until_due: daysUntilDue,
    automatic_tax: { enabled: true },
    description,
    footer,
    metadata,
  });

  if (priced) {
    const taxCode = cabinetTaxCode();
    for (const line of priced) {
      const room = line.roomLabel ? `${line.roomLabel} · ` : "";
      await stripe.invoiceItems.create({
        customer: customer.id,
        invoice: invoice.id,
        currency: "usd",
        amount: Math.round(line.net * 100) * line.qty,
        description: `${line.qty} × ${room}${line.name} (${line.sku})`.slice(0, 350),
        tax_behavior: "exclusive",
        tax_code: taxCode,
        metadata: { sku: line.sku, qty: String(line.qty), room: line.roomLabel.slice(0, 400) },
      });

    }
  } else {
    await stripe.invoiceItems.create({
      customer: customer.id,
      invoice: invoice.id,
      amount: cents,
      currency: "usd",
      description,
      tax_behavior: "exclusive",
      tax_code: designTaxCode(),
    });
  }

  const sent = await stripe.invoices.sendInvoice(invoice.id);
  return {
    ok: true,
    id: sent.id,
    status: sent.status,
    hostedInvoiceUrl: sent.hosted_invoice_url,
    invoicePdf: sent.invoice_pdf,
    total: `$${((sent.amount_due || cents) / 100).toFixed(2)}`,
    referral: referralName,
    discountLabel,
    skuLines: priced ? formatSkuLines(priced) : "",
  };
});
