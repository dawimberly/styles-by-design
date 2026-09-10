/** Turn Northville / estimator SKUs into short layman descriptions. */

function side(code: string) {
  if (code === "L") return "left";
  if (code === "R") return "right";
  return code.toLowerCase();
}

function inches(n: string | number) {
  return `${Number(n)}"`;
}

/**
 * Plain-English label for a stock SKU.
 * Returns null when the code is not recognized (caller keeps the raw name).
 */
export function describeSkuPlain(sku: string): string | null {
  const s = String(sku || "")
    .trim()
    .toUpperCase();
  if (!s) return null;

  let m: RegExpMatchArray | null;

  // Base cabinets
  if ((m = s.match(/^B(\d{2})-FD$/))) return `${inches(m[1])} base cabinet with a false drawer`;
  if ((m = s.match(/^B(\d{2})$/))) return `${inches(m[1])} base cabinet`;
  if ((m = s.match(/^DB(\d{2})-3$/))) return `${inches(m[1])} drawer base (3 drawers)`;
  if ((m = s.match(/^SB(\d{2})$/))) return `${inches(m[1])} sink base`;
  if ((m = s.match(/^FSB(\d{2})$/))) return `${inches(m[1])} farm / apron sink base`;
  if ((m = s.match(/^NCSB(\d{2})$/))) return `${inches(m[1])} no-center-stile sink base`;
  if ((m = s.match(/^BBC(\d{2})$/))) return `${inches(m[1])} blind base corner`;
  if ((m = s.match(/^LS(\d{2})$/))) return `${inches(m[1])} lazy Susan corner base`;
  if (s === "LS-120W") return `lazy Susan corner (120° / wide)`;
  if ((m = s.match(/^BM(\d{2})$/))) return `${inches(m[1])} microwave base`;
  if ((m = s.match(/^BES(\d{2})([LR])$/))) return `${inches(m[1])} base end shelf, ${side(m[2])}`;
  if ((m = s.match(/^BEA(\d{2})([LR])$/))) return `${inches(m[1])} base end angle, ${side(m[2])}`;
  if ((m = s.match(/^BSR(\d{2})$/))) return `${inches(m[1])} base spice rack`;
  if ((m = s.match(/^BWBK(\d{2})$/)))
    return `${inches(m[1])} base waste basket / trash pullout`;
  if ((m = s.match(/^BSK(\d{2})D$/))) return `${inches(m[1])} base sink cabinet with drawers`;

  // Tall / pantry / oven
  if ((m = s.match(/^WP(\d{2})(\d{2})(27)?$/))) {
    const door = m[3] ? ", raised-panel depth" : "";
    return `${inches(m[1])} × ${inches(m[2])} pantry${door}`;
  }
  if ((m = s.match(/^OC(\d{2})(\d{2})(27)?$/))) {
    const door = m[3] ? ", raised-panel depth" : "";
    return `${inches(m[1])} × ${inches(m[2])} oven cabinet${door}`;
  }
  if ((m = s.match(/^OCDR(\d{2})$/))) return `${inches(m[1])} oven cabinet drawer unit`;
  if ((m = s.match(/^ER(\d{2})(\d{2})$/))) return `${inches(m[1])} × ${inches(m[2])} entertainment / tall run`;

  // Vanity
  if (s === "VA-SIDE-SINK") return `vanity with side sink`;
  if (s === "VA-CENTER-SINK-6DR") return `vanity, center sink, 6 drawers`;
  if (s === "VA-DOUBLE-SINK-3DR") return `vanity, double sink, 3 drawers`;
  if ((m = s.match(/^VA(\d{2})$/))) return `${inches(m[1])} vanity`;
  if ((m = s.match(/^VA(\d{2})D([LR])$/))) return `${inches(m[1])} vanity drawers, ${side(m[2])}`;
  if ((m = s.match(/^VA(\d{2})DD$/))) return `${inches(m[1])} vanity double drawers`;
  if ((m = s.match(/^VA(\d{2})D$/))) return `${inches(m[1])} vanity with drawers`;
  if ((m = s.match(/^VDB(\d{2})-3$/))) return `${inches(m[1])} vanity drawer base (3 drawers)`;
  if ((m = s.match(/^KSC(\d{2})$/))) return `${inches(m[1])} knee / sink cover`;

  // Wall cabinets WwwHH
  if ((m = s.match(/^W(\d{2})(\d{2})$/))) return `${inches(m[1])} × ${inches(m[2])} wall cabinet`;
  if ((m = s.match(/^W(\d{2})(\d{2})(\d{2})$/)))
    return `${inches(m[1])} × ${inches(m[2])} wall cabinet (${inches(m[3])} deep)`;
  if ((m = s.match(/^WES(\d{2})(\d{2})$/))) return `${inches(m[1])} × ${inches(m[2])} wall end shelf`;
  if ((m = s.match(/^WBC(\d{2})(\d{2})$/))) return `${inches(m[1])} × ${inches(m[2])} wall blind corner`;
  if ((m = s.match(/^WM(\d{2})(\d{2})(\d{2})$/)))
    return `${inches(m[1])} × ${inches(m[2])} wall microwave cabinet (${inches(m[3])} deep)`;
  if ((m = s.match(/^WDC(\d{2})(\d{2})$/))) return `${inches(m[1])} × ${inches(m[2])} wall diagonal corner`;
  if ((m = s.match(/^WDC(\d{2})(\d{2})(\d{2})$/)))
    return `${inches(m[1])} × ${inches(m[2])} wall diagonal corner (${inches(m[3])} deep)`;
  if ((m = s.match(/^VH(\d{2})(\d{2})$/))) return `${inches(m[1])} × ${inches(m[2])} wall hood cabinet`;
  if ((m = s.match(/^WO(\d{2})(\d{2})$/))) return `${inches(m[1])} × ${inches(m[2])} wall open shelf`;
  if ((m = s.match(/^PR(\d{2})(\d{2})$/))) return `${inches(m[1])} × ${inches(m[2])} plate rack wall`;
  if (s === "WGP-RACK") return `wall glass / plate rack`;
  if ((m = s.match(/^MC(\d{2})(\d{2})$/))) return `${inches(m[1])} × ${inches(m[2])} medicine cabinet`;

  // Odd wall / glass codes
  if ((m = s.match(/^(\d{2})(\d{2})(\d{2})WR$/)))
    return `${inches(m[1])} × ${inches(m[2])} wall (${inches(m[3])} deep), glass / WR`;
  if ((m = s.match(/^(\d{2})GR$/))) return `${inches(m[1])} glass rail / glass door accessory`;

  // Closet
  if ((m = s.match(/^CL(\d{2})(\d{2})(\d{2})$/)))
    return `${inches(m[1])} × ${inches(m[2])} closet tower (${inches(m[3])} deep)`;
  if (s === "CL-BP9636") return `closet back panel 96" × 36"`;
  if (s === "CL-SAMPLE") return `closet finish sample`;
  if ((m = s.match(/^CB(\d{2})(\d{2})$/))) return `${inches(m[1])} × ${inches(m[2])} closet bridge / cubby`;
  if ((m = s.match(/^GT-CB(\d{2})(\d{2})$/))) return `${inches(m[1])} × ${inches(m[2])} closet bridge (glass top)`;
  if ((m = s.match(/^S(\d{2})$/))) return `${inches(m[1])} closet shelf`;
  if ((m = s.match(/^S(\d{2})(\d{2})$/))) return `${inches(m[1])} × ${inches(m[2])} closet shelf`;
  if ((m = s.match(/^S(\d{2})ER$/))) return `${inches(m[1])} closet shelf for entertainment run`;
  if ((m = s.match(/^SS(\d{2})$/))) return `${inches(m[1])} closet shoe shelf`;
  if ((m = s.match(/^SP(\d{2})(\d{2})$/))) return `${inches(m[1])} × ${inches(m[2])} closet side panel`;
  if ((m = s.match(/^SP-ER(\d{2})$/))) return `${inches(m[1])} closet side panel (entertainment)`;
  if (s === "SP-CB24") return `24" closet side panel (bridge)`;
  if ((m = s.match(/^DR(\d{2})([LH])(?:(\d{2}))?$/))) {
    const hang = m[2] === "L" ? "low" : "high";
    const deep = m[3] ? `, ${inches(m[3])} deep` : "";
    return `${inches(m[1])} closet door, ${hang} hang${deep}`;
  }
  if ((m = s.match(/^D(\d{2})(\d{2})$/))) return `${inches(m[1])} × ${inches(m[2])} closet drawer box`;
  if ((m = s.match(/^TF(\d)(\d{2})$/))) return `${m[1]}-tier closet tower, ${inches(m[2])} tall`;
  if ((m = s.match(/^HR(\d{2})$/))) return `${inches(m[1])} closet hanging rod`;
  if ((m = s.match(/^OD-(\d{2})([LH])(\d{2})$/))) {
    const hang = m[2] === "L" ? "low" : "high";
    return `${inches(m[1])} closet open door / divider, ${hang} hang, ${inches(m[3])} deep`;
  }
  if ((m = s.match(/^TR(\d{2})D$/))) return `${inches(m[1])} closet tie / pant rack with drawers`;

  return null;
}

/** Prefer plain English; keep useful style notes like (Shaker). */
export function catalogItemDescription(sku: string, rawName?: string | null, displayName?: string | null) {
  const plain = describeSkuPlain(sku);
  const raw = (rawName && rawName !== sku ? rawName : displayName && displayName !== sku ? displayName : "") || "";
  const style = (raw.match(/\(([^)]+)\)\s*$/) || [])[1];

  if (plain && style) return `${plain} (${style})`;
  if (plain) return plain;
  if (raw) return raw;
  return sku;
}
