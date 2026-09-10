<template>
  <PageHeader subtitle="Trade" title="Contractor portal — verified trade buyers only" />
  <div class="mx-auto max-w-xl px-4 py-16">
    <p class="text-ink/75 leading-relaxed">
      Licensed remodelers and builders can order stock cabinets at 20% off published MSRP. Prices match the estimator
      list. This portal is separate from the public design site.
    </p>
    <p class="mt-4 text-ink/75 leading-relaxed">
      You must be verified before you receive a trade PIN. Contact Styles by Design with your company name and license
      info; once approved, we issue a PIN for catalog access.
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
    <p class="mt-6 text-sm text-ink/50">
      Need verification or a PIN? Call
      <a :href="SITE.phoneHref" class="text-moss hover:underline">{{ SITE.phone }}</a>
      or
      <NuxtLink to="/contact" class="text-moss hover:underline">request trade access</NuxtLink>.
    </p>
    <p class="mt-3 text-sm text-ink/50">
      Looking for install help instead?
      <a :href="SITE.preferredContractorUrl" class="text-moss hover:underline" target="_blank" rel="noreferrer">
        {{ SITE.preferredContractorCta }}
      </a>
    </p>
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
  description: "Verified trade buyers only. Request a PIN for stock cabinets at 20% off MSRP.",
});
</script>
