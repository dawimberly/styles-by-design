<template>
  <PageHeader subtitle="Community" title="We are building this on purpose." />

  <section class="mx-auto max-w-6xl px-4 py-16">
    <p class="max-w-3xl text-lg leading-relaxed text-ink/80">
      Styles by Design is a San Antonio studio. We design kitchens and baths, and we specify stock cabinets that can
      actually get built. This page is for the people we want more of our work to serve — military families, veterans,
      first responders, educators, CASA, and group homes.
    </p>
    <p class="mt-4 max-w-3xl text-lg leading-relaxed text-ink/80">
      Discounts are already part of how we work. The next chapter is bigger: donated labor where we can give it, money
      raised for materials, and training so the house stays useful after we leave. We are looking for the partners who
      want to grow that with us.
    </p>

    <div class="mt-12 grid gap-6 md:grid-cols-3">
      <article class="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-sand">
        <h2 class="font-serif text-2xl">Service families</h2>
        <p class="mt-3 text-ink/75 leading-relaxed">
          Military, veterans, first responders, and educators. Ask when you book. We discount design and the cabinets we
          sell. Bring ID or a work email if you have it — we would rather spend the visit on the room than on paperwork.
        </p>
      </article>
      <article class="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-sand">
        <h2 class="font-serif text-2xl">CASA</h2>
        <p class="mt-3 text-ink/75 leading-relaxed">
          Court-appointed advocates standing with children who need a stable home. If a kitchen or bath is part of that
          work, we want to hear about the house. Design help and cabinet pricing are on the table.
        </p>
      </article>
      <article class="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-sand">
        <h2 class="font-serif text-2xl">Group homes</h2>
        <p class="mt-3 text-ink/75 leading-relaxed">
          This is the work we want to grow. Heavy discounts. Donated labor when the calendar can hold it. A kitchen that
          the people living there can keep using. If you run a home, start the conversation here.
        </p>
      </article>
    </div>
  </section>

  <section class="bg-sand/40 py-16">
    <div class="mx-auto max-w-6xl px-4 md:grid md:grid-cols-2 md:gap-12">
      <div>
        <p class="text-sm uppercase tracking-[0.28em] text-moss">Where this is going</p>
        <h2 class="mt-3 font-serif text-4xl">Materials, mentors, more houses</h2>
        <p class="mt-4 text-lg leading-relaxed text-ink/80">
          Labor is only half a kitchen. Boxes, counters, and fixtures still cost real money. We want to help raise that
          money so a donated day on site is not wasted on an empty room.
        </p>
        <p class="mt-4 text-lg leading-relaxed text-ink/80">
          We also want to mentor and train people on the work — measure, hang, keep a finish clean — so the house does
          not depend on us coming back for every hinge. If you have a program, a home, or a crew that needs that, write
          us. We would rather start messy than wait for a polished foundation page.
        </p>
      </div>
      <div class="mt-10 space-y-4 text-ink/80 md:mt-0">
        <h3 class="font-serif text-2xl text-ink">How we want to show up</h3>
        <ul class="list-disc space-y-2 pl-5 leading-relaxed">
          <li>Design the room and produce a cabinet takeoff you can build from.</li>
          <li>Discount our design fee and the stock cabinets we sell.</li>
          <li>Give labor or cut it deep when a group home or CASA house is ready.</li>
          <li>Help raise money for materials so the plan does not stall at an empty box list.</li>
          <li>Train people on the work so the kitchen lasts.</li>
          <li>Stay a small studio that answers the phone — this grows house by house.</li>
        </ul>
      </div>
    </div>
  </section>

  <section id="ask" class="mx-auto max-w-6xl px-4 py-16">
    <div class="grid gap-12 md:grid-cols-5">
      <aside class="md:col-span-2 space-y-5">
        <p class="text-sm uppercase tracking-[0.28em] text-moss">Community form</p>
        <h2 class="font-serif text-4xl">Tell us about the house</h2>
        <p class="text-lg leading-relaxed text-ink/75">
          Use this form for community work. Regular kitchen consults still go through
          <NuxtLink to="/contact" class="text-moss hover:underline">Contact</NuxtLink>.
        </p>
        <p class="text-sm leading-relaxed text-ink/65">
          Organization or home name, neighborhood, which room, photos if you have them, and whether materials are
          funded. We read these and reply.
        </p>
        <a :href="SITE.phoneHref" class="block font-serif text-3xl text-moss">{{ SITE.phone }}</a>
        <a :href="`mailto:${SITE.email}`" class="block text-ink/80 hover:text-moss">{{ SITE.email }}</a>
      </aside>

      <div class="md:col-span-3 rounded-2xl bg-white p-8 shadow-sm">
        <div v-if="sent" class="flex min-h-80 flex-col items-center justify-center text-center">
          <h2 class="font-serif text-3xl">Sent.</h2>
          <p class="mt-2 max-w-sm text-ink/70">We have the community note and will get back to you.</p>
          <a :href="SITE.phoneHref" class="mt-6 text-moss">Call {{ SITE.phone }}</a>
        </div>
        <form
          v-else
          :action="`https://formsubmit.co/${encodeURIComponent(SITE.email)}`"
          method="POST"
          class="space-y-5"
          @submit="onSubmit"
        >
          <input type="hidden" name="_subject" :value="`${SITE.name} community ask`" />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="_captcha" value="false" />
          <input type="hidden" name="_next" :value="nextUrl" />
          <div class="hidden" aria-hidden="true">
            <label for="company">Company</label>
            <input id="company" v-model="honey" name="_honey" tabindex="-1" autocomplete="off" />
          </div>
          <div>
            <label class="text-sm font-medium" for="name">Your name *</label>
            <input id="name" v-model="name" name="name" required class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3" />
          </div>
          <div>
            <label class="text-sm font-medium" for="org">Organization or house name</label>
            <input id="org" v-model="org" name="organization" class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3" />
          </div>
          <div class="grid gap-5 sm:grid-cols-2">
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
          </div>
          <div>
            <label class="text-sm font-medium" for="kind">This ask is for *</label>
            <select id="kind" v-model="kind" name="kind" required class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3">
              <option disabled value="">Choose one</option>
              <option>Military, veteran, first responder, or educator — service discount</option>
              <option>CASA or child-advocacy related</option>
              <option>Group home — discount or donated labor</option>
              <option>Help raising money for materials</option>
              <option>Mentoring or training on the work</option>
              <option>Something else community-related</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium" for="funded">Are materials already funded?</label>
            <select id="funded" v-model="funded" name="materials_funded" class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3">
              <option value="">Not sure yet</option>
              <option>Yes — cabinets / finishes can be bought</option>
              <option>Partly</option>
              <option>No — we would need help with materials</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium" for="message">What is going on *</label>
            <textarea
              id="message"
              v-model="message"
              name="message"
              rows="6"
              required
              class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3"
              placeholder="Neighborhood, the room, who the house serves, timing, and photos you can email after if the form will not take them."
            />
          </div>
          <button type="submit" class="rounded-full bg-ink px-6 py-3 text-cream">Send the community note</button>
          <p class="text-center text-xs text-ink/50">
            Goes to the same inbox as consults, with the subject line “community ask.”
          </p>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const route = useRoute();
const sent = computed(() => route.query.sent === "1");
const nextUrl = ref(`${SITE.url}/community?sent=1`);
const name = ref("");
const org = ref("");
const email = ref("");
const phone = ref("");
const kind = ref("");
const funded = ref("");
const message = ref("");
const honey = ref("");

onMounted(() => {
  nextUrl.value = `${window.location.origin}/community?sent=1`;
});

function onSubmit(e: Event) {
  if (honey.value) {
    e.preventDefault();
    navigateTo("/community?sent=1");
  }
}

useSeoMeta({
  title: "Community",
  description:
    "Styles by Design is growing support for military families, first responders, educators, CASA, and group homes in San Antonio — discounts, donated labor, materials, and training.",
});
</script>
