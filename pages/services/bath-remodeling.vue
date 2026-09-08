<template>
  <ServiceDetail
    subtitle="Services"
    :title="serviceData.title"
    :description="serviceData.description"
    :main-features="serviceData.mainFeatures"
    :main-image="serviceData.mainImage"
    :process="serviceData.process"
    :gallery-images="serviceData.galleryImages"
    :faqs="serviceData.faqs"
  />
</template>

<script setup lang="ts">
const serviceData = {
  title: "Bath design",
  description:
    "From powder room to master suite: showers, tile, glass, and vanities specified as a design package. Install is typically our crews under The Flip Fixer.",
  mainFeatures: [
    "Layout and 3D",
    "Tile, glass, and fixture specs",
    "Vanity SKUs from the estimator list",
    "Lighting",
    "Accessibility planning",
  ],
  mainImage: PHOTOS.bath,
  process: [
    { title: "Measure", description: "We map what can stay versus what should go." },
    { title: "Specify", description: "Tile, glass, fixtures, and a 3D view." },
    { title: "Handoff", description: "Install typically runs through The Flip Fixer from the design package." },
  ],
  galleryImages: [
    { src: PHOTOS.bath, alt: "Grey bath", description: "Grey Shaker bath" },
    { src: PHOTOS.bathDetail, alt: "Vanity", description: "Antique White vanity" },
    { src: PHOTOS.antique, alt: "Antique white kitchen", description: "Antique White kitchen" },
  ],
  faqs: [
    {
      question: "Do you remodel the bath yourselves?",
      answer: "Usually yes — our installers, billed and run through The Flip Fixer. An outside licensed contractor can also build from the package.",
    },
    {
      question: "Can vanities come from your list?",
      answer: "Yes. Stock vanities and cabinets are on the estimator list and the contractor portal.",
    },
    {
      question: "Do you design curbless showers?",
      answer: "Yes, as a design spec. Waterproofing and tile are typically Flip Fixer install, or your contractor if you bring one.",
    },
  ],
};

useSeoMeta({
  title: "Bath design",
  description: "Bathroom remodeling in San Antonio: custom showers, tile, vanities, and accessibility work.",
});
</script>
