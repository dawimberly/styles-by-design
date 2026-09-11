export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/fonts"],
  css: ["~/assets/css/kitchen-plan.css"],
  fonts: {
    families: [
      { name: "Cormorant Garamond", provider: "google", weights: [500, 600, 700] },
      { name: "Outfit", provider: "google", weights: [300, 400, 500, 600, 700] },
    ],
  },
  runtimeConfig: {
    contractorPin: process.env.CONTRACTOR_PIN || "420420",
    employeePin: process.env.EMPLOYEE_PIN || process.env.CONTRACTOR_PIN || "420420",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
    stripeWebhookSecret:
      process.env.STRIPE_WEBHOOK_SECRET ||
      process.env.SIGNING_SECRET ||
      process.env.signing_secret ||
      "",
    stripeCabinetTaxCode: process.env.STRIPE_CABINET_TAX_CODE || "txcd_99999999",
    stripeDesignTaxCode: process.env.STRIPE_DESIGN_TAX_CODE || "txcd_20060022",
    ctgOrderEmail: process.env.CTG_ORDER_EMAIL || "divya@durastoneusa.com",
    public: {
      stripePublishableKey:
        process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || "",
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: "en" },
      link: [
        { rel: "icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      ],
      meta: [
        { name: "theme-color", content: "#1f2a24" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
    },
  },
});
