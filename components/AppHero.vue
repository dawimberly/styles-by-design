<template>
  <section class="relative isolate min-h-[78vh] overflow-hidden">
    <img :src="PHOTOS.kitchen" alt="Kitchen cabinetry" class="absolute inset-0 h-full w-full object-cover object-center" />
    <div class="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/50 to-ink/20" />
    <div class="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-4 py-24 text-cream">
      <p class="text-sm uppercase tracking-[0.28em] text-brass">{{ SITE.city }}</p>
      <h1 class="mt-4 max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
        Kitchens and baths designed for how you actually live.
      </h1>
      <p class="mt-6 max-w-xl text-lg text-cream/85">
        Plans, finishes, and 3D before a wall opens.
      </p>
      <div class="mt-10 flex flex-wrap gap-4">
        <NuxtLink to="/contact" class="rounded-full bg-brass px-6 py-3 font-medium text-ink hover:bg-sand">
          Book a consult
        </NuxtLink>
        <a
          :href="SITE.preferredContractorUrl"
          class="rounded-full border border-cream/40 px-6 py-3 hover:bg-cream/10"
          target="_blank"
          rel="noreferrer"
        >
          {{ SITE.preferredContractorCta }}
        </a>
      </div>
    </div>
  </section>
</template>
