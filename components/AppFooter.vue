<template>
  <footer class="bg-ink text-cream">
    <div class="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-3">
      <div>
        <h2 class="font-serif text-3xl">{{ SITE.name }}</h2>
        <p class="mt-4 max-w-sm text-cream/75 leading-relaxed">
          Interior design studio in {{ SITE.city }}. Styles by Design is the design brand. Install is typically our own
          crews, billed and scheduled through
          <a :href="SITE.flipFixerUrl" class="text-brass hover:underline" target="_blank" rel="noreferrer">{{ SITE.flipFixer }}</a>.
          We do not build custom cabinets — stock boxes come from the estimator list.
        </p>
        <p class="mt-4 text-xs text-cream/40">{{ PHOTO_CREDIT }}</p>
      </div>
      <div>
        <h3 class="text-sm uppercase tracking-[0.2em] text-brass">Visit</h3>
        <p class="mt-4 text-cream/80">Design consults across Greater San Antonio.</p>
        <a :href="SITE.phoneHref" class="mt-4 block font-serif text-3xl text-cream hover:text-brass">
          {{ SITE.phone }}
        </a>
        <a :href="`mailto:${SITE.email}`" class="mt-2 block text-sm text-cream/70 hover:text-brass">{{ SITE.email }}</a>
        <NuxtLink to="/contact" class="mt-3 inline-block text-sm text-brass hover:underline">Book a consult →</NuxtLink>
      </div>
      <div>
        <h3 class="text-sm uppercase tracking-[0.2em] text-brass">Explore</h3>
        <ul class="mt-4 space-y-2 text-cream/80">
          <li><NuxtLink to="/services/kitchen-remodeling" class="hover:text-cream">Kitchen design</NuxtLink></li>
          <li><NuxtLink to="/services/bath-remodeling" class="hover:text-cream">Bath design</NuxtLink></li>
          <li><NuxtLink to="/contractors" class="hover:text-cream">Contractor portal</NuxtLink></li>
          <li><NuxtLink to="/gallery" class="hover:text-cream">Gallery</NuxtLink></li>
        </ul>
        <a
          :href="SITE.flipFixerUrl"
          class="mt-6 inline-block rounded-full bg-brass px-5 py-2 text-sm font-medium text-ink hover:bg-sand"
          target="_blank"
          rel="noreferrer"
        >
          Need a Contractor
        </a>
      </div>
    </div>
    <div class="border-t border-white/10">
      <div class="mx-auto max-w-6xl px-4 py-6 text-sm text-cream/40">
        <p>© {{ new Date().getFullYear() }} {{ SITE.name }}</p>
        <p class="mt-2">
          <NuxtLink to="/staff" class="text-cream/40 hover:text-brass">Employee login</NuxtLink>
        </p>
      </div>
    </div>
  </footer>
</template>
