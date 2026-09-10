import { cabinetCatalog, contractorPrice, flattenSkus, listPrice } from "../../utils/cabinets";
import { CATALOG_SECTIONS } from "../../utils/catalog-categories";

/** Full priced catalog for one finish — client filters search/category for live typing. */
export default defineEventHandler((event) => {
  requireContractor(event);
  const query = getQuery(event);
  const finish = String(query.finish || cabinetCatalog().finish_options[0]);

  const rows = flattenSkus();

  return {
    source: cabinetCatalog().msrp_source,
    finishes: cabinetCatalog().finish_options,
    finish,
    discount: 0.2,
    sections: CATALOG_SECTIONS,
    groups: CATALOG_SECTIONS.flatMap((section) =>
      section.groups.map((g) => ({
        id: g.id,
        name: g.name,
        section: section.name,
      })),
    ),
    items: rows
      .map((row) => {
        const list = listPrice(row.option, finish);
        const net = contractorPrice(row.option, finish);
        if (list == null || net == null) return null;
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
});
