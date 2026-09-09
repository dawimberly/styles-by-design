<template>
  <div class="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
    <div>
      <p class="text-sm font-medium text-ink">Start from a kitchen shape</p>
      <p class="mt-1 text-sm text-ink/55">
        Pick the layout, type real wall lengths in inches, then place it on the sheet. You can still drag or add extra
        walls after.
      </p>
    </div>

    <div class="grid gap-2 sm:grid-cols-4">
      <button
        v-for="shape in LAYOUT_SHAPES"
        :key="shape.id"
        type="button"
        class="rounded-xl border px-3 py-3 text-left text-sm transition"
        :class="picked === shape.id ? 'border-ink bg-ink text-cream' : 'border-sand bg-cream hover:border-ink/40'"
        @click="picked = shape.id"
      >
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
      <button type="button" class="rounded-full bg-ink px-5 py-2 text-sm text-cream" @click="place">
        Place layout on sheet
      </button>
      <p class="text-sm text-ink/50">{{ hint }}</p>
    </div>

    <div class="flex flex-wrap items-end gap-3 border-t border-sand/70 pt-4">
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
      <button type="button" class="rounded-full border border-ink px-5 py-2 text-sm" @click="placeIsland">
        Add island rectangle
      </button>
      <p class="text-sm text-ink/50">Optional freestanding box — not a fifth room shape.</p>
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
  lines.value = next.lines;
  footprints.value = next.footprint ? [next.footprint] : [];
  emit("placed");
}

function placeIsland() {
  footprints.value = [...footprints.value, buildIsland(islandW.value, islandD.value)];
  emit("placed");
}
</script>
