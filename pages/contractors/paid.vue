<template>
  <div class="mx-auto max-w-xl px-4 py-24">
    <p class="text-sm uppercase tracking-[0.2em] text-moss">Order processing</p>
    <h1 class="mt-3 font-serif text-4xl">Payment received</h1>
    <p class="mt-6 text-lg text-ink/75 leading-relaxed">
      Stripe has the payment. Studio staff will confirm funds, then send the Cabinets To Go work order to Divya.
    </p>
    <dl v-if="receipt" class="mt-8 space-y-2 rounded-2xl bg-white p-6 shadow-sm text-ink/80">
      <div class="flex justify-between gap-4">
        <dt>Company</dt>
        <dd>{{ receipt.company }}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt>Subtotal</dt>
        <dd>{{ receipt.subtotal }}</dd>
      </div>
      <div class="flex justify-between gap-4">
        <dt>Tax</dt>
        <dd>{{ receipt.tax }}</dd>
      </div>
      <div class="flex justify-between gap-4 font-medium">
        <dt>Total paid</dt>
        <dd>{{ receipt.total }}</dd>
      </div>
      <div v-if="receipt.invoiceUrl" class="pt-2">
        <a :href="receipt.invoiceUrl" class="text-moss" target="_blank" rel="noreferrer">View Stripe invoice</a>
      </div>
    </dl>
    <ol class="mt-10 space-y-4 text-left text-ink/80">
      <li class="rounded-2xl bg-white p-4 shadow-sm">
        <p class="font-medium text-moss">1. Paid</p>
        <p class="mt-1 text-sm text-ink/70">Stripe confirmed the contractor payment to Styles by Design.</p>
      </li>
      <li class="rounded-2xl bg-white p-4 shadow-sm">
        <p class="font-medium">2. Staff confirmation</p>
        <p class="mt-1 text-sm text-ink/70">
          An employee logs in, checks the order, and sends the verified ship-to packet to Divya at Dura Stone.
        </p>
      </li>
      <li class="rounded-2xl bg-white p-4 shadow-sm">
        <p class="font-medium">3. Cabinets To Go processing</p>
        <p class="mt-1 text-sm text-ink/70">
          Divya enters the stock order for drop-ship or jobsite delivery. Tracking follows from CTG.
        </p>
      </li>
    </ol>
    <NuxtLink to="/contractors/catalog" class="mt-10 inline-block rounded-full bg-ink px-6 py-3 text-cream">
      Back to catalog
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
type Receipt = {
  company: string;
  subtotal: string;
  tax: string;
  total: string;
  invoiceUrl: string | null;
};

const route = useRoute();
const sessionId = computed(() => String(route.query.session_id || ""));
const { data: receipt } = await useFetch<Receipt>("/api/contractors/receipt", {
  query: computed(() => ({ session_id: sessionId.value })),
  immediate: sessionId.value.startsWith("cs_"),
  watch: false,
});

useSeoMeta({ title: "Order processing" });
</script>
