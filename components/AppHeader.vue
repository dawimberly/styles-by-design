<template>
  <header class="sticky top-0 z-50 border-b border-sand/80 bg-cream/90 backdrop-blur-md">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
      <NuxtLink to="/" class="flex items-center gap-3">
        <img src="@/assets/images/logosbd.png" alt="Styles by Design" class="h-12 w-auto md:h-14" />
      </NuxtLink>

      <nav class="hidden items-center gap-7 text-sm font-medium tracking-wide text-ink/80 md:flex">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="hover:text-moss"
          :class="{ 'text-moss': isActive(link.to) }"
        >
          {{ link.text }}
        </NuxtLink>
      </nav>

      <div class="hidden items-center gap-3 md:flex">
        <NuxtLink to="/contractors" class="text-sm text-ink/50 hover:text-ink/80">
          Contractor portal
        </NuxtLink>
        <a
          :href="SITE.preferredContractorUrl"
          class="rounded-full bg-brass px-4 py-2 text-sm font-medium text-ink hover:bg-sand"
          target="_blank"
          rel="noreferrer"
        >
          {{ SITE.preferredContractorCta }}
        </a>
      </div>

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
      <a :href="SITE.preferredContractorUrl" class="mt-2 block font-medium text-moss" target="_blank" rel="noreferrer">
        {{ SITE.preferredContractorCta }}
      </a>
      <NuxtLink to="/contractors" class="mt-2 block text-sm text-ink/50" @click="open = false">
        Contractor portal
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, X } from "lucide-vue-next";

const open = ref(false);
const route = useRoute();
const links = [
  { to: "/", text: "Home" },
  { to: "/services", text: "Services" },
  { to: "/gallery", text: "Gallery" },
  { to: "/community", text: "Community" },
  { to: "/about", text: "About" },
  { to: "/contact", text: "Contact" },
];

function isActive(to: string) {
  if (to === "/") return route.path === "/";
  return route.path === to || route.path.startsWith(`${to}/`);
}
</script>
