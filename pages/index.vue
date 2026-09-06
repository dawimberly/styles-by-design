<template>
  <AppHero />

  <section class="mx-auto max-w-6xl px-4 py-20">
    <p class="text-sm uppercase tracking-[0.28em] text-moss">What we do</p>
    <h2 class="mt-3 font-serif text-4xl md:text-5xl">Spaces that work as well as they look.</h2>
    <div class="mt-12 grid gap-6 md:grid-cols-3">
      <NuxtLink
        v-for="card in services"
        :key="card.to"
        :to="card.to"
        class="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-sand"
      >
        <img :src="card.image" :alt="card.title" class="h-52 w-full object-cover transition duration-500 group-hover:scale-105" />
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
        <p class="text-sm uppercase tracking-[0.28em] text-moss">Featured project</p>
        <h2 class="mt-3 font-serif text-4xl">Alamo Heights kitchen</h2>
        <p class="mt-4 text-lg text-ink/75 leading-relaxed">
          A 1990s kitchen rebuilt as an entertainment space: custom cabinetry, quartz, and a waterfall island. Drag the slider to see the change.
        </p>
        <NuxtLink to="/gallery" class="mt-6 inline-block text-moss">See the gallery →</NuxtLink>
      </div>
      <BeforeAfterSlider
        :before-image="PHOTOS.kitchenBefore"
        :after-image="PHOTOS.kitchenAfter"
        before-alt="Kitchen before remodeling"
        after-alt="Kitchen after remodeling"
      />
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
    <p class="mx-auto mt-4 max-w-xl text-cream/75">Free consultations. Military, veterans, first responders, and educators: ask about our discount.</p>
    <NuxtLink to="/contact" class="mt-8 inline-block rounded-full bg-brass px-8 py-3 font-medium text-ink">Book a consult</NuxtLink>
  </section>
</template>

<script setup lang="ts">
const services = [
  {
    title: "Kitchen remodeling",
    blurb: "Layouts, cabinets, stone, lighting, and appliances as one plan.",
    image: PHOTOS.kitchen,
    to: "/services/kitchen-remodeling",
  },
  {
    title: "Bath remodeling",
    blurb: "Showers, tile, vanities, and spa-level details that still function daily.",
    image: PHOTOS.bath,
    to: "/services/bath-remodeling",
  },
  {
    title: "Custom cabinetry",
    blurb: "Northville cabinetry for kitchens, offices, mudrooms, and storage.",
    image: PHOTOS.cabinets,
    to: "/services/custom-cabinetry",
  },
];

const reviews = [
  {
    name: "Sarah J.",
    place: "Alamo Heights",
    text: "They treated the kitchen like a real living room, not a showroom. Every drawer and light was thought through.",
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
  title: `${SITE.name} | Custom interiors in ${SITE.city}`,
  description: SITE.tagline,
  ogTitle: SITE.name,
  ogDescription: SITE.tagline,
  ogImage: `${SITE.url}/kitchen.jpg`,
  ogUrl: SITE.url,
  twitterCard: "summary_large_image",
});
</script>
