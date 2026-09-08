export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  modules: ["@nuxtjs/tailwindcss", "@nuxt/fonts"],
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
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
    ctgOrderEmail: process.env.CTG_ORDER_EMAIL || "dawimberly@gmail.com",
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
