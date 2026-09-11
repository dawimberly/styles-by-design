# Styles by Design

Interior design studio site (San Antonio). Contractors buy discounted stock cabinets from the estimator price list.

## Contractor portal

PIN is `CONTRACTOR_PIN`. Open `/contractors`.

## Stripe (this site’s own account)

Payments, invoicing, and tax for Styles by Design use a **separate Stripe account** from [Paq'in Family House](https://github.com/dawimberly/dirty-ink) (`paqin-family-tattoo` on Vercel). Do not copy that project’s `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` here.

Keys stay in Vercel **sensitive** environment variables for **this** project. Prefer a [restricted API key](https://docs.stripe.com/keys.md#manage-your-api-keys) (`rk_`). Never commit keys.

Copy `.env.example` to `.env` locally:

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CABINET_TAX_CODE=txcd_99999999
STRIPE_DESIGN_TAX_CODE=txcd_20060022
```

`txcd_99999999` is **General - Tangible Goods** (stock cabinets). `txcd_20060022` is **Interior Decorating** (design invoices). Confirm both with a tax advisor: [product tax codes](https://docs.stripe.com/tax/tax-codes).

### Dashboard (required before tax collects)

Stripe Tax returns **$0 with no error** until you complete this on the Styles by Design Stripe account:

1. Tax → Settings: head office address (San Antonio).
2. Tax → Locations: add an active registration for every state you must collect in (typically Texas first). Ask your tax advisor; this is not legal advice.
3. Customer emails: enable successful payments so invoices/receipts send.
4. Developers → Webhooks: `https://stylesbydesigntx.com/api/contractors/stripe-webhook` (not the Paq'in `/api/stripe/webhook` URL) for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `invoice.paid`, `invoice.payment_failed`.

Staff can send hosted invoices from `/staff/invoices`.

## Local

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

- Site: https://styles-by-design.vercel.app
- Repo: https://github.com/dawimberly/styles-by-design
