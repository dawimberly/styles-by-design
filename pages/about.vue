<template>
  <PageHeader subtitle="About" title="Independently owned. Family run." />

  <div class="mx-auto grid max-w-6xl items-start gap-12 px-4 py-16 md:grid-cols-2">
    <img :src="PHOTOS.portrait" alt="Jon" class="h-[520px] w-full rounded-2xl object-cover object-[center_18%] shadow-xl" />
    <div class="space-y-6 text-lg leading-relaxed text-ink/80">
      <h2 class="font-serif text-4xl text-ink">Meet Jon Styles</h2>
      <p>
        More than twenty years designing interiors around San Antonio. Jon founded Styles by Design as a design studio:
        spaces first, then a spec your builder can execute.
      </p>
      <p>
        With his wife Maria, they treat each house as family: honest budgets, drawings before demo, and a handoff that
        does not leave the GC guessing. They do not run a custom cabinet shop.
      </p>
      <blockquote class="border-l-4 border-brass pl-6 font-serif text-2xl text-ink">
        “Every home tells a story. Our job is to help you tell yours well.”
        <cite class="mt-3 block text-base not-italic text-ink/60">— Jon Styles</cite>
      </blockquote>
      <h3 class="font-serif text-3xl text-ink">In the community</h3>
      <p>
        Jon and Maria volunteer with CASA, advocating for children in the Bexar County foster care system.
      </p>
      <h3 class="font-serif text-3xl text-ink">Credentials</h3>
      <ul class="list-disc space-y-1 pl-5">
        <li>Licensed interior designer — Texas Board of Architectural Examiners</li>
        <li>Certified Kitchen and Bath Designer</li>
        <li>National Kitchen and Bath Association member</li>
        <li>Trade cabinet sales from the Northville / estimator price list</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: "About",
  description: "Meet Jon Styles of Styles by Design: twenty years of custom interiors in San Antonio.",
});
</script>
