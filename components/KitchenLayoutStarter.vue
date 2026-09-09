<template>
  <div class="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
    <div>
      <p class="text-sm font-medium text-ink">Choose kitchen layout</p>
      <p class="mt-1 text-sm text-ink/55">
        Pick a wall shape, type each wall length in inches, then place those walls on the sheet.
      </p>
    </div>

    <div class="grid gap-2 sm:grid-cols-4">
      <button
        v-for="shape in LAYOUT_SHAPES"
        :key="shape.id"
        type="button"
        class="rounded-xl border px-3 py-2.5 text-left text-sm transition"
        :class="picked === shape.id ? 'border-ink bg-ink text-cream' : 'border-sand bg-cream hover:border-ink/40'"
        @click="picked = shape.id"
      >
        <span class="block font-medium">{{ shape.name }}</span>
      </button>
    </div>

    <div class="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
      <div class="rounded-xl border border-sand bg-cream/60 p-4">
        <svg class="mx-auto h-44 w-full max-w-md text-ink" :viewBox="preview.viewBox" fill="none" aria-hidden="true">
          <path
            v-for="(seg, i) in preview.segments"
            :key="`seg-${i}`"
            :d="seg.d"
            stroke="currentColor"
            stroke-width="4"
            stroke-linecap="square"
          />
          <text
            v-for="(label, i) in preview.labels"
            :key="`lab-${i}`"
            :x="label.x"
            :y="label.y"
            text-anchor="middle"
            class="fill-ink text-[11px] font-medium"
          >
            {{ label.text }}
          </text>
        </svg>
        <p class="mt-2 text-center text-xs text-ink/50">{{ hint }}</p>
      </div>

      <div class="flex flex-col gap-3">
        <label class="text-sm">
          <span class="mb-1 block font-medium text-ink/70">{{ labelA }}</span>
          <input
            v-model.number="aInches"
            type="number"
            min="24"
            step="1"
            class="w-36 rounded-lg border border-sand bg-cream px-3 py-2"
          />
        </label>
        <label v-if="picked !== 'single'" class="text-sm">
          <span class="mb-1 block font-medium text-ink/70">{{ labelB }}</span>
          <input
            v-model.number="bInches"
            type="number"
            min="24"
            step="1"
            class="w-36 rounded-lg border border-sand bg-cream px-3 py-2"
          />
        </label>
        <label v-if="picked === 'u'" class="text-sm">
          <span class="mb-1 block font-medium text-ink/70">{{ labelC }}</span>
          <input
            v-model.number="cInches"
            type="number"
            min="24"
            step="1"
            class="w-36 rounded-lg border border-sand bg-cream px-3 py-2"
          />
        </label>
        <button type="button" class="rounded-full bg-ink px-5 py-2 text-sm text-cream" @click="place">
          Place walls on sheet
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3 border-t border-sand/70 pt-4">
      <label class="flex items-center gap-2 text-sm text-ink/80">
        <input v-model="addIsland" type="checkbox" class="h-4 w-4 rounded border-sand" />
        Also add an island rectangle
      </label>
      <template v-if="addIsland">
        <label class="text-sm">
          <span class="sr-only">Island width</span>
          <input
            v-model.number="islandW"
            type="number"
            min="24"
            step="1"
            class="w-24 rounded-lg border border-sand bg-cream px-3 py-2"
            title="Island width (in)"
          />
        </label>
        <span class="text-ink/40">×</span>
        <label class="text-sm">
          <span class="sr-only">Island depth</span>
          <input
            v-model.number="islandD"
            type="number"
            min="18"
            step="1"
            class="w-24 rounded-lg border border-sand bg-cream px-3 py-2"
            title="Island depth (in)"
          />
        </label>
        <span class="text-xs text-ink/50">in — drag after place</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LAYOUT_SHAPES, buildIsland, buildLayout, type LayoutShapeId } from "../utils/kitchen-layouts";
import { inchesToFeetInches, type PlanFootprint, type PlanLine } from "../utils/kitchen-plan";

const emit = defineEmits<{ placed: [] }>();

const lines = defineModel<PlanLine[]>("lines", { default: () => [] });
const footprints = defineModel<PlanFootprint[]>("footprints", { default: () => [] });

