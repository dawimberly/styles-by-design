<template>
  <AppHero />

  <section class="mx-auto max-w-6xl px-4 py-20">
    <p class="text-sm uppercase tracking-[0.28em] text-moss">What we do</p>
    <h2 class="mt-3 font-serif text-4xl md:text-5xl">Spaces that work as well as they look.</h2>
    <div class="mt-12 grid gap-6 md:grid-cols-2">
      <NuxtLink
        v-for="card in services"
        :key="card.to"
        :to="card.to"
        class="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-sand"
      >
        <img :src="card.image" :alt="card.title" class="h-64 w-full object-cover transition duration-700 group-hover:scale-105" />
        <div class="p-6">
          <h3 class="font-serif text-2xl">{{ card.title }}</h3>
          <p class="mt-2 text-ink/70">{{ card.blurb }}</p>
          <span class="mt-4 inline-block text-sm font-medium text-moss">Learn more →</span>
        </div>
      </NuxtLink>
    </div>
  </section>

  <section class="bg-white py-20">
    <div class="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2">
      <div>
        <p class="text-sm uppercase tracking-[0.28em] text-moss">Cabinet finishes</p>
        <h2 class="mt-3 font-serif text-4xl">Cabinet finishes we specify</h2>
        <p class="mt-4 text-lg text-ink/75 leading-relaxed">
          Styles by Design designs the space and the cabinet takeoff — finishes locked before demo so the build stays
          clean.
        </p>
        <div class="mt-6 flex flex-wrap gap-4">
          <NuxtLink to="/gallery" class="inline-block text-moss">Browse finishes →</NuxtLink>
          <a :href="SITE.preferredContractorUrl" class="inline-block text-moss" target="_blank" rel="noreferrer">
            {{ SITE.preferredContractorCta }} →
          </a>
        </div>
      </div>
      <img
        :src="PHOTOS.kitchenHero"
        alt="Elegant white kitchen cabinetry"
        class="h-80 w-full rounded-2xl object-cover shadow-sm md:h-[28rem]"
      />
    </div>
  </section>

  <section class="bg-sand/40 py-20">
    <div class="mx-auto max-w-6xl px-4 md:grid-cols-2 md:grid md:items-center md:gap-12">
      <div>
        <p class="text-sm uppercase tracking-[0.28em] text-moss">Trade partners</p>
        <h2 class="mt-3 font-serif text-4xl">Contractor portal</h2>
        <p class="mt-4 text-lg text-ink/75 leading-relaxed">
          Licensed remodelers and builders can buy stock cabinets at 20% off MSRP. Access is separate from the public
          site: we verify your company first, then issue a trade PIN.
        </p>
        <div class="mt-8 flex flex-wrap gap-4">
          <NuxtLink to="/contact" class="rounded-full bg-ink px-6 py-3 font-medium text-cream">
            Request trade verification
          </NuxtLink>
          <NuxtLink to="/contractors" class="rounded-full border border-ink px-6 py-3 font-medium text-ink">
            Already have a PIN?
          </NuxtLink>
        </div>
      </div>
      <div class="mt-10 rounded-2xl bg-white p-8 shadow-sm md:mt-0">
        <ol class="list-decimal space-y-3 pl-5 text-ink/80">
          <li>Contact us with your company name and license info.</li>
          <li>We verify you are an active trade buyer.</li>
          <li>You receive a PIN for the contractor catalog.</li>
        </ol>
        <p class="mt-6 text-sm text-ink/55">
          Need install help instead?
          <a :href="SITE.preferredContractorUrl" class="text-moss hover:underline" target="_blank" rel="noreferrer">
            {{ SITE.preferredContractorCta }}
          </a>
        </p>
      </div>
    </div>
  </section>

  <section class="bg-sand/50 py-20">
    <div class="mx-auto max-w-6xl px-4">
      <h2 class="text-center font-serif text-4xl">Neighbors we work with</h2>
      <ul class="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        <li v-for="area in AREAS" :key="area" class="rounded-full bg-white px-4 py-3 text-center text-sm">
          {{ area }}
        </li>
      </ul>
    </div>
  </section>

  <section class="mx-auto max-w-6xl px-4 py-20">
    <h2 class="text-center font-serif text-4xl">What homeowners tell us</h2>
    <div class="mt-12 grid gap-6 md:grid-cols-3">
      <blockquote v-for="review in reviews" :key="review.name" class="rounded-2xl bg-white p-8 shadow-sm">
        <p class="text-ink/80 leading-relaxed">“{{ review.text }}”</p>
        <footer class="mt-6 text-sm font-medium text-moss">{{ review.name }} · {{ review.place }}</footer>
      </blockquote>
    </div>
  </section>

  <section class="bg-ink py-16 text-center text-cream">
    <h2 class="font-serif text-4xl">Ready to walk the space together?</h2>
    <p class="mx-auto mt-4 max-w-2xl text-cream/75">
      Free consultations. Military, veterans, first responders, and educators: ask about our discount.
      We support CASA. Group homes — contact us; we are open to deep discounts or donated labor, even while that
      program is still taking shape.
    </p>
    <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
      <NuxtLink to="/contact" class="inline-block rounded-full bg-brass px-8 py-3 font-medium text-ink">Book a consult</NuxtLink>
      <a
        :href="SITE.preferredContractorUrl"
        class="inline-block rounded-full border border-cream/40 px-8 py-3 font-medium text-cream hover:bg-cream/10"
        target="_blank"
        rel="noreferrer"
      >
        {{ SITE.preferredContractorCta }}
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
const services = [
  {
    title: "Kitchen design",
    blurb: "Layouts, finishes, lighting, and a full cabinet plan — built around how your kitchen actually gets used.",
    image: PHOTOS.kitchen,
    to: "/services/kitchen-remodeling",
  },
  {
    title: "Bath design",
    blurb: "Showers, tile, vanities, and a complete spec package, ready to build.",
    image: PHOTOS.bath,
    to: "/services/bath-remodeling",
  },
];

const reviews = [
  {
    name: "Sarah J.",
    place: "Alamo Heights",
    text: "They designed the kitchen like a real living room, not a showroom. Our GC used their cabinet list and the job moved.",
  },
  {
    name: "Michael C.",
    place: "Shavano Park",
    text: "Clear schedule, no surprises on finish, and they actually showed up when they said they would.",
  },
  {
    name: "Emma D.",
    place: "Stone Oak",
    text: "The 3D drawings made decisions easy. The cabinets fit the walls like they grew there.",
  },
];

useSeoMeta({
  title: `Custom interiors in ${SITE.city}`,
  description: SITE.tagline,
  ogTitle: SITE.name,
  ogDescription: SITE.tagline,
  ogImage: `${SITE.url}${PHOTOS.kitchen}`,
  ogUrl: SITE.url,
  twitterCard: "summary_large_image",
});
</script>
