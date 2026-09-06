<template>
  <PageHeader subtitle="Services" title="Custom interiors across San Antonio" />

  <div class="mx-auto max-w-6xl space-y-24 px-4 py-16">
    <article v-for="(item, i) in mains" :key="item.title" class="grid items-center gap-10 md:grid-cols-2">
      <div :class="i % 2 === 1 ? 'md:order-2' : ''">
        <h2 class="font-serif text-4xl">{{ item.title }}</h2>
        <p class="mt-4 text-lg text-ink/75">{{ item.body }}</p>
        <ul class="mt-4 space-y-1 text-ink/80">
          <li v-for="f in item.features" :key="f">▸ {{ f }}</li>
        </ul>
        <NuxtLink :to="item.to" class="mt-6 inline-block rounded-full bg-ink px-5 py-2 text-cream">Learn more</NuxtLink>
      </div>
      <img :src="item.image" :alt="item.title" class="h-80 w-full rounded-2xl object-cover shadow-lg" />
    </article>
  </div>

  <section class="bg-sand/40 py-20">
    <div class="mx-auto max-w-6xl px-4">
      <h2 class="text-center font-serif text-4xl">Also on the job</h2>
      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <article v-for="s in extras" :key="s.title" class="rounded-2xl bg-white p-8">
          <h3 class="text-xl font-semibold">{{ s.title }}</h3>
          <p class="mt-3 text-ink/70">{{ s.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const mains = [
  {
    title: "Kitchen remodeling",
    body: "Full kitchen rebuilds: cabinets, counters, lighting, flooring, and appliances under one plan.",
    features: ["Custom cabinets", "Stone and quartz", "Layout and lighting", "Appliance coordination"],
    image: PHOTOS.kitchen,
    to: "/services/kitchen-remodeling",
  },
  {
    title: "Bath remodeling",
    body: "Master suites and guest baths with tile, glass, vanities, and plumbing that last.",
    features: ["Custom showers", "Tile and fixtures", "Vanities", "Accessibility options"],
    image: PHOTOS.bath,
    to: "/services/bath-remodeling",
  },
  {
    title: "Custom cabinetry",
    body: "Certified Northville Cabinetry installers for kitchens, offices, and whole-home storage.",
    features: ["Kitchens and islands", "Built-ins", "Offices and mudrooms", "Garage systems"],
    image: PHOTOS.cabinets,
    to: "/services/custom-cabinetry",
  },
];

const extras = [
  { title: "Interior painting", description: "Prep, color consult, and premium paint with a clean jobsite." },
  { title: "Flooring", description: "Hardwood, tile, luxury vinyl, and laminate installed to the room." },
  { title: "Stone & counters", description: "Granite, quartz, marble, and solid surface." },
  { title: "3D rendering", description: "See the kitchen or bath before demolition starts." },
  { title: "Home additions", description: "Rooms, conversions, and outdoor living that match the house." },
  { title: "Project management", description: "Schedule, trades, budget, and walkthrough in one conversation." },
];

useSeoMeta({
  title: "Services",
  description: "Kitchen and bath remodeling, custom cabinetry, stone, flooring, and project management in San Antonio.",
});
</script>
