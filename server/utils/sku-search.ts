import { describeSkuPlain } from "./sku-plain";

/** Synonym chains — each key expands like a Markov branch into alternate search words. */
const SYNONYM_CHAIN: Record<string, string[]> = {
  base: ["base", "bottom", "floor", "lower", "under-counter", "undercounter", "floor cabinet", "bottom cabinet"],
  wall: ["wall", "upper", "uppers", "overhead", "hanging", "above"],
  vanity: ["vanity", "bath", "bathroom", "powder", "powder room", "sink vanity", "bath cabinet"],
  pantry: ["pantry", "tall", "food storage", "broom", "utility tall", "floor to ceiling"],
  oven: ["oven", "wall oven", "double oven", "appliance tall"],
  drawer: ["drawer", "drawers", "pullout", "pull-out", "slide"],
  sink: ["sink", "kitchen sink", "wet", "cleanup"],
  farm: ["farm", "farmhouse", "apron", "apron-front", "farm sink"],
  corner: ["corner", "blind", "lazy", "susan", "lazy susan", "diagonal"],
  microwave: ["microwave", "micro", "over range microwave", "built-in microwave"],
  shelf: ["shelf", "shelves", "open shelf", "end shelf"],
  spice: ["spice", "spice rack", "seasoning"],
  wine: ["wine", "bottle", "bottle kit", "stemware"],
  false: ["false", "fake", "dummy", "false drawer", "faux drawer"],
  left: ["left", "lh", "lhinge", "left hinge", "left-hand"],
  right: ["right", "rh", "rhinge", "right hinge", "right-hand"],
  closet: ["closet", "wardrobe", "reach-in", "walk-in", "storage closet", "clothes"],
  door: ["door", "doors", "hinged"],
  panel: ["panel", "side panel", "end panel", "filler panel"],
  rod: ["rod", "hanging rod", "closet rod", "pole"],
  shoe: ["shoe", "shoes", "shoe shelf"],
  hood: ["hood", "range hood", "vent", "hood cabinet"],
  medicine: ["medicine", "medicine cabinet", "mirrored"],
  plate: ["plate", "plate rack", "dish rack"],
  glass: ["glass", "glass door", "display"],
  entertainment: ["entertainment", "media", "tv", "av"],
  island: ["island", "peninsula"],
  filler: ["filler", "spacer", "gap", "shim"],
  raised: ["raised", "raised panel", "cathedral"],
  shaker: ["shaker", "flat panel"],
  deep: ["deep", "depth", "deeper"],
  tall: ["tall", "full height", "floor to ceiling"],
  double: ["double", "dual", "two sink", "his and hers"],
  center: ["center", "centred", "middle"],
  side: ["side", "offset"],
  knee: ["knee", "knee drawer", "sink cover", "false front"],
  unit: ["unit", "tower", "carcass", "box"],
  upgrade: ["upgrade", "accessory", "option", "add-on"],
  led: ["led", "light", "lighting", "illuminated"],
  hanging: ["hanging", "hang", "low hang", "high hang", "double hang"],
  bridge: ["bridge", "cubby", "bridge cabinet"],
};

