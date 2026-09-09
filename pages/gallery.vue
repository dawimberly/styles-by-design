<template>
  <PageHeader subtitle="Gallery" title="Northville finishes we specify for design plans" />

  <div class="mx-auto max-w-6xl px-4 py-16">
    <div class="grid items-start gap-10 md:grid-cols-5">
      <div class="md:col-span-2">
        <h2 class="font-serif text-4xl">Finish reference</h2>
        <p class="mt-4 text-lg text-ink/75 leading-relaxed">
          These images are Northville product photography used for design selections — not Styles by Design jobsite
          galleries. {{ SITE.preferredContractorOffer }}
        </p>
        <a
          :href="SITE.preferredContractorUrl"
          class="mt-6 inline-block rounded-full bg-brass px-5 py-2 text-sm font-medium text-ink hover:bg-sand"
          target="_blank"
          rel="noreferrer"
        >
          {{ SITE.preferredContractorCta }}
        </a>
      </div>
      <div class="md:col-span-3">
        <img
          :src="PHOTOS.kitchenHero"
          alt="Northville kitchen cabinetry finish reference"
          class="h-80 w-full rounded-2xl object-cover shadow-sm md:h-[28rem]"
        />
      </div>
    </div>

    <h2 class="mt-24 font-serif text-4xl">Finishes from the Northville list</h2>
    <p class="mt-3 max-w-2xl text-ink/70">{{ PHOTO_CREDIT }}</p>
    <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <figure v-for="item in items" :key="item.src" class="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-sand/80">
        <img :src="item.src" :alt="item.alt" class="h-64 w-full object-cover transition duration-700 group-hover:scale-105" />
        <figcaption class="p-4">
          <p class="font-medium">{{ item.description }}</p>
        </figcaption>
      </figure>
    </div>
  </div>
</template>

<script setup lang="ts">
const items = [
  { src: PHOTOS.kitchen, alt: "Glossy white kitchen", description: "Glossy White frameless" },
  { src: PHOTOS.greyIsland, alt: "Grey shaker kitchen", description: "Grey Shaker" },
  { src: PHOTOS.bath, alt: "Grey shaker bath", description: "Grey Shaker bath" },
  { src: PHOTOS.bathDetail, alt: "Antique white vanity", description: "Antique White vanity" },
  { src: PHOTOS.office, alt: "Northville closet", description: "Closet line" },
  { src: PHOTOS.stone, alt: "Natural wood kitchen", description: "Natural Wood" },
  { src: PHOTOS.blue, alt: "Blue shaker kitchen", description: "Blue Shaker" },
  { src: PHOTOS.espresso, alt: "Espresso shaker kitchen", description: "Espresso Shaker" },
  { src: PHOTOS.cognac, alt: "Cognac kitchen", description: "Cognac" },
];

useSeoMeta({
  title: "Gallery",
  description: "Northville cabinetry finishes specified by Styles by Design in San Antonio.",
});
</script>
