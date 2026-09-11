<template>
  <PageHeader subtitle="About" title="Independently owned." />

  <div class="mx-auto grid max-w-6xl items-start gap-12 px-4 py-16 md:grid-cols-2">
    <img :src="PHOTOS.portrait" alt="Jon" class="h-[520px] w-full rounded-2xl object-cover object-[center_18%] shadow-xl" />
    <div class="space-y-6 text-lg leading-relaxed text-ink/80">
      <h2 class="font-serif text-4xl text-ink">Meet Jon Styles</h2>
      <p>
        More than twenty years designing interiors around San Antonio. Jon founded Styles by Design as the design brand:
        spaces first, then a spec that can be built — with our preferred contractor or your own licensed GC.
      </p>
      <p>
        Each house gets honest budgets, drawings before demo, and a handoff that does not leave the jobsite guessing.
        Stock cabinets come from our estimator list; verified trade buyers can order from the contractor portal.
      </p>
      <blockquote class="border-l-4 border-brass pl-6 font-serif text-2xl text-ink">
        “Every home tells a story. Our job is to help you tell yours well.”
        <cite class="mt-3 block text-base not-italic text-ink/60">— Jon Styles</cite>
      </blockquote>
      <h3 class="font-serif text-3xl text-ink">Credentials</h3>
      <ul class="list-disc space-y-1 pl-5">
        <li>Licensed interior designer — Texas Board of Architectural Examiners</li>
        <li>Certified Kitchen and Bath Designer</li>
        <li>National Kitchen and Bath Association member</li>
        <li>Trade cabinet sales from the estimator price list</li>
      </ul>
    </div>
  </div>

  <section class="bg-sand/40 py-16">
    <div class="mx-auto max-w-6xl px-4">
      <p class="text-sm uppercase tracking-[0.28em] text-moss">Community</p>
      <h2 class="mt-3 font-serif text-4xl text-ink">Who we want more of this work to serve</h2>
      <p class="mt-6 max-w-3xl text-lg leading-relaxed text-ink/80">
        Military, veterans, first responders, educators, CASA, and group homes. Discounts are in place. Donated labor,
        materials fundraising, and training are what we are growing next. The form lives on the Community page.
      </p>
      <NuxtLink to="/community" class="mt-8 inline-block rounded-full bg-ink px-6 py-3 font-medium text-cream">
        Community page
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "About",
  description: "Meet Jon Styles of Styles by Design: twenty years of custom interiors in San Antonio.",
});
</script>
