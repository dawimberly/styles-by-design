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
    "We design kitchens as daily rooms: layout, finishes, lighting, and a stock-cabinet takeoff from the estimator. Build with our preferred contractor or your own licensed GC. Trade buyers can order boxes at trade price.",
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
      description: "Preferred contractor or your GC builds from the package; trade buyers can order cabinets from the portal.",
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
        "Styles by Design designs the space. Install is through our preferred contractor or your own licensed contractor. Trade buyers can purchase cabinets from our portal.",
    },
    {
      question: "Can I get custom cabinets?",
      answer: "We specify stock SKUs from the estimator list rather than custom millwork.",
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
