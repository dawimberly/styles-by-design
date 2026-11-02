import { cabinetCatalog } from "../../utils/cabinets";
import { referralPartnerList } from "../../utils/catalog-view";

/** Finish names and partner rates for the staff invoice form. No prices. */
export default defineEventHandler(() => {
  return {
    finishes: cabinetCatalog().finish_options,
    partners: referralPartnerList(),
  };
});
