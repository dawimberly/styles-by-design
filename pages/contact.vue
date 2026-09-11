<template>
  <PageHeader subtitle="Contact" title="Tell us about the room you want next." />

  <div class="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-5">
    <aside class="md:col-span-2 space-y-6">
      <p class="text-lg text-ink/75">Call or send photos of the space.</p>
      <a :href="SITE.phoneHref" class="block font-serif text-4xl text-moss">{{ SITE.phone }}</a>
      <a :href="`mailto:${SITE.email}`" class="block text-ink/80 hover:text-moss">Email Jon</a>
      <p class="text-ink/70">{{ SITE.city }} and nearby Hill Country towns.</p>
      <p class="text-sm leading-relaxed text-ink/65">
        Military, CASA, or a group home?
        <NuxtLink to="/community" class="text-moss hover:underline">Use the Community form</NuxtLink>
        so those notes are labeled.
      </p>
    </aside>

    <div class="md:col-span-3 rounded-2xl bg-white p-8 shadow-sm">
      <div v-if="sent" class="flex min-h-80 flex-col items-center justify-center text-center">
        <h2 class="font-serif text-3xl">Sent.</h2>
        <p class="mt-2 max-w-sm text-ink/70">We got your message and will get back to you.</p>
        <a :href="SITE.phoneHref" class="mt-6 text-moss">Call {{ SITE.phone }}</a>
      </div>
      <form
        v-else
        :action="`https://formsubmit.co/${encodeURIComponent(SITE.email)}`"
        method="POST"
        class="space-y-5"
        @submit="onSubmit"
      >
        <input type="hidden" name="_subject" :value="`${SITE.name} consult`" />
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_next" :value="nextUrl" />
        <div class="hidden" aria-hidden="true">
          <label for="company">Company</label>
          <input id="company" v-model="honey" name="_honey" tabindex="-1" autocomplete="off" />
        </div>
        <div>
          <label class="text-sm font-medium" for="name">Name *</label>
          <input id="name" v-model="name" name="name" required class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3" />
        </div>
        <div>
          <label class="text-sm font-medium" for="email">Email *</label>
          <input
            id="email"
            v-model="email"
            name="email"
            type="email"
            required
            class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3"
          />
        </div>
        <div>
          <label class="text-sm font-medium" for="phone">Phone</label>
          <input id="phone" v-model="phone" name="phone" type="tel" class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3" />
        </div>
        <div>
          <label class="text-sm font-medium" for="message">What's going on *</label>
          <textarea
            id="message"
            v-model="message"
            name="message"
            rows="5"
            required
            class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3"
            placeholder="Neighborhood, the room, when you want to start."
          />
        </div>
        <button type="submit" class="rounded-full bg-ink px-6 py-3 text-cream">Send it over</button>
        <p class="text-center text-xs text-ink/50">We reply by phone or email after you send.</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const sent = computed(() => route.query.sent === "1");
const nextUrl = ref(`${SITE.url}/contact?sent=1`);
const name = ref("");
const email = ref("");
const phone = ref("");
const message = ref("");
const honey = ref("");

onMounted(() => {
  nextUrl.value = `${window.location.origin}/contact?sent=1`;
});

function onSubmit(e: Event) {
  if (honey.value) {
    e.preventDefault();
    navigateTo("/contact?sent=1");
  }
}

useSeoMeta({
  title: "Contact",
  description: `Call ${SITE.name} at ${SITE.phone}. Design consults in ${SITE.city}.`,
});
</script>
