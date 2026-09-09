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
    "We design kitchens as daily rooms: layout, finishes, lighting, and a stock-cabinet takeoff from the estimator. Use our preferred contractor for a 10% discount when you build, or work with your own licensed contractor. Outside trade buyers can order boxes at trade price. We do not fabricate custom cabinets.",
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
    {
      title: "Handoff",
      description: "Use our preferred contractor for a 10% discount, or order cabinets at trade price from the portal with your GC.",
    },
  ],
  galleryImages: [
    { src: PHOTOS.kitchen, alt: "Glossy white kitchen", description: "Glossy White" },
    { src: PHOTOS.greyIsland, alt: "Grey shaker kitchen", description: "Grey Shaker island" },
    { src: PHOTOS.stone, alt: "Natural wood kitchen", description: "Natural Wood" },
  ],
  faqs: [
    {
      question: "Do you install the kitchen?",
      answer:
        "Styles by Design designs the space. Use our preferred contractor for a 10% discount, or hire your own licensed contractor. Trade buyers can purchase cabinets from our portal.",
    },
    {
      question: "Can I get custom cabinets?",
      answer: "We specify stock Northville SKUs from the estimator. We are not a custom cabinet shop.",
    },
    {
      question: "How do contractors order?",
      answer: "Verified trade buyers use the contractor portal for the estimator price list at 20% off MSRP.",
    },
  ],
};

useSeoMeta({
  title: "Kitchen design",
  description: "Kitchen interior design in San Antonio. Stock cabinets ordered by your contractor from our estimator list.",
});
</script>
