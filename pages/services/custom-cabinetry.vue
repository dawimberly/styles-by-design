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
  title: "Custom cabinetry",
  description:
    "Certified Northville Cabinetry installers. Kitchens, offices, mudrooms, and built-ins that line up with the architecture instead of fighting it.",
  mainFeatures: [
    "Kitchen cabinets and islands",
    "Bath vanities",
    "Entertainment and library walls",
    "Home offices",
    "Garage organization",
  ],
  mainImage: PHOTOS.cabinets,
  process: [
    { title: "Fit", description: "We measure twice and talk through how you actually store things." },
    { title: "Draw", description: "Door styles, finishes, and hardware on a 3D model before production." },
    { title: "Set", description: "Certified install, scribing, and hardware adjustment until every door hangs true." },
  ],
  galleryImages: [
    { src: PHOTOS.cabinets, alt: "Kitchen cabinets", description: "Painted kitchen cabinets" },
    { src: PHOTOS.office, alt: "Office", description: "Built-in desk wall" },
    { src: PHOTOS.kitchenAfter, alt: "Island", description: "Custom island" },
  ],
  faqs: [
    {
      question: "What lines do you install?",
      answer: "We are certified Northville Cabinetry installers and can spec their full range of styles and price points.",
    },
    {
      question: "How long from approval to install?",
      answer: "Most cabinet jobs are 6–8 weeks including production and install.",
    },
    {
      question: "Do you finance?",
      answer: "Yes. Ask during consult and we will walk through current options.",
    },
  ],
};

useSeoMeta({
  title: "Custom cabinetry",
  description: "Custom cabinetry in San Antonio. Certified Northville Cabinetry for kitchens, offices, and storage.",
});
</script>
