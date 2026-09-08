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
  title: "Kitchen design",
  description:
    "We design kitchens as daily rooms: layout, finishes, lighting, and a stock-cabinet takeoff from the estimator. Install is typically our own crews, run through The Flip Fixer. Outside contractors can order boxes at trade price. We do not fabricate custom cabinets.",
  mainFeatures: [
    "Space planning and 3D",
    "Finish, stone, and lighting specs",
    "Stock cabinet SKUs from the estimator list",
    "Appliance coordination",
    "Drawings your GC can bid",
  ],
  mainImage: PHOTOS.kitchen,
  process: [
    { title: "Consult", description: "Walk the room and how you cook." },
    { title: "Design", description: "Drawings, finishes, and SKUs locked to the price list." },
    { title: "Handoff", description: "Install typically goes through The Flip Fixer. Cabinets order at trade price from the portal." },
  ],
  galleryImages: [
    { src: PHOTOS.kitchen, alt: "Glossy white kitchen", description: "Glossy White" },
    { src: PHOTOS.greyIsland, alt: "Grey shaker kitchen", description: "Grey Shaker island" },
    { src: PHOTOS.stone, alt: "Natural wood kitchen", description: "Natural Wood" },
  ],
  faqs: [
    {
      question: "Do you install the kitchen?",
      answer: "Install is typically our own crews, scheduled through The Flip Fixer. You can also use an outside licensed contractor, who can buy cabinets from our portal.",
    },
    {
      question: "Can I get custom cabinets?",
      answer: "We specify stock Northville SKUs from the estimator. We are not a custom cabinet shop.",
    },
    {
      question: "How do contractors order?",
      answer: "The contractor portal uses the same price list as Flip Fixer, at 20% off MSRP.",
    },
  ],
};

useSeoMeta({
  title: "Kitchen design",
  description: "Kitchen interior design in San Antonio. Stock cabinets ordered by your contractor from our estimator list.",
});
</script>
