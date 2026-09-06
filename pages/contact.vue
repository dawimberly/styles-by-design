<template>
  <PageHeader subtitle="Contact" title="Tell us about the room you want next." />

  <div class="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-5">
    <aside class="md:col-span-2 space-y-6">
      <p class="text-lg text-ink/75">Free consults. We typically reply the same business day.</p>
      <a :href="SITE.phoneHref" class="block font-serif text-4xl text-moss">{{ SITE.phone }}</a>
      <p class="text-ink/70">{{ SITE.city }} and nearby Hill Country towns.</p>
    </aside>

    <form class="md:col-span-3 space-y-5 rounded-2xl bg-white p-8 shadow-sm" @submit.prevent="submit">
      <div>
        <label class="text-sm font-medium" for="name">Name</label>
        <input id="name" v-model="name" required class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3" />
      </div>
      <div>
        <label class="text-sm font-medium" for="email">Email</label>
        <input id="email" v-model="email" type="email" required class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3" />
      </div>
      <div>
        <label class="text-sm font-medium" for="phone">Phone</label>
        <input id="phone" v-model="phone" class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3" />
      </div>
      <div>
        <label class="text-sm font-medium" for="message">Project</label>
        <textarea id="message" v-model="message" rows="5" required class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3" />
      </div>
      <p v-if="status === 'ok'" class="text-moss">Thanks — we will be in touch shortly.</p>
      <p v-else-if="status === 'err'" class="text-red-700">Could not send. Call us or try again.</p>
      <button type="submit" class="rounded-full bg-ink px-6 py-3 text-cream" :disabled="status === 'sending'">
        {{ status === "sending" ? "Sending…" : "Send message" }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
const name = ref("");
const email = ref("");
const phone = ref("");
const message = ref("");
const status = ref<"idle" | "sending" | "ok" | "err">("idle");

async function submit() {
  status.value = "sending";
  try {
    await $fetch("/api/contact", {
      method: "POST",
      body: { name: name.value, email: email.value, phone: phone.value, message: message.value },
    });
    name.value = email.value = phone.value = message.value = "";
    status.value = "ok";
  } catch {
    status.value = "err";
  }
}

useSeoMeta({
  title: "Contact",
  description: `Request a free consultation with ${SITE.name} in ${SITE.city}.`,
});
</script>
