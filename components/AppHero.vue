<template>
  <section class="relative isolate min-h-[78vh] overflow-hidden">
    <img :src="PHOTOS.kitchen" alt="Custom kitchen remodel in San Antonio" class="absolute inset-0 h-full w-full object-cover" />
    <div class="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/55 to-ink/25" />
    <div class="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-4 py-24 text-cream">
      <p class="text-sm uppercase tracking-[0.28em] text-brass">{{ SITE.city }}</p>
      <h1 class="mt-4 max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
        Kitchens, baths, and cabinetry built around how you live.
      </h1>
      <p class="mt-6 max-w-xl text-lg text-cream/85">
        {{ SITE.name }} is a family-run studio for full kitchen and bath remodels, custom cabinets, stone, flooring,
        painting, and 3D design — one team from consult to install.
      </p>
      <div class="mt-10 flex flex-wrap gap-4">
        <NuxtLink to="/contact" class="rounded-full bg-brass px-6 py-3 font-medium text-ink hover:bg-sand">
          Free consultation
        </NuxtLink>
        <a :href="SITE.phoneHref" class="rounded-full border border-cream/40 px-6 py-3 hover:bg-cream/10">
          {{ SITE.phone }}
        </a>
      </div>
    </div>
  </section>
</template>
