<template>
  <div
    class="relative h-[480px] cursor-col-resize overflow-hidden rounded-2xl shadow-xl select-none md:h-[560px]"
    ref="el"
    @pointerdown="start"
    @pointermove="move"
    @pointerup="stop"
    @pointerleave="stop"
  >
    <img :src="afterImage" :alt="afterAlt" class="absolute inset-0 h-full w-full object-cover" />
    <img
      :src="beforeImage"
      :alt="beforeAlt"
      class="absolute inset-0 h-full w-full object-cover"
      :style="{ clipPath: `inset(0 ${100 - pct}% 0 0)` }"
    />
    <div class="absolute inset-y-0 w-0.5 bg-white" :style="{ left: `${pct}%` }" />
    <div
      class="absolute top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ink/70"
      :style="{ left: `${pct}%` }"
    />
    <span class="absolute left-4 top-4 rounded bg-black/50 px-3 py-1 text-sm text-white">Before</span>
    <span class="absolute right-4 top-4 rounded bg-black/50 px-3 py-1 text-sm text-white">After</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
}>();

const el = ref<HTMLElement | null>(null);
const dragging = ref(false);
const pct = ref(50);

function setFromEvent(e: PointerEvent) {
  if (!el.value) return;
  const rect = el.value.getBoundingClientRect();
  pct.value = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
}

function start(e: PointerEvent) {
  dragging.value = true;
  el.value?.setPointerCapture(e.pointerId);
  setFromEvent(e);
}
function move(e: PointerEvent) {
  if (dragging.value) setFromEvent(e);
}
function stop() {
  dragging.value = false;
}
</script>
