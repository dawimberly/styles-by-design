import { cabinetCatalog, contractorPrice, flattenSkus, listPrice } from "../../utils/cabinets";
import { CATALOG_SECTIONS, matchesCatalogGroup } from "../../utils/catalog-categories";

export default defineEventHandler((event) => {
  requireContractor(event);
  const query = getQuery(event);
  const finish = String(query.finish || cabinetCatalog().finish_options[0]);
  const search = String(query.q || "").trim().toLowerCase();
  const group = String(query.group || "");

  let rows = flattenSkus();
  if (group) rows = rows.filter((row) => matchesCatalogGroup(row.groupId, group));
  if (search) {
    rows = rows.filter(
      (row) =>
        row.sku.toLowerCase().includes(search) ||
        row.name.toLowerCase().includes(search) ||
        row.groupName.toLowerCase().includes(search),
    );
  }

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
          list,
          net,
          save: Math.round((list - net) * 100) / 100,
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null),
  };
});
