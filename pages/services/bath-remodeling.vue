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
  title: "Bath remodeling",
  description:
    "From a guest powder room to a master suite: showers, tile, glass, and storage designed for how you actually start the day.",
  mainFeatures: [
    "Custom showers and tubs",
    "Tile, glass, and waterproofing",
    "Vanities and lighting",
    "Plumbing and fixtures",
    "Accessibility upgrades",
  ],
  mainImage: PHOTOS.bath,
  process: [
    { title: "Measure", description: "We map plumbing, vents, and what can stay versus what should go." },
    { title: "Specify", description: "Tile, glass, fixtures, and a 3D view so there are no surprises on grout day." },
    { title: "Install", description: "Waterproofing first, then finishes. We do not rush wet work." },
  ],
  galleryImages: [
    { src: PHOTOS.bath, alt: "Spa bath", description: "Walk-in shower" },
    { src: PHOTOS.bathDetail, alt: "Vanity", description: "Custom vanity" },
    { src: PHOTOS.living, alt: "Suite", description: "Master bath suite" },
  ],
  faqs: [
    {
      question: "How long is a bath remodel?",
      answer: "A typical hall bath is 3–4 weeks. A full master suite with custom tile is often 5–7 weeks.",
    },
    {
      question: "Can you keep a working bathroom?",
      answer: "If the house has a second bath, we sequence so one remains usable. We will tell you up front if that is not possible.",
    },
    {
      question: "Do you do walk-in and curbless showers?",
      answer: "Yes. We design for daily use and, when needed, for aging-in-place.",
    },
  ],
};

useSeoMeta({
  title: "Bath remodeling",
  description: "Bathroom remodeling in San Antonio: custom showers, tile, vanities, and accessibility work.",
});
</script>
