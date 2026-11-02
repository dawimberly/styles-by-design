import { authCookieOptions } from "./auth-cookies";
import { REFERRAL_COOKIE, lookupReferral, type ReferralPartner } from "./referrals";

/** Returning shoppers keep partner pricing for 90 days after the referral link. */
export const REFERRAL_MAX_AGE = 60 * 60 * 24 * 90;

export function persistReferralCookie(event: Parameters<typeof setCookie>[0], partner: ReferralPartner) {
  setCookie(event, REFERRAL_COOKIE, partner.id, authCookieOptions(event, REFERRAL_MAX_AGE));
}

/** Checkout reads only this cookie. A price, percent, or ref in the POST body is ignored. */
export function referralFromCookie(event: Parameters<typeof getCookie>[0]): ReferralPartner | null {
  return lookupReferral(getCookie(event, REFERRAL_COOKIE));
}

/**
 * Catalog display: a valid `?ref=` wins so the first page paint matches the link.
 * An invalid `?ref=` does not erase a previously stored partner cookie.
 */
export function referralForRequest(event: Parameters<typeof getCookie>[0]): ReferralPartner | null {
  const query = getQuery(event);
  const raw = Array.isArray(query.ref) ? query.ref[0] : query.ref;
  if (typeof raw === "string" && raw.trim()) {
    const fromQuery = lookupReferral(raw);
    if (fromQuery) return fromQuery;
  }
  return referralFromCookie(event);
}
