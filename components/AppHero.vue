<template>
  <section class="relative isolate min-h-[78vh] overflow-hidden">
    <img :src="PHOTOS.kitchen" alt="Northville kitchen cabinetry" class="absolute inset-0 h-full w-full object-cover object-center" />
    <div class="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-ink/20" />
    <div class="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-4 py-24 text-cream">
      <p class="text-sm uppercase tracking-[0.28em] text-brass">{{ SITE.city }}</p>
      <h1 class="mt-4 max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
        We design the space. Install runs through The Flip Fixer.
      </h1>
      <p class="mt-6 max-w-xl text-lg text-cream/85">
        Styles by Design is the design brand: kitchens, baths, and whole homes — plans, finishes, and 3D before a wall
        opens. Install is typically our own crews, run through The Flip Fixer. Contractors can also buy stock cabinets
        from the estimator list at trade discount.
      </p>
      <div class="mt-10 flex flex-wrap gap-4">
        <NuxtLink to="/contact" class="rounded-full bg-brass px-6 py-3 font-medium text-ink hover:bg-sand">
          Start a design
        </NuxtLink>
        <a
          :href="SITE.flipFixerUrl"
          class="rounded-full border border-cream/40 px-6 py-3 hover:bg-cream/10"
          target="_blank"
          rel="noreferrer"
        >
          Need a Contractor
        </a>
        <NuxtLink to="/contractors" class="rounded-full border border-cream/40 px-6 py-3 hover:bg-cream/10">
          Contractor portal
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
