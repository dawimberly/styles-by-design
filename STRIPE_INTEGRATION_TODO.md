# Stripe Integration TODO

Single source of truth for remaining Checkout Studio setup on Styles by Design.

## Values to Replace

**Files containing placeholders / env values:**
- [server/api/contractors/checkout.post.ts](server/api/contractors/checkout.post.ts)
- [pages/contractors/catalog.vue](pages/contractors/catalog.vue)
- [.env.example](.env.example)

| Field | Current Value | What to Set |
|-------|--------------|-------------|
| mode | payment | Keep `payment` for one-time contractor cabinet orders. Use `subscription` only if you later sell recurring products. |
| line_items | Dynamic `price_data` from catalog SKUs | Already real trade prices from the cabinet catalog (not `price_...` placeholders). Replace only if you switch to Dashboard Price IDs. |
| STRIPE_PUBLISHABLE_KEY / NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY | empty | Add the Styles by Design `pk_test_...` (then `pk_live_...`) on Vercel + local `.env`. |
| STRIPE_SECRET_KEY | `rk_test_...` on Vercel | Styles by Design restricted key (`acct_1UCpLt3jR2iJiC6A`). Swap to `rk_live_...` for real payments. |
| NUXT_STRIPE_SECRET_KEY | same `rk_test_...` | Nuxt runtime override. Must always match `STRIPE_SECRET_KEY`. |
| STRIPE_WEBHOOK_SECRET | set in Vercel | Must match the webhook signing secret for `/api/contractors/stripe-webhook`. |

## Configured Parameters

These parameters were configured in Checkout Studio and are set in code.

**Files containing these parameters:**
- [server/api/contractors/checkout.post.ts](server/api/contractors/checkout.post.ts)
- [server/utils/stripe.ts](server/utils/stripe.ts)
- [pages/contractors/catalog.vue](pages/contractors/catalog.vue)

| Parameter | Value |
|-----------|-------|
| ui_mode | form |
| billing_address_collection | auto |
| phone_number_collection.enabled | false |
| automatic_tax.enabled | false |
| submit_type | auto |
| integration_identifier | custom_embedded_web_0001 |
| payment_method_collection | omitted (`mode` is `payment`, not `subscription`) |
| Stripe API version | `2026-03-25.dahlia; custom_checkout_payment_form_preview=v1` |
| Stripe.js | `https://js.stripe.com/dahlia/stripe.js` |
| beta | `custom_checkout_payment_form_1` |

## Going live (test mode today)

Everything below is currently **test mode**, so `4242 4242 4242 4242` works and no real money moves.
Live mode needs its own keys and its own webhook — nothing carries over from test.

1. Create a **live** restricted key with write on Checkout Sessions, Customers, Invoices, Invoice Items, Products, Prices, Webhook Endpoints.
2. Set `STRIPE_SECRET_KEY` and `NUXT_STRIPE_SECRET_KEY` to that `rk_live_...`.
3. Set `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to `pk_live_...`.
4. Create a **live-mode** webhook for `https://stylesbydesigntx.com/api/contractors/stripe-webhook` and store its `whsec_` in `STRIPE_WEBHOOK_SECRET`.
5. Redeploy Production, then confirm with one small real order (test cards stop working in live mode).

## Setup and next steps

1. Add `NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (or `STRIPE_PUBLISHABLE_KEY`) to Vercel for Production/Preview/Development, then redeploy.
2. Confirm webhook endpoint: `https://stylesbydesigntx.com/api/contractors/stripe-webhook`.
3. Test contractor checkout with card `4242 4242 4242 4242`.
4. Stripe Tax is **off** in this Studio config (`automatic_tax.enabled = false`). Re-enable later when SSN/EIN registration is ready.
5. Merge this branch after Preview verification; Production `master` still uses hosted Checkout until merge.
6. Optional: refund test payments in Stripe Dashboard (Test/Sandbox mode).

## How the integration works

1. Contractor builds a cart and verifies ship-to address.
2. `POST /api/contractors/checkout` creates a Checkout Session (`ui_mode: form`) and returns `client_secret`.
3. Catalog page loads Stripe.js (dahlia), calls `initCheckoutFormSdk`, mounts `#checkout-form`.
4. Customer confirms payment in the embedded form; Stripe redirects to `/contractors/paid`.
5. Webhook `checkout.session.completed` notifies staff for CTG / Divya fulfillment.

## Testing

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 9995`
- 3DS: `4000 0025 0000 3155`

## Resources

- https://support.stripe.com
- https://docs.stripe.com/mcp
- https://docs.stripe.com/checkout/form/quickstart
