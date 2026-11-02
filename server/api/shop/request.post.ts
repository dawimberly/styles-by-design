import { formatShipTo, verifyShipAddress } from "../../utils/address";
import { priceCatalogLines, resolveFinish } from "../../utils/catalog-order";
import { designerCallSummary } from "../../utils/designer-call";
import { notifyDesignerCall } from "../../utils/work-order";
import { persistReferralCookie, referralFromCookie } from "../../utils/referral-cookie";
import { discountForChannel, lookupReferral } from "../../utils/referrals";

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
  /** Known partner code only. The discount rate is never read from the body. */
  ref?: string;
  lines?: { sku?: string; qty?: number; roomLabel?: string }[];
};

/**
 * Record a referred shopper's selections and ask staff to schedule a designer call.
 * Does not create a Stripe Checkout session.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<Body>(event);
  const name = (body?.name || "").trim();
  const email = (body?.email || "").trim();
  const phone = (body?.phone || "").trim();
  const company = (body?.company || "").trim() || name;

  if (!name || !email || !phone) {
    throw createError({ statusCode: 400, statusMessage: "Name, email, and phone are required." });
  }
  if (phone.replace(/\D/g, "").length < 7) {
    throw createError({ statusCode: 400, statusMessage: "Enter a phone number the designer can call." });
  }

  const partner = referralFromCookie(event) ?? lookupReferral(body?.ref);
  if (partner) persistReferralCookie(event, partner);
  const { discount, referral } = discountForChannel("retail", partner?.id);

  const finish = resolveFinish(body?.finish);
  const lines = priceCatalogLines(finish, body?.lines, discount);
  const summary = designerCallSummary({ referral, lines });

  let shipTo = [body?.street, body?.city, body?.state, body?.zip]
    .map((part) => (part || "").trim())
    .filter(Boolean)
    .join(", ");
  let addressVerified = "";
  if ((body?.street || "").trim() && (body?.zip || "").trim()) {
    try {
      const verified = await verifyShipAddress({
        street: body?.street || "",
        city: body?.city || "",
        state: body?.state || "",
        zip: body?.zip || "",
      });
      shipTo = formatShipTo(verified);
      addressVerified = verified.matched;
    } catch {
      addressVerified = "not verified";
    }
  }

  try {
    await notifyDesignerCall({
      company,
      name,
      email,
      phone,
      finish,
      shipTo,
      addressVerified,
      notes: (body?.notes || "").trim(),
      referralName: summary.referralName,
      referralId: summary.referralId,
      discountLabel: summary.discountLabel,
      total: summary.totalLabel,
      skuLines: summary.skuLines,
    });
  } catch (error) {
    console.error("Designer call request failed", error);
    throw createError({ statusCode: 502, statusMessage: "Could not send the request. Call the studio and we will take it down." });
  }

  return {
    ok: true,
    total: summary.total,
    referral: referral ? { id: referral.id, name: referral.name } : null,
    message: referral
      ? `Request sent at the ${summary.discountLabel} partner price. A designer will call ${phone} to confirm fillers, toe kick, and baseboard. Nothing is charged until the studio emails an invoice.`
      : `Request sent at retail list price. A designer will call ${phone}. Nothing is charged until the studio emails an invoice.`,
  };
});
