import { buildPricedCatalog } from "../../utils/catalog-view";
import { cabinetCatalog } from "../../utils/cabinets";
import { persistReferralCookie, referralForRequest } from "../../utils/referral-cookie";
import { discountForChannel } from "../../utils/referrals";

/** Public catalog. Partner pricing follows a known referral only. There is no checkout on this path. */
export default defineEventHandler((event) => {
  const query = getQuery(event);
  const finish = String(query.finish || cabinetCatalog().finish_options[0]);
  const partner = referralForRequest(event);
  if (partner) persistReferralCookie(event, partner);
  const { discount, referral } = discountForChannel("retail", partner?.id);
  return {
    ...buildPricedCatalog(finish, discount, referral),
    checkout: false as const,
  };
});

