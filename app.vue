<template>
  <div class="min-h-screen bg-cream text-ink font-sans">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator color="#b08d57" />
    <AppHeader />
    <main>
      <NuxtPage />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (chunk) =>
    chunk ? `${chunk} | ${SITE.name}` : `${SITE.name} | ${SITE.city}`,
});
</script>

<style>
html {
  scroll-behavior: smooth;
}
body {
  font-family: "Outfit", system-ui, sans-serif;
  background: #f6f1e8;
  color: #1c241f;
}
h1,
h2,
h3,
.font-serif {
  font-family: "Cormorant Garamond", Georgia, serif;
}
</style>