const picked = ref<LayoutShapeId>("ell");
const aInches = ref(120);
const bInches = ref(96);
const cInches = ref(96);
const addIsland = ref(false);
const islandW = ref(72);
const islandD = ref(36);

const labelA = computed(() => {
  if (picked.value === "single") return "Wall length (in)";
  if (picked.value === "galley") return "Each run length (in)";
  if (picked.value === "u") return "Back wall (in)";
  return "Long wall (in)";
});

const labelB = computed(() => {
  if (picked.value === "galley") return "Space between walls (in)";
  if (picked.value === "u") return "Left arm (in)";
  return "Short wall (in)";
});

const labelC = computed(() => "Right arm (in)");

const hint = computed(() => {
  if (picked.value === "single") return "One wall.";
  if (picked.value === "galley") return "Two parallel walls of equal length.";
  if (picked.value === "u") return "U opens toward the top of the sheet.";
  return "L: long wall along the bottom, short wall up the left.";
});

const preview = computed(() => {
  const a = Math.max(24, Number(aInches.value) || 24);
  const b = Math.max(24, Number(bInches.value) || 24);
  const c = Math.max(24, Number(cInches.value) || 24);
  const dim = (n: number) => inchesToFeetInches(n);
  const pad = 28;
  const vbW = 220;
  const vbH = 160;

  if (picked.value === "single") {
    const y = 80;
    const x1 = pad;
    const x2 = vbW - pad;
    return {
      viewBox: `0 0 ${vbW} ${vbH}`,
      segments: [{ d: `M${x1} ${y} H${x2}` }],
      labels: [{ x: (x1 + x2) / 2, y: y - 12, text: dim(a) }],
    };
  }

  if (picked.value === "galley") {
    const x1 = pad;
    const x2 = vbW - pad;
    const y1 = 44;
    const y2 = 116;
    return {
      viewBox: `0 0 ${vbW} ${vbH}`,
      segments: [
        { d: `M${x1} ${y1} H${x2}` },
        { d: `M${x1} ${y2} H${x2}` },
      ],
      labels: [
        { x: (x1 + x2) / 2, y: y1 - 10, text: dim(a) },
        { x: (x1 + x2) / 2, y: y2 + 18, text: dim(a) },
        { x: vbW - 18, y: (y1 + y2) / 2 + 4, text: dim(b) },
      ],
    };
  }

  if (picked.value === "ell") {
    const scale = Math.min((vbW - pad * 2) / a, (vbH - pad * 2) / b);
    const w = a * scale;
    const h = b * scale;
    const x0 = pad;
    const y0 = pad;
    const x1 = x0;
    const y1 = y0 + h;
    const x2 = x0 + w;
    return {
      viewBox: `0 0 ${vbW} ${vbH}`,
      segments: [{ d: `M${x1} ${y0} V${y1} H${x2}` }],
      labels: [
        { x: x1 - 4, y: (y0 + y1) / 2, text: dim(b) },
        { x: (x1 + x2) / 2, y: y1 + 16, text: dim(a) },
      ],
    };
  }

  // U: back = a, left = b, right = c
  const scale = Math.min((vbW - pad * 2) / a, (vbH - pad * 2) / Math.max(b, c));
  const w = a * scale;
  const hL = b * scale;
  const hR = c * scale;
  const x0 = (vbW - w) / 2;
  const yBottom = vbH - pad;
  const yTopL = yBottom - hL;
  const yTopR = yBottom - hR;
  const x1 = x0 + w;
  return {
    viewBox: `0 0 ${vbW} ${vbH}`,
    segments: [{ d: `M${x0} ${yTopL} V${yBottom} H${x1} V${yTopR}` }],
    labels: [
      { x: x0 - 6, y: (yTopL + yBottom) / 2, text: dim(b) },
      { x: (x0 + x1) / 2, y: yBottom + 16, text: dim(a) },
      { x: x1 + 6, y: (yTopR + yBottom) / 2, text: dim(c) },
    ],
  };
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
    cInches: cInches.value,
  });
  // Walls only — no bounding-box room fill (that made L/U look like a solid rectangle).
  const fps: PlanFootprint[] = addIsland.value ? [buildIsland(islandW.value, islandD.value)] : [];
  lines.value = next.lines;
  footprints.value = fps;
  emit("placed");
}
</script>