const FAMILY_HINTS: { test: RegExp; tags: string[] }[] = [
  { test: /^B\d{2}(-FD)?$/, tags: ["base", "kitchen"] },
  { test: /^DB\d{2}-3$/, tags: ["base", "drawer", "kitchen"] },
  { test: /^SB\d{2}$/, tags: ["base", "sink", "kitchen"] },
  { test: /^FSB\d{2}$/, tags: ["base", "sink", "farm", "kitchen"] },
  { test: /^NCSB\d{2}$/, tags: ["base", "sink", "kitchen"] },
  { test: /^BBC\d{2}$/, tags: ["base", "corner", "blind", "kitchen"] },
  { test: /^LS/, tags: ["base", "corner", "lazy", "susan", "kitchen"] },
  { test: /^BM\d{2}$/, tags: ["base", "microwave", "kitchen"] },
  { test: /^BES/, tags: ["base", "shelf", "end", "kitchen"] },
  { test: /^BEA/, tags: ["base", "corner", "angle", "kitchen"] },
  { test: /^BSR/, tags: ["base", "spice", "kitchen"] },
  { test: /^BWBK/, tags: ["base", "wine", "bottle", "kitchen"] },
  { test: /^BSK/, tags: ["closet", "sink", "drawer"] },
  { test: /^WP/, tags: ["pantry", "tall", "kitchen"] },
  { test: /^OC/, tags: ["oven", "tall", "kitchen"] },
  { test: /^OCDR/, tags: ["oven", "drawer", "tall", "kitchen"] },
  { test: /^ER/, tags: ["entertainment", "tall"] },
  { test: /^VA/, tags: ["vanity", "bath", "bathroom"] },
  { test: /^VDB/, tags: ["vanity", "drawer", "bath", "bathroom"] },
  { test: /^KSC/, tags: ["vanity", "knee", "bath"] },
  { test: /^W\d/, tags: ["wall", "upper", "kitchen"] },
  { test: /^WES/, tags: ["wall", "shelf", "kitchen"] },
  { test: /^WBC/, tags: ["wall", "corner", "blind", "kitchen"] },
  { test: /^WM/, tags: ["wall", "microwave", "kitchen"] },
  { test: /^WDC/, tags: ["wall", "corner", "diagonal", "kitchen"] },
  { test: /^VH/, tags: ["wall", "hood", "kitchen"] },
  { test: /^WO/, tags: ["wall", "shelf", "kitchen"] },
  { test: /^PR/, tags: ["wall", "plate", "kitchen"] },
  { test: /^WGP/, tags: ["wall", "glass", "plate", "kitchen"] },
  { test: /^MC/, tags: ["medicine", "bath", "bathroom"] },
  { test: /^CL/, tags: ["closet", "wardrobe", "unit"] },
  { test: /^CB|^GT-CB/, tags: ["closet", "bridge"] },
  { test: /^S\d/, tags: ["closet", "shelf"] },
  { test: /^SS\d/, tags: ["closet", "shoe", "shelf"] },
  { test: /^SP/, tags: ["closet", "panel"] },
  { test: /^DR/, tags: ["closet", "door", "hanging"] },
  { test: /^D\d/, tags: ["closet", "drawer"] },
  { test: /^TF/, tags: ["closet", "unit", "tower"] },
  { test: /^HR/, tags: ["closet", "rod", "hanging"] },
  { test: /^OD-/, tags: ["closet", "door", "hanging"] },
  { test: /^TR/, tags: ["closet", "upgrade"] },
];

