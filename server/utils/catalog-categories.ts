/** Catalog dropdown sections — derived from SKU patterns, not raw JSON group blobs. */

export type CatalogGroup = {
  id: string;
  name: string;
};

export type CatalogSection = {
  id: string;
  name: string;
  groups: CatalogGroup[];
};

export const CATALOG_SECTIONS: CatalogSection[] = [
  {
    id: "kitchen",
    name: "Kitchen",
    groups: [
      { id: "base", name: "Base cabinets" },
      { id: "tall", name: "Tall, pantry & oven" },
      { id: "wall", name: "Wall cabinets" },
    ],
  },
  {
    id: "bath",
    name: "Bath",
    groups: [{ id: "vanity", name: "Vanities" }],
  },
  {
    id: "closet",
    name: "Closet",
    groups: [
      { id: "closet", name: "All closet" },
      { id: "closet-unit", name: "Closet units" },
      { id: "closet-shelf", name: "Shelves & rods" },
      { id: "closet-drawer", name: "Drawers & doors" },
      { id: "closet-panel", name: "Panels & upgrades" },
    ],
  },
];

export const CATALOG_GROUPS: CatalogGroup[] = CATALOG_SECTIONS.flatMap((s) => s.groups);

const CLOSET_GROUP_MAP: Record<string, string> = {
  "Closet unit": "closet-unit",
  "Closet shelf": "closet-shelf",
  "Closet drawer": "closet-drawer",
  "Closet door": "closet-drawer",
  "Closet LED panel": "closet-panel",
  "Closet upgrade": "closet-panel",
};

const GROUP_NAMES = Object.fromEntries(CATALOG_GROUPS.map((g) => [g.id, g.name]));

export function isClosetCatalogGroup(groupId: string) {
  return groupId === "closet" || groupId.startsWith("closet-");
}

/** Map a SKU (+ optional source JSON group / closet_group) to a catalog category id. */
export function catalogCategoryId(
  sku: string,
  sourceGroupId?: string,
  closetGroup?: string | null,
): string {
  const s = String(sku || "")
    .trim()
    .toUpperCase();

  if (sourceGroupId === "closet" || closetGroup) {
    if (closetGroup && CLOSET_GROUP_MAP[closetGroup]) return CLOSET_GROUP_MAP[closetGroup];
    return "closet-unit";
  }

  if (/^(VA|VDB|KSC)([-A-Z0-9]*)$/.test(s) || s.startsWith("VA-")) return "vanity";
  if (/^(WP|OC|OCDR|ER)\d/.test(s) || /^OCDR\d/.test(s)) return "tall";
  if (sourceGroupId === "wall" || /^W\d|^WES|^WBC|^WM|^WDC|^VH|^WO|^PR|^WGP|^MC|^(\d{2}).*WR$|^\d{2}GR$/.test(s)) {
    return "wall";
  }
  return "base";
}

export function catalogCategoryName(groupId: string) {
  return GROUP_NAMES[groupId] || groupId;
}

/** Filter helper: `closet` matches every closet-* id. */
export function matchesCatalogGroup(rowGroupId: string, filter: string) {
  if (!filter) return true;
  if (filter === "closet") return isClosetCatalogGroup(rowGroupId);
  return rowGroupId === filter;
}
