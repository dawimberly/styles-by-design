<template>
  <PageHeader :subtitle="subtitle" :title="title" />
  <div class="mx-auto max-w-6xl px-4 py-16">
    <div class="grid items-center gap-12 md:grid-cols-2">
      <div>
        <p class="text-lg leading-relaxed text-ink/80">{{ description }}</p>
        <ul class="mt-6 space-y-2 text-ink/80">
          <li v-for="feature in mainFeatures" :key="feature" class="flex gap-2">
            <span class="text-brass">▸</span>{{ feature }}
          </li>
        </ul>
        <NuxtLink to="/contact" class="mt-8 inline-block rounded-full bg-ink px-6 py-3 text-cream">Start a project</NuxtLink>
      </div>
      <img :src="mainImage" :alt="title" class="h-[420px] w-full rounded-2xl object-cover shadow-xl" />
    </div>

    <h2 class="mt-24 text-center font-serif text-4xl">Our process</h2>
    <div class="mt-10 grid gap-6 md:grid-cols-3">
      <article v-for="(step, i) in process" :key="step.title" class="rounded-2xl bg-white p-8 shadow-sm">
        <p class="font-serif text-4xl text-brass">{{ String(i + 1).padStart(2, "0") }}</p>
        <h3 class="mt-3 text-xl font-semibold">{{ step.title }}</h3>
        <p class="mt-2 text-ink/70">{{ step.description }}</p>
      </article>
    </div>

    <h2 class="mt-24 text-center font-serif text-4xl">Recent work</h2>
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <figure v-for="image in galleryImages" :key="image.src" class="overflow-hidden rounded-2xl">
        <img :src="image.src" :alt="image.alt" class="h-64 w-full object-cover" />
        <figcaption class="bg-white p-4 text-sm text-ink/70">{{ image.description }}</figcaption>
      </figure>
    </div>

    <h2 class="mt-24 text-center font-serif text-4xl">Questions</h2>
    <div class="mx-auto mt-10 max-w-3xl space-y-4">
      <details v-for="faq in faqs" :key="faq.question" class="rounded-2xl bg-white p-6 shadow-sm">
        <summary class="cursor-pointer text-lg font-semibold">{{ faq.question }}</summary>
        <p class="mt-3 text-ink/70">{{ faq.answer }}</p>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  subtitle: string;
  title: string;
  description: string;
  mainFeatures: string[];
  mainImage: string;
  process: { title: string; description: string }[];
  galleryImages: { src: string; alt: string; description: string }[];
  faqs: { question: string; answer: string }[];
}>();
</script>
