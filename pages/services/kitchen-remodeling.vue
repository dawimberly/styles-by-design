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
  title: "Kitchen remodeling",
  description:
    "We rebuild kitchens as daily rooms: cooking, gathering, and storage planned together, with 3D drawings before we open a wall.",
  mainFeatures: [
    "Custom cabinet design and install",
    "Quartz, granite, and solid surface",
    "Layout, lighting, and electrical",
    "Flooring and backsplash",
    "Appliance selection and fit",
  ],
  mainImage: PHOTOS.kitchen,
  process: [
    { title: "Consult", description: "Walk the room, talk through how you cook, and set a budget that is honest." },
    { title: "Plan", description: "Drawings, finishes, and a schedule you can put on the fridge." },
    { title: "Build", description: "One crew lead, daily updates, and a clean site until punch list is done." },
  ],
  galleryImages: [
    { src: PHOTOS.kitchen, alt: "Modern kitchen", description: "Island kitchen with quartz" },
    { src: PHOTOS.kitchenAfter, alt: "Remodeled kitchen", description: "Alamo Heights after" },
    { src: PHOTOS.stone, alt: "Kitchen living", description: "Open plan finishes" },
  ],
  faqs: [
    {
      question: "How long does a kitchen take?",
      answer: "Most full remodels run 6–8 weeks after materials are locked. Additions or structural work take longer.",
    },
    {
      question: "Can we cook during the job?",
      answer: "We help set up a temporary kitchen. Access to water and a microwave is typical; the range is usually offline mid-job.",
    },
    {
      question: "Do you pull permits?",
      answer: "Yes. We handle permits and inspections for electrical, plumbing, and structural work.",
    },
  ],
};

useSeoMeta({
  title: "Kitchen remodeling",
  description: "Custom kitchen remodeling in San Antonio: cabinets, counters, lighting, and full renovations.",
});
</script>