function uniq(values: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of values) {
    const v = String(raw || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function expandSynonyms(token: string): string[] {
  const key = token.toLowerCase().replace(/[^a-z0-9/-]+/g, "");
  const hit = SYNONYM_CHAIN[key];
  if (hit) return hit;
  // fuzzy key without punctuation
  const soft = token.toLowerCase().replace(/[^a-z]+/g, "");
  return SYNONYM_CHAIN[soft] || [token.toLowerCase()];
}

/** Markov-ish phrase variants: substitute each content word with synonym branches. */
function markovPhrases(phrase: string, maxVariants = 48): string[] {
  const tokens = phrase
    .toLowerCase()
    .replace(/[×]/g, "x")
    .split(/[^a-z0-9"]+/)
    .filter(Boolean);
  if (!tokens.length) return [];

  const branches = tokens.map((t) => {
    if (/^\d+"?$/.test(t) || t === "x") return [t];
    return expandSynonyms(t);
  });

  const out: string[] = [];
  const walk = (i: number, acc: string[]) => {
    if (out.length >= maxVariants) return;
    if (i >= branches.length) {
      out.push(acc.join(" "));
      return;
    }
    for (const choice of branches[i]) {
      walk(i + 1, [...acc, choice]);
      if (out.length >= maxVariants) return;
    }
  };
  walk(0, []);
  return out;
}

function dimensionTerms(sku: string): string[] {
  const s = sku.toUpperCase();
  const nums = [...s.matchAll(/(\d{2,3})/g)].map((m) => Number(m[1]));
  const terms: string[] = [];
  for (const n of nums) {
    if (!Number.isFinite(n) || n < 6 || n > 120) continue;
    terms.push(
      String(n),
      `${n}"`,
      `${n} inch`,
      `${n} inches`,
      `${n}-inch`,
      `${n}in`,
      `${n} in`,
    );
  }
  if (nums.length >= 2) {
    const [a, b] = nums;
    terms.push(`${a}x${b}`, `${a} x ${b}`, `${a}"x${b}"`, `${a} by ${b}`);
  }
  return terms;
}

function familyTerms(sku: string): string[] {
  const s = sku.toUpperCase();
  const tags: string[] = [];
  for (const rule of FAMILY_HINTS) {
    if (rule.test.test(s)) tags.push(...rule.tags);
  }
  const expanded = tags.flatMap((t) => expandSynonyms(t));
  return [...tags, ...expanded];
}

function bigrams(words: string[]): string[] {
  const out: string[] = [];
  for (let i = 0; i < words.length - 1; i++) out.push(`${words[i]} ${words[i + 1]}`);
  return out;
}

/**
 * Build a large searchable term set for one cabinet SKU.
 * Includes SKU fragments, dimensions, synonym chains, and Markov phrase variants.
 */
export function skuSearchTerms(input: {
  sku: string;
  name: string;
  groupId: string;
  groupName: string;
  closetGroup?: string | null;
}): string[] {
  const sku = input.sku;
  const plain = describeSkuPlain(sku) || "";
  const label = input.name || plain || sku;
  const category = input.groupName || input.groupId || "";

  const seedPhrases = uniq([
    plain,
    label,
    input.name,
    category,
    input.groupName,
    input.closetGroup || "",
    `${plain} ${category}`,
    `${label} cabinet`,
    `${label} cabinets`,
  ]);

  const markov = seedPhrases.flatMap((p) => markovPhrases(p));
  const words = uniq(
    seedPhrases
      .join(" ")
      .toLowerCase()
      .split(/[^a-z0-9"]+/)
      .filter((w) => w.length > 1),
  );

  return uniq([
    sku,
    sku.toLowerCase(),
    sku.replace(/-/g, ""),
    sku.replace(/-/g, " "),
    ...sku.split(/[-_/]/),
    ...dimensionTerms(sku),
    ...familyTerms(sku),
    ...seedPhrases,
    ...markov,
    ...words,
    ...words.flatMap((w) => expandSynonyms(w)),
    ...bigrams(words),
    // common contractor shorthand
    ...(familyTerms(sku).includes("base") ? ["b cabinet", "base cab", "basecab"] : []),
    ...(familyTerms(sku).includes("wall") ? ["w cabinet", "wall cab", "wallcab", "upper cab"] : []),
    ...(familyTerms(sku).includes("vanity") ? ["bath vanity", "bathroom vanity", "vanity cab"] : []),
    ...(familyTerms(sku).includes("pantry") ? ["tall pantry", "food pantry", "pantry cab"] : []),
  ]);
}

export function skuSearchBlob(input: {
  sku: string;
  name: string;
  groupId: string;
  groupName: string;
  closetGroup?: string | null;
}) {
  return skuSearchTerms(input).join(" | ");
}

/** Multi-word search: every token must appear somewhere in the blob. */
export function matchesSearchBlob(blob: string, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = blob.toLowerCase();
  if (hay.includes(q)) return true;
  const tokens = q.split(/[^a-z0-9"]+/).filter((t) => t.length > 1);
  if (!tokens.length) return hay.includes(q);
  return tokens.every((t) => hay.includes(t));
}
