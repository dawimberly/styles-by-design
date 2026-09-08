<template>
  <PageHeader subtitle="Staff" title="Employee login — confirm funds, then send to Divya" />
  <div class="mx-auto max-w-xl px-4 py-16">
    <p class="text-ink/75 leading-relaxed">
      Studio staff only. Confirm Stripe payment, then email the Cabinets To Go work order to Divya at Dura Stone.
    </p>
    <form class="mt-8 space-y-4 rounded-2xl bg-white p-8 shadow-sm" @submit.prevent="login">
      <label class="block text-sm font-medium" for="staff-pin">Staff PIN</label>
      <input
        id="staff-pin"
        v-model="pin"
        type="password"
        required
        class="w-full rounded-lg border border-sand bg-cream px-4 py-3"
      />
      <p v-if="error" class="text-red-700">{{ error }}</p>
      <button class="rounded-full bg-ink px-6 py-3 text-cream" type="submit">Open orders</button>
    </form>
  </div>
</template>

<script setup lang="ts">
const pin = ref("");
const error = ref("");

onMounted(async () => {
  const session = await $fetch<{ ok: boolean }>("/api/staff/session", { credentials: "include" });
  if (session.ok) await navigateTo("/staff/orders");
});

async function login() {
  error.value = "";
  try {
    await $fetch("/api/staff/login", {
      method: "POST",
      credentials: "include",
      body: { pin: pin.value },
    });
    await navigateTo("/staff/orders");
  } catch {
    error.value = "That staff PIN is not valid.";
  }
}

useSeoMeta({ title: "Staff login", robots: "noindex, nofollow" });
</script>
