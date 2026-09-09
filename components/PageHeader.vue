<template>
  <section class="relative overflow-hidden py-16 md:py-24">
    <img :src="PHOTOS.kitchen" alt="" class="absolute inset-0 h-full w-full object-cover" />
    <div class="absolute inset-0 bg-ink/70" />
    <div class="relative mx-auto max-w-6xl px-4">
      <p class="text-sm uppercase tracking-[0.28em] text-brass">{{ subtitle }}</p>
      <h1 class="mt-3 max-w-3xl font-serif text-4xl text-cream md:text-5xl">{{ title }}</h1>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{ subtitle: string; title: string }>();
</script>
