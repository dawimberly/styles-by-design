<template>
  <div class="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
    <div>
      <p class="text-sm font-medium text-ink">Choose kitchen layout</p>
      <p class="mt-1 text-sm text-ink/55">
        Pick a shape, type real wall lengths, then place it on the sheet. Drag walls or the island after if needed.
      </p>
    </div>

    <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      <button
        v-for="shape in LAYOUT_SHAPES"
        :key="shape.id"
        type="button"
        class="rounded-xl border px-3 py-3 text-left text-sm transition"
        :class="picked === shape.id ? 'border-ink bg-ink text-cream' : 'border-sand bg-cream hover:border-ink/40'"
        @click="picked = shape.id"
      >
        <svg
          class="mb-2 h-12 w-full"
          viewBox="0 0 88 64"
          fill="none"
          aria-hidden="true"
          :class="picked === shape.id ? 'text-cream' : 'text-ink'"
        >
          <template v-if="shape.id === 'single'">
            <path d="M12 34 H76" stroke="currentColor" stroke-width="5" stroke-linecap="square" />
            <rect x="28" y="36" width="14" height="10" fill="currentColor" opacity="0.35" />
            <rect x="46" y="36" width="10" height="10" fill="currentColor" opacity="0.2" />
          </template>
          <template v-else-if="shape.id === 'galley'">
            <path d="M14 16 H74" stroke="currentColor" stroke-width="5" stroke-linecap="square" />
            <path d="M14 48 H74" stroke="currentColor" stroke-width="5" stroke-linecap="square" />
            <rect x="30" y="18" width="12" height="8" fill="currentColor" opacity="0.35" />
            <rect x="48" y="40" width="10" height="8" fill="currentColor" opacity="0.2" />
          </template>
          <template v-else-if="shape.id === 'ell'">
            <path d="M22 12 V50 H74" stroke="currentColor" stroke-width="5" stroke-linecap="square" />
            <rect x="24" y="28" width="10" height="12" fill="currentColor" opacity="0.2" />
            <rect x="40" y="40" width="14" height="10" fill="currentColor" opacity="0.35" />
            <rect x="58" y="40" width="10" height="10" fill="currentColor" opacity="0.2" />
          </template>
          <template v-else>
            <path d="M18 14 V50 H70 V14" stroke="currentColor" stroke-width="5" stroke-linecap="square" />
            <rect x="20" y="28" width="10" height="12" fill="currentColor" opacity="0.2" />
            <rect x="36" y="40" width="14" height="10" fill="currentColor" opacity="0.35" />
            <rect x="58" y="28" width="10" height="12" fill="currentColor" opacity="0.2" />
          </template>
        </svg>
        <span class="block font-medium">{{ shape.name }}</span>
        <span class="mt-1 block text-xs opacity-80">{{ shape.blurb }}</span>
      </button>
    </div>

    <div class="flex flex-wrap items-end gap-3">
      <label class="text-sm">
        <span class="mb-1 block font-medium text-ink/70">{{ labelA }}</span>
        <input
          v-model.number="aInches"
          type="number"
          min="24"
          step="1"
          class="w-28 rounded-lg border border-sand bg-cream px-3 py-2"
        />
      </label>
      <label v-if="picked !== 'single'" class="text-sm">
        <span class="mb-1 block font-medium text-ink/70">{{ labelB }}</span>
        <input
          v-model.number="bInches"
          type="number"
          min="24"
          step="1"
          class="w-28 rounded-lg border border-sand bg-cream px-3 py-2"
        />
      </label>
      <label class="flex items-center gap-2 pb-2 text-sm text-ink/80">
        <input v-model="addIsland" type="checkbox" class="h-4 w-4 rounded border-sand" />
        Add an island (if there is room)
      </label>
      <button type="button" class="rounded-full bg-ink px-5 py-2 text-sm text-cream" @click="place">
        Place layout on sheet
      </button>
      <p class="w-full text-sm text-ink/50">{{ hint }}</p>
    </div>

    <div v-if="addIsland" class="flex flex-wrap items-end gap-3 border-t border-sand/70 pt-4">
      <label class="text-sm">
        <span class="mb-1 block font-medium text-ink/70">Island width (in)</span>
        <input
          v-model.number="islandW"
          type="number"
          min="24"
          step="1"
          class="w-28 rounded-lg border border-sand bg-cream px-3 py-2"
        />
      </label>
      <label class="text-sm">
        <span class="mb-1 block font-medium text-ink/70">Island depth (in)</span>
        <input
          v-model.number="islandD"
          type="number"
          min="18"
          step="1"
          class="w-28 rounded-lg border border-sand bg-cream px-3 py-2"
        />
      </label>
      <button type="button" class="rounded-full border border-ink px-5 py-2 text-sm" @click="placeIslandOnly">
        Add island only
      </button>
      <p class="text-sm text-ink/50">Island is a freestanding rectangle — drag it on the grid after it lands.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LAYOUT_SHAPES, buildIsland, buildLayout, type LayoutShapeId } from "../utils/kitchen-layouts";
import type { PlanFootprint, PlanLine } from "../utils/kitchen-plan";

const emit = defineEmits<{ placed: [] }>();

const lines = defineModel<PlanLine[]>("lines", { default: () => [] });
const footprints = defineModel<PlanFootprint[]>("footprints", { default: () => [] });

const picked = ref<LayoutShapeId>("ell");
const aInches = ref(120);
const bInches = ref(96);
const addIsland = ref(true);
const islandW = ref(72);
const islandD = ref(36);

const labelA = computed(() => {
  if (picked.value === "single") return "Run length (in)";
  if (picked.value === "galley") return "Run length (in)";
  if (picked.value === "u") return "Back wall (in)";
  return "Long wall (in)";
});

const labelB = computed(() => {
  if (picked.value === "galley") return "Space between walls (in)";
  if (picked.value === "u") return "Arm depth (in)";
  return "Short wall (in)";
});

const hint = computed(() => {
  if (picked.value === "single") return "One wall across the sheet.";
  if (picked.value === "galley") return 'Two parallel walls. Keep 48"+ between faces if people walk through.';
  if (picked.value === "u") return "U opens toward the top of the sheet.";
  return "L meets at the lower-left corner.";
});

function place() {
  if (lines.value.length) {
    const ok = window.confirm("Replace existing walls with this layout?");
    if (!ok) return;
  }
  const next = buildLayout({
    shape: picked.value,
    aInches: aInches.value,
    bInches: bInches.value,
  });
  const fps: PlanFootprint[] = next.footprint ? [next.footprint] : [];
  if (addIsland.value) fps.push(buildIsland(islandW.value, islandD.value));
  lines.value = next.lines;
  footprints.value = fps;
  emit("placed");
}

function placeIslandOnly() {
  footprints.value = [...footprints.value, buildIsland(islandW.value, islandD.value)];
  emit("placed");
}
</script>
