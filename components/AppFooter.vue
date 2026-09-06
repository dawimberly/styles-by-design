<template>
  <footer class="bg-ink text-cream">
    <div class="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-3">
      <div>
        <h2 class="font-serif text-3xl">{{ SITE.name }}</h2>
        <p class="mt-4 max-w-sm text-cream/75 leading-relaxed">
          Family-owned custom interiors in {{ SITE.city }}. Kitchen and bath remodeling, cabinetry, stone, and
          full-project management from first sketch to final walkthrough.
        </p>
      </div>
      <div>
        <h3 class="text-sm uppercase tracking-[0.2em] text-brass">Visit</h3>
        <p class="mt-4 text-cream/80">Free in-home consultations across Greater San Antonio.</p>
        <a :href="SITE.phoneHref" class="mt-4 block font-serif text-3xl text-cream hover:text-brass">
          {{ SITE.phone }}
        </a>
        <NuxtLink to="/contact" class="mt-3 inline-block text-sm text-brass hover:underline">Request a consult →</NuxtLink>
      </div>
      <div>
        <h3 class="text-sm uppercase tracking-[0.2em] text-brass">Explore</h3>
        <ul class="mt-4 space-y-2 text-cream/80">
          <li><NuxtLink to="/services/kitchen-remodeling" class="hover:text-cream">Kitchen remodeling</NuxtLink></li>
          <li><NuxtLink to="/services/bath-remodeling" class="hover:text-cream">Bath remodeling</NuxtLink></li>
          <li><NuxtLink to="/services/custom-cabinetry" class="hover:text-cream">Custom cabinetry</NuxtLink></li>
          <li><NuxtLink to="/gallery" class="hover:text-cream">Project gallery</NuxtLink></li>
        </ul>
        <p class="mt-6 text-sm text-cream/50">Military, veterans, first responders, and educators: ask about our discount.</p>
      </div>
    </div>
    <div class="border-t border-white/10 py-6 text-center text-sm text-cream/40">
      © {{ new Date().getFullYear() }} {{ SITE.name }}
    </div>
  </footer>
</template>
