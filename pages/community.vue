<template>
  <PageHeader subtitle="Community" title="We donate the labor. We are looking for partners." />

  <section class="mx-auto max-w-6xl px-4 py-16">
    <p class="max-w-3xl text-lg leading-relaxed text-ink/80">
      If you run a group home, work with CASA, or serve military families, first responders, or educators in San Antonio,
      we want to work with you. Styles by Design will design the room and give the labor. What we need next is a partner
      on materials — grants, donations, churches, civic groups, vendors who will gift boxes and finishes.
    </p>
    <p class="mt-4 max-w-3xl text-lg leading-relaxed text-ink/80">
      A free crew does not finish a kitchen by itself. Cabinets, counters, and fixtures still have to be paid for. Bring
      the house. Bring a grant. Bring a donor. We will show up with the plan and the labor.
    </p>

    <div class="mt-12 grid gap-6 md:grid-cols-3">
      <article class="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-sand">
        <h2 class="font-serif text-2xl">What we put in</h2>
        <p class="mt-3 text-ink/75 leading-relaxed">
          Design, the cabinet takeoff, and free labor for community houses we take on. Service families also get a
          discount on design and on the stock cabinets we sell when the job is a paid remodel.
        </p>
      </article>
      <article class="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-sand">
        <h2 class="font-serif text-2xl">What a partner puts in</h2>
        <p class="mt-3 text-ink/75 leading-relaxed">
          Grants. Cash donations. Gifted cabinets or counters. A church or civic group that will cover the material list.
          An organization that already has funding and needs a studio and a crew that will work for the house, not the
          invoice.
        </p>
      </article>
      <article class="rounded-2xl bg-white p-7 shadow-sm ring-1 ring-sand">
        <h2 class="font-serif text-2xl">Who this is for</h2>
        <p class="mt-3 text-ink/75 leading-relaxed">
          Group homes. CASA and child-advocacy houses. Military, veterans, first responders, and educators. Mentoring and
          training on the work is part of the offer — so the kitchen stays useful after we leave.
        </p>
      </article>
    </div>
  </section>

  <section class="bg-sand/40 py-16">
    <div class="mx-auto max-w-6xl px-4 md:grid md:grid-cols-2 md:gap-12">
      <div>
        <p class="text-sm uppercase tracking-[0.28em] text-moss">Partnership</p>
        <h2 class="mt-3 font-serif text-4xl">Grants, donations, and the material list</h2>
        <p class="mt-4 text-lg leading-relaxed text-ink/80">
          If you write grants, sit on a foundation board, own a product line, or know a donor who wants a kitchen in a
          house that needs one — that is the partnership we are asking for. We will price the takeoff in plain numbers
          so a grant application or a gift has something solid to attach to.
        </p>
        <p class="mt-4 text-lg leading-relaxed text-ink/80">
          If you already have the materials funded, even better. Send the house. We will design it and put labor on it.
        </p>
      </div>
      <div class="mt-10 space-y-4 text-ink/80 md:mt-0">
        <h3 class="font-serif text-2xl text-ink">A working split</h3>
        <ul class="list-disc space-y-2 pl-5 leading-relaxed">
          <li>We donate design and labor.</li>
          <li>A partner funds or gifts the cabinets, counters, and fixtures.</li>
          <li>We train people on site so the house can keep the room.</li>
          <li>We stay small and take houses we can finish — one partnership at a time.</li>
        </ul>
      </div>
    </div>
  </section>

  <section id="ask" class="mx-auto max-w-6xl px-4 py-16">
    <div class="grid gap-12 md:grid-cols-5">
      <aside class="md:col-span-2 space-y-5">
        <p class="text-sm uppercase tracking-[0.28em] text-moss">Start a partnership</p>
        <h2 class="font-serif text-4xl">Tell us about the house — or the grant</h2>
        <p class="text-lg leading-relaxed text-ink/75">
          Homes, CASA programs, donors, and grant writers can use this form. Regular paid consults still go through
          <NuxtLink to="/contact" class="text-moss hover:underline">Contact</NuxtLink>.
        </p>
        <p class="text-sm leading-relaxed text-ink/65">
          Name the organization, the neighborhood, the room, and whether materials are funded or you want to raise them
          with us.
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
            <label class="text-sm font-medium" for="kind">I am reaching out as *</label>
            <select id="kind" v-model="kind" name="kind" required class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3">
              <option disabled value="">Choose one</option>
              <option>Group home looking for free labor</option>
              <option>CASA or child-advocacy program</option>
              <option>Military, veteran, first responder, or educator</option>
              <option>Grant writer or foundation</option>
              <option>Donor or civic / church partner</option>
              <option>Vendor who can gift materials</option>
              <option>Something else — partnership</option>
            </select>
          </div>
          <div>
            <label class="text-sm font-medium" for="funded">Materials</label>
            <select id="funded" v-model="funded" name="materials_funded" class="mt-1 w-full rounded-lg border border-sand bg-cream px-4 py-3">
              <option value="">Not sure yet</option>
              <option>Already funded — we need labor and design</option>
              <option>Partly funded</option>
              <option>We want to pursue a grant or donations together</option>
              <option>I can donate or gift product</option>
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
              placeholder="The house, the room, the grant or gift you have in mind, timing."
            />
          </div>
          <button type="submit" class="rounded-full bg-ink px-6 py-3 text-cream">Start the partnership</button>
          <p class="text-center text-xs text-ink/50">
            Same inbox as consults, subject line “community partnership.”
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
    "Styles by Design donates labor for group homes, CASA, and service families in San Antonio, and seeks partners for grants and material donations.",
});
</script>
