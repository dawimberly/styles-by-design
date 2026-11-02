import { CATALOG_SECTIONS } from "../../utils/catalog-categories";
import { cabinetCatalog, flattenSkus, listPrice } from "./cabinets";
import { applyListDiscount, REFERRAL_PARTNERS, type ReferralPartner } from "./referrals";

export function referralPartnerList() {
  return Object.values(REFERRAL_PARTNERS).map((partner) => ({
    id: partner.id,
    name: partner.name,
    discount: partner.discount,
  }));
}

/** Full priced catalog for one finish. `discount` is chosen by the caller, never by the browser. */
export function buildPricedCatalog(finish: string, discount: number, referral: ReferralPartner | null) {
  const rows = flattenSkus();
  return {
    source: cabinetCatalog().msrp_source,
    finishes: cabinetCatalog().finish_options,
    finish,
    discount,
    referral: referral ? { id: referral.id, name: referral.name } : null,
    partners: referralPartnerList(),
    sections: CATALOG_SECTIONS,
    groups: CATALOG_SECTIONS.flatMap((section) =>
      section.groups.map((group) => ({
        id: group.id,
        name: group.name,
        section: section.name,
      })),
    ),
    items: rows
      .map((row) => {
        const list = listPrice(row.option, finish);
        if (list == null) return null;
        const net = applyListDiscount(list, discount);
        return {
          sku: row.sku,
          name: row.name,
          groupId: row.groupId,
          groupName: row.groupName,
          closetGroup: row.option.closet_group || null,
          searchText: row.searchBlob,
          list,
          net,
          save: Math.round((list - net) * 100) / 100,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null),
  };
}
