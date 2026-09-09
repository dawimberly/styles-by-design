<template>
  <div class="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm">
    <label class="text-sm">
      <span class="mb-1 block font-medium text-ink/70">Fill wall</span>
      <select v-model="wallId" class="rounded-lg border border-sand bg-cream px-3 py-2">
        <option value="">Select a wall</option>
        <option v-for="line in lines" :key="line.id" :value="line.id">
          {{ line.label || "Wall" }} · {{ inchesToFeetInches(line.lengthInches) }}
        </option>
      </select>
    </label>
    <button
      type="button"
      class="rounded-full bg-ink px-4 py-2 text-sm text-cream disabled:opacity-40"
      :disabled="!wallId"
      @click="fill('base')"
    >
      Fill bases
    </button>
    <button
      type="button"
      class="rounded-full border border-ink px-4 py-2 text-sm disabled:opacity-40"
      :disabled="!wallId"
      @click="fill('wall')"
    >
      Fill wall cabs
    </button>
    <p class="w-full text-sm text-ink/55">
      Packs the selected wall with Northville stock widths (B36 → B12, or Wxx30) and a field-cut filler for the leftover.
    </p>
  </div>
</template>

<script setup lang="ts">
import { inchesToFeetInches, type PlanItem, type PlanLine } from "../utils/kitchen-plan";
import { fillWallWithStock } from "../utils/kitchen-stock";

const lines = defineModel<PlanLine[]>("lines", { default: () => [] });
const items = defineModel<PlanItem[]>("items", { default: () => [] });
const wallId = ref("");

function fill(kind: "base" | "wall") {
  const line = lines.value.find((l) => l.id === wallId.value);
  if (!line) return;
  const packed = fillWallWithStock(line, kind);
  const keep = items.value.filter((item) => {
    if (item.wallId !== line.id) return true;
    return kind === "base" ? item.labelId === "wall-cab" : item.labelId !== "wall-cab";
  });
  items.value = [...keep, ...packed];
}
</script>
