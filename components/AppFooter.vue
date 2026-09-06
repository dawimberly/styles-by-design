<template>
  <footer class="bg-ink text-cream">
    <div class="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-3">
      <div>
        <h2 class="font-serif text-3xl">{{ SITE.name }}</h2>
        <p class="mt-4 max-w-sm text-cream/75 leading-relaxed">
          Interior design studio in {{ SITE.city }}. We plan kitchens, baths, and living spaces. We do not build custom
          cabinets — licensed contractors buy stock boxes from our estimator list.
        </p>
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
      </div>
    </div>
    <div class="border-t border-white/10 py-6 text-center text-sm text-cream/40">
      © {{ new Date().getFullYear() }} {{ SITE.name }}
    </div>
  </footer>
</template>
