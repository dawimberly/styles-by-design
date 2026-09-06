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
    "We design kitchens as daily rooms: layout, finishes, lighting, and a stock-cabinet takeoff from the estimator. Your contractor builds and orders boxes through the trade portal. We do not fabricate custom cabinets.",
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
    { title: "Handoff", description: "Your builder builds. Cabinets order at trade price from the portal." },
  ],
  galleryImages: [
    { src: PHOTOS.kitchen, alt: "Modern kitchen", description: "Island kitchen with quartz" },
    { src: PHOTOS.kitchenAfter, alt: "Remodeled kitchen", description: "White shaker kitchen after" },
    { src: PHOTOS.stone, alt: "Kitchen living", description: "Open plan finishes" },
  ],
  faqs: [
    {
      question: "Do you install the kitchen?",
      answer: "No. We design. A licensed contractor builds. They can buy the cabinets from our portal.",
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
