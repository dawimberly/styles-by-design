import { persistReferralCookie } from "../utils/referral-cookie";
import { lookupReferral } from "../utils/referrals";

/** Persist a known `?ref=` before the shop page renders. Unknown codes are ignored. */
export default defineEventHandler((event) => {
  const query = getQuery(event);
  const raw = Array.isArray(query.ref) ? query.ref[0] : query.ref;
  const partner = lookupReferral(raw);
  if (!partner) return;
  persistReferralCookie(event, partner);
});
