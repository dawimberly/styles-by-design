import { buildPricedCatalog } from "../../utils/catalog-view";
import { cabinetCatalog } from "../../utils/cabinets";
import { discountForChannel } from "../../utils/referrals";

/** Full priced catalog for one finish — client filters search/category for live typing. */
export default defineEventHandler((event) => {
  requireContractor(event);
  const query = getQuery(event);
  const finish = String(query.finish || cabinetCatalog().finish_options[0]);
  const { discount } = discountForChannel("contractor");
  return buildPricedCatalog(finish, discount, null);
});
