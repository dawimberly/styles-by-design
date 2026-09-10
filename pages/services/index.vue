<template>
  <PageHeader subtitle="Services" title="Design and planning for kitchens, baths, and whole homes." />

  <div class="mx-auto max-w-6xl space-y-24 px-4 py-16">
    <article v-for="(item, i) in mains" :key="item.title" class="grid items-center gap-10 md:grid-cols-2">
      <div :class="i % 2 === 1 ? 'md:order-2' : ''">
        <h2 class="font-serif text-4xl">{{ item.title }}</h2>
        <p class="mt-4 text-lg text-ink/75">{{ item.body }}</p>
        <ul class="mt-4 space-y-1 text-ink/80">
          <li v-for="f in item.features" :key="f">▸ {{ f }}</li>
        </ul>
        <NuxtLink :to="item.to" class="mt-6 inline-block rounded-full bg-ink px-5 py-2 text-cream">{{ item.cta }}</NuxtLink>
      </div>
      <img :src="item.image" :alt="item.title" class="h-80 w-full rounded-2xl object-cover shadow-lg" />
    </article>
  </div>

  <section class="bg-sand/40 py-20">
    <div class="mx-auto max-w-6xl px-4">
      <h2 class="text-center font-serif text-4xl">Design deliverables</h2>
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
    title: "Kitchen design",
    body: "Plans, finishes, lighting, and a cabinet takeoff from the estimator list — ready for your preferred contractor or GC.",
    features: ["Space planning", "Finish and fixture specs", "3D views", "Stock cabinet SKUs"],
    image: PHOTOS.kitchen,
    to: "/services/kitchen-remodeling",
    cta: "Kitchen design",
  },
  {
    title: "Bath design",
    body: "Showers, tile, vanities, and lighting as a spec package your builder can price and install.",
    features: ["Layout", "Tile and glass", "Vanity SKUs from the list", "Lighting"],
    image: PHOTOS.bath,
    to: "/services/bath-remodeling",
    cta: "Bath design",
  },
  {
    title: "Trade cabinet sales",
    body: "Licensed contractors buy discounted stock cabinets from the estimator list loaded in our portal.",
    features: ["190 SKUs", "Nine finishes", "20% off MSRP", "Quote from the portal"],
    image: PHOTOS.cabinets,
    to: "/contractors",
    cta: "Open contractor portal",
  },
];

const extras = [
  { title: "3D rendering", description: "See the room before demolition." },
  { title: "Finish boards", description: "Paint, stone, hardware, and lighting in one package." },
  { title: "Estimator takeoff", description: "Cabinet SKUs match the estimator list so the GC is not guessing." },
  { title: "Color", description: "Whole-home palettes that hold up in San Antonio light." },
  { title: "Furniture & styling", description: "Pieces that fit the architecture, not a catalog dump." },
  {
    title: "Builder coordination",
    description: "Handoff to our preferred contractor or your GC, with cabinet orders available through the trade portal.",
  },
];

useSeoMeta({
  title: "Services",
  description: "Interior design for kitchens, baths, and homes in San Antonio. Contractors order discounted stock cabinets from our estimator list.",
});
</script>
