<template>
  <PageHeader subtitle="Community" title="If you have the house, we will bring the labor." />

  <section class="mx-auto max-w-6xl px-4 py-16">
    <p class="max-w-3xl text-lg leading-relaxed text-ink/80">
      If you run a group home, work with CASA, or serve military families, first responders, or educators in San Antonio,
      this page is the start of a partnership. Styles by Design designs the kitchen or bath and donates the labor. We are
      looking for partners who will fund or gift the materials — grants, donations, churches, civic groups, and vendors.
    </p>

    <div class="mt-12 grid gap-6 md:grid-cols-2">
      <article class="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-sand">
        <p class="text-sm uppercase tracking-[0.2em] text-moss">If you run the house</p>
        <h2 class="mt-3 font-serif text-2xl">If the kitchen is the room that needs to work</h2>
        <p class="mt-3 text-ink/75 leading-relaxed">
          Send the house, the room, and photos. We will design it, write the cabinet takeoff, and put free labor on it.
          Mentoring on the work is part of the visit, so the people who live there can keep the room.
        </p>
      </article>
      <article class="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-sand">
        <p class="text-sm uppercase tracking-[0.2em] text-moss">If you fund the work</p>
        <h2 class="mt-3 font-serif text-2xl">If you have a grant, a gift, or product to give</h2>
        <p class="mt-3 text-ink/75 leading-relaxed">
          A material list with real numbers is what a grant or a donor can attach to. We will price the takeoff in plain
          language. You cover cabinets, counters, and fixtures. We cover design and labor.
        </p>
      </article>
      <article class="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-sand">
        <p class="text-sm uppercase tracking-[0.2em] text-moss">If you serve</p>
        <h2 class="mt-3 font-serif text-2xl">If you are military, first responder, or an educator</h2>
        <p class="mt-3 text-ink/75 leading-relaxed">
          Ask when you book a consult. We discount design and the stock cabinets we sell. Bring ID or a work email if you
          have it.
        </p>
      </article>
      <article class="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-sand">
        <p class="text-sm uppercase tracking-[0.2em] text-moss">If you write grants</p>
        <h2 class="mt-3 font-serif text-2xl">If you already know which house comes next</h2>
        <p class="mt-3 text-ink/75 leading-relaxed">
          Sit with us on the application. We will put a design, a takeoff, and donated labor on the page so the ask is
          concrete.
        </p>
      </article>
    </div>
  </section>

  <section class="bg-sand/40 py-16">
    <div class="mx-auto max-w-6xl px-4">
      <p class="text-sm uppercase tracking-[0.28em] text-moss">How a partnership looks</p>
      <h2 class="mt-3 font-serif text-4xl">If this sounds like your house, here is the split</h2>
      <ul class="mt-8 grid gap-4 md:grid-cols-3 text-ink/80">
        <li class="rounded-2xl bg-white p-6 shadow-sm">
          <h3 class="font-serif text-2xl">We give</h3>
          <p class="mt-2 leading-relaxed">Design, the cabinet list, free labor, and training on the work.</p>
        </li>
        <li class="rounded-2xl bg-white p-6 shadow-sm">
          <h3 class="font-serif text-2xl">A partner gives</h3>
          <p class="mt-2 leading-relaxed">A grant, a donation, gifted product, or a group ready to cover materials.</p>
        </li>
        <li class="rounded-2xl bg-white p-6 shadow-sm">
          <h3 class="font-serif text-2xl">The house gets</h3>
          <p class="mt-2 leading-relaxed">A kitchen or bath that can be used, and people on site who know how to keep it.</p>
        </li>
      </ul>
    </div>
  </section>

  <section id="ask" class="mx-auto max-w-6xl px-4 py-16">
    <div class="grid gap-12 md:grid-cols-5">
      <aside class="md:col-span-2 space-y-5">
        <p class="text-sm uppercase tracking-[0.28em] text-moss">If this fits</p>
        <h2 class="font-serif text-4xl">If you are ready to start, write us here</h2>
        <p class="text-lg leading-relaxed text-ink/75">
          Homes, CASA programs, donors, grant writers, and vendors. Paid design consults still go through
          <NuxtLink to="/contact" class="text-moss hover:underline">Contact</NuxtLink>.
        </p>
        <a :href="SITE.phoneHref" class="block font-serif text-3xl text-moss">{{ SITE.phone }}</a>
        <a :href="`mailto:${SITE.email}`" class="block text-ink/80 hover:text-moss">{{ SITE.email }}</a>
      </aside>

      <div class="md:col-span-3 rounded-2xl bg-white p-8 shadow-sm">
        <div v-if="sent" class="flex min-h-80 flex-col items-center justify-center text-center">
          <h2 class="font-serif text-3xl">Sent.</h2>
          <p class="mt-2 max-w-sm text-ink/70">We have the note and will get back to you.</p>
          <a :href="SITE.phoneHref" class="mt-6 text-moss">Call {{ SITE.phone }}</a>
        </div>
        <form
          v-else
          :action="`https://formsubmit.co/${encodeURIComponent(SITE.email)}`"
          method="POST"
          class="space-y-5"
          @submit="onSubmit"
        >
          <input type="hidden" name="_subject" :value="`${SITE.name} community partnership`" />
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
            <label class="text-sm font-medium" for="org">Organization, home, or funder</label>
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
            <label class="text-sm font-medium" for="kind">If you are reaching out as *</label>
            <select id="kind" v-model="kind" name="kind" required class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3">
              <option disabled value="">Choose one</option>
              <option>A group home</option>
              <option>CASA or child-advocacy</option>
              <option>Military, veteran, first responder, or educator</option>
              <option>A grant writer or foundation</option>
              <option>A donor, church, or civic partner</option>
              <option>A vendor who can gift materials</option>
              <option>A partner in another form</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium" for="funded">If materials are in the picture</label>
            <select id="funded" v-model="funded" name="materials_funded" class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3">
              <option value="">Still mapping this</option>
              <option>Funded — looking for design and labor</option>
              <option>Partly funded</option>
              <option>Ready to pursue a grant or donations together</option>
              <option>Ready to donate or gift product</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium" for="message">If you tell us one thing *</label>
            <textarea
              id="message"
              v-model="message"
              name="message"
              rows="6"
              required
              class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3"
              placeholder="The house, the room, the grant or gift, the timing."
            />
          </div>
          <button type="submit" class="rounded-full bg-ink px-6 py-3 text-cream">Start the partnership</button>
          <p class="text-center text-xs text-ink/50">Subject line “community partnership.”</p>
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
    "If you have the house, Styles by Design donates the labor. Looking for partners on grants and material donations for group homes, CASA, and service families in San Antonio.",
});
</script>
