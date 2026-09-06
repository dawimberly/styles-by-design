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
    "From powder room to master suite: showers, tile, glass, and vanities specified as a design package for your builder.",
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
    { title: "Handoff", description: "Your contractor builds from the package." },
  ],
  galleryImages: [
    { src: PHOTOS.bath, alt: "Spa bath", description: "Walk-in shower" },
    { src: PHOTOS.bathDetail, alt: "Vanity", description: "Custom vanity" },
    { src: PHOTOS.living, alt: "Suite", description: "Master bath suite" },
  ],
  faqs: [
    {
      question: "Do you remodel the bath yourselves?",
      answer: "We design. A licensed contractor performs the work.",
    },
    {
      question: "Can vanities come from your list?",
      answer: "Yes. Stock vanities and cabinets are on the estimator list and the contractor portal.",
    },
    {
      question: "Do you design curbless showers?",
      answer: "Yes, as a design spec. Your contractor executes waterproofing and tile.",
    },
  ],
};

useSeoMeta({
  title: "Bath design",
  description: "Bathroom remodeling in San Antonio: custom showers, tile, vanities, and accessibility work.",
});
</script>
