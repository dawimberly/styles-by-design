<template>
  <div class="mx-auto max-w-xl px-4 py-24">
    <p class="text-sm uppercase tracking-[0.2em] text-moss">Order processing</p>
    <h1 class="mt-3 font-serif text-4xl">Payment received</h1>
    <p class="mt-6 text-lg text-ink/75 leading-relaxed">
      Stripe has the payment. Studio staff will confirm funds, then send the Cabinets To Go work order to Divya.
    </p>
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
useSeoMeta({ title: "Order processing" });
</script>
