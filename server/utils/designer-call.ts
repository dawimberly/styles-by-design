import { lineTotalCents, type PricedLine } from "./catalog-order";
import { formatDiscountLabel, type ReferralPartner } from "./referrals";

export function formatSkuLines(lines: PricedLine[]) {
  return lines
    .map((line) => {
      const room = line.roomLabel ? `[${line.roomLabel}] ` : "";
      return `${room}${line.qty} × ${line.name} (${line.sku}) @ $${line.net.toFixed(2)}`;
    })
    .join("\n");
}

/** Staff packet for a shopper who cannot pay on the public page. Totals come from priced lines only. */
export function designerCallSummary(input: { referral: ReferralPartner | null; lines: PricedLine[] }) {
  const totalCents = lineTotalCents(input.lines);
  const discount = input.referral?.discount ?? 0;
  return {
    selfCheckout: false as const,
    totalCents,
    total: totalCents / 100,
    totalLabel: `$${(totalCents / 100).toFixed(2)}`,
    referralId: input.referral?.id || "",
    referralName: input.referral?.name || "",
    discount,
    discountLabel: formatDiscountLabel({
      discount: discount.toFixed(2),
      channel: "retail",
      referral: input.referral?.id || "",
    }),
    skuLines: formatSkuLines(input.lines),
  };
}
