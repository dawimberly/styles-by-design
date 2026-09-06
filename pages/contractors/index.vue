<template>
  <PageHeader subtitle="Trade" title="Contractor portal — discounted cabinets from our estimator list" />
  <div class="mx-auto max-w-xl px-4 py-16">
    <p class="text-ink/75 leading-relaxed">
      Licensed remodelers and builders can order Northville stock cabinets at 20% off published MSRP. Prices match the
      list already loaded in the Flip Fixer estimator.
    </p>
    <form class="mt-8 space-y-4 rounded-2xl bg-white p-8 shadow-sm" @submit.prevent="login">
      <label class="block text-sm font-medium" for="pin">Trade PIN</label>
      <input
        id="pin"
        v-model="pin"
        type="password"
        required
        class="w-full rounded-lg border border-sand bg-cream px-4 py-3"
      />
      <p v-if="error" class="text-red-700">{{ error }}</p>
      <button class="rounded-full bg-ink px-6 py-3 text-cream" type="submit">Enter catalog</button>
    </form>
    <p class="mt-6 text-sm text-ink/50">Need a PIN? Call {{ SITE.phone }} or use the contact form.</p>
  </div>
</template>

<script setup lang="ts">
const pin = ref("");
const error = ref("");

onMounted(async () => {
  const session = await $fetch<{ ok: boolean }>("/api/contractors/session", { credentials: "include" });
  if (session.ok) await navigateTo("/contractors/catalog");
});

async function login() {
  error.value = "";
  try {
    await $fetch("/api/contractors/login", {
      method: "POST",
      credentials: "include",
      body: { pin: pin.value },
    });
    await navigateTo("/contractors/catalog");
  } catch {
    error.value = "That PIN is not on the trade list.";
  }
}

useSeoMeta({
  title: "Contractor portal",
  description: "Trade pricing on stock cabinets from the Styles by Design estimator list.",
});
</script>
