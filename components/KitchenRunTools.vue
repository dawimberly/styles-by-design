<template>
  <div class="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
    <div class="flex flex-wrap items-end gap-3">
      <div class="min-w-[12rem] flex-1">
        <p class="text-sm font-medium text-ink">Appliance starter</p>
        <p class="mt-1 text-sm text-ink/55">
          Guided designs always include a dishwasher, refrigerator, and sink — plus a freestanding range. Place the set,
          then drag to fine-tune.
        </p>
      </div>
      <button
        type="button"
        class="rounded-full bg-ink px-4 py-2 text-sm text-cream disabled:opacity-40"
        :disabled="!lines.length"
        @click="placeStarter"
      >
        Place sink · DW · range · fridge
      </button>
    </div>

    <div class="flex flex-wrap items-end gap-3 border-t border-sand/70 pt-4">
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
        class="rounded-full border border-ink px-4 py-2 text-sm disabled:opacity-40"
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
  </div>
</template>

<script setup lang="ts">
import { inchesToFeetInches, type PlanItem, type PlanLine } from "../utils/kitchen-plan";
import { fillWallWithStock, placeStandardAppliances } from "../utils/kitchen-stock";

const lines = defineModel<PlanLine[]>("lines", { default: () => [] });
const items = defineModel<PlanItem[]>("items", { default: () => [] });
const wallId = ref("");

const STARTER_LABELS = new Set(["sink", "dishwasher", "range", "fridge"]);

function placeStarter() {
  if (!lines.value.length) return;
  const packed = placeStandardAppliances(lines.value);
  const keep = items.value.filter((item) => !STARTER_LABELS.has(item.labelId));
  items.value = [...keep, ...packed];
}

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
