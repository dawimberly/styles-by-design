import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { quoteCatalogLines } from "../server/utils/catalog-order";
import { designerCallSummary } from "../server/utils/designer-call";
import {
  applyListDiscount,
  discountForChannel,
  lookupReferral,
} from "../server/utils/referrals";

const catalog = JSON.parse(readFileSync(new URL("../server/data/cabinets.json", import.meta.url), "utf8")) as {
  groups: { base: { options: { sku: string; cost_by_finish: Record<string, number> }[] } };
};
const b12 = catalog.groups.base.options.find((option) => option.sku === "B12");
const list = b12?.cost_by_finish["Elegant White (Shaker)"];

test("flipfixer is 15% off list and unknown codes stay at retail", () => {
  assert.equal(list, 178);
  const partner = lookupReferral("FlipFixer");
  assert.equal(partner?.id, "flipfixer");
  assert.equal(partner?.name, "The Flip Fixer");
  assert.equal(partner?.discount, 0.15);
  assert.equal(applyListDiscount(list!, 0.15), 151.3);

  assert.equal(lookupReferral("nope"), null);
  assert.equal(lookupReferral("flipfixer/"), null);
  assert.equal(lookupReferral(""), null);
  const retail = discountForChannel("retail", "nope");
  assert.equal(retail.discount, 0);
  assert.equal(retail.referral, null);
  assert.equal(applyListDiscount(list!, retail.discount), list);
});

test("contractor trade price ignores a referral and does not stack", () => {
  const trade = discountForChannel("contractor", "flipfixer");
  assert.equal(trade.discount, 0.2);
  assert.equal(trade.referral, null);
  assert.equal(applyListDiscount(list!, trade.discount), 142.4);

  const partner = applyListDiscount(list!, 0.15);
  const stacked = applyListDiscount(142.4, 0.15);
  assert.equal(partner, 151.3);
  assert.notEqual(partner, stacked);
});

test("catalog pricing ignores a client unit price", () => {
  const lines = quoteCatalogLines(
    "Elegant White (Shaker)",
    [{ sku: "B12", qty: 2, roomLabel: "Kitchen 1", net: 1 } as { sku: string; qty: number; roomLabel: string }],
    0.15,
  );
  assert.equal(lines[0].net, 151.3);
  assert.equal(lines[0].qty, 2);
  assert.equal(lines[0].roomLabel, "Kitchen 1");

  const summary = designerCallSummary({
    referral: lookupReferral("flipfixer"),
    lines,
  });
  assert.equal(summary.selfCheckout, false);
  assert.equal(summary.total, 302.6);
  assert.equal(summary.referralId, "flipfixer");
  assert.equal(summary.discountLabel, "15% off retail");
  assert.match(summary.skuLines, /2 × .+ \(B12\) @ \$151\.30/);
});

test("a call request without a referral stays at list", () => {
  const lines = quoteCatalogLines("Elegant White (Shaker)", [{ sku: "B12", qty: 1 }], 0);
  assert.equal(lines[0].net, 178);
  const summary = designerCallSummary({ referral: null, lines });
  assert.equal(summary.referralId, "");
  assert.equal(summary.discountLabel, "Retail price");
  assert.equal(summary.total, 178);
});
