<template>
  <header class="sticky top-0 z-50 border-b border-sand/80 bg-cream/90 backdrop-blur-md">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
      <NuxtLink to="/" class="flex items-center gap-3">
        <img src="@/assets/images/logosbd.jpg" alt="Styles by Design" class="h-12 w-auto md:h-14" />
      </NuxtLink>

      <nav class="hidden items-center gap-8 text-sm font-medium tracking-wide text-ink/80 md:flex">
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="hover:text-moss" active-class="text-moss">
          {{ link.text }}
        </NuxtLink>
      </nav>

      <NuxtLink
        to="/contractors"
        class="hidden items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-cream md:inline-flex"
      >
        Contractor portal
      </NuxtLink>

      <button class="md:hidden" type="button" aria-label="Menu" @click="open = !open">
        <Menu v-if="!open" class="h-6 w-6" />
        <X v-else class="h-6 w-6" />
      </button>
    </div>

    <div v-if="open" class="border-t border-sand bg-cream px-4 py-4 md:hidden">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="block py-2 text-lg"
        @click="open = false"
      >
        {{ link.text }}
      </NuxtLink>
      <a :href="SITE.phoneHref" class="mt-3 inline-block font-medium text-moss">{{ SITE.phone }}</a>
      <NuxtLink to="/contractors" class="mt-2 block font-medium text-moss" @click="open = false">Contractor portal</NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, X } from "lucide-vue-next";

const open = ref(false);
const links = [
  { to: "/services", text: "Services" },
  { to: "/gallery", text: "Gallery" },
  { to: "/about", text: "About" },
  { to: "/contact", text: "Contact" },
];
</script>
