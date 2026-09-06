<template>
  <PageHeader subtitle="Gallery" title="Recent kitchens, baths, and built-ins" />

  <div class="mx-auto max-w-6xl px-4 py-16">
    <div class="grid items-start gap-10 md:grid-cols-5">
      <div class="md:col-span-2">
        <h2 class="font-serif text-4xl">Alamo Heights kitchen</h2>
        <p class="mt-4 text-lg text-ink/75 leading-relaxed">
          Dated 1990s plan rebuilt as an entertainment kitchen: custom cabinets, quartz, and a waterfall island. Drag to compare.
        </p>
      </div>
      <div class="md:col-span-3">
        <BeforeAfterSlider
          :before-image="PHOTOS.kitchenBefore"
          :after-image="PHOTOS.kitchenAfter"
          before-alt="Kitchen before"
          after-alt="Kitchen after"
        />
      </div>
    </div>

    <h2 class="mt-24 font-serif text-4xl">More from the shop</h2>
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <figure v-for="item in items" :key="item.src" class="group overflow-hidden rounded-2xl bg-white shadow-sm">
        <img :src="item.src" :alt="item.alt" class="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
        <figcaption class="p-4 font-medium">{{ item.description }}</figcaption>
      </figure>
    </div>
  </div>
</template>

<script setup lang="ts">
const items = [
  { src: PHOTOS.kitchen, alt: "Kitchen island", description: "Kitchen with island" },
  { src: PHOTOS.bath, alt: "Bathroom", description: "Walk-in shower" },
  { src: PHOTOS.cabinets, alt: "Cabinets", description: "Custom cabinets" },
  { src: PHOTOS.office, alt: "Office", description: "Built-in office" },
  { src: PHOTOS.bathDetail, alt: "Vanity", description: "Double vanity" },
  { src: PHOTOS.stone, alt: "Living kitchen", description: "Open living kitchen" },
];

useSeoMeta({
  title: "Gallery",
  description: "Kitchen, bath, and cabinetry projects from Styles by Design in San Antonio.",
});
</script>
