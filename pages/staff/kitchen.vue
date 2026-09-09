<template>
  <PageHeader
    subtitle="Staff · kitchen"
    title="Kitchen estimator — staff"
  />

  <div class="mx-auto max-w-6xl space-y-8 px-4 py-12">
    <p class="max-w-3xl text-lg leading-relaxed text-ink/75">
      Sketch the kitchen, pack Northville stock, export for Flip Fixer. Walls and peninsula on the sheet → utilities →
      SKUs → PDF + room-scan JSON + cabinet takeoff. Internal only — same shop job as the Flip Fixer estimator.
    </p>

    <ol class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <li v-for="s in PLAN_STEPS" :key="s.id">
        <button
          type="button"
          class="w-full rounded-2xl border px-4 py-4 text-left transition"
          :class="
            step === s.id
              ? 'border-ink bg-ink text-cream'
              : canGoTo(s.id)
                ? 'border-sand bg-white hover:border-ink/40'
                : 'cursor-not-allowed border-sand/60 bg-cream/60 text-ink/40'
          "
          :disabled="!canGoTo(s.id)"
          @click="goTo(s.id)"
        >
          <p class="text-xs uppercase tracking-[0.14em] opacity-70">Step {{ s.id }}</p>
          <p class="mt-1 font-serif text-xl">{{ s.title }}</p>
          <p class="mt-1 text-sm opacity-80">{{ s.blurb }}</p>
        </button>
      </li>
    </ol>

    <section v-if="step === 1" class="space-y-4">
      <div>
        <h2 class="font-serif text-3xl">Step 1 — Walls</h2>
        <p class="mt-2 max-w-2xl text-ink/70">
          Layout template or hand-drawn walls. Add a peninsula rectangle if needed — drag and resize on the grid.
        </p>
      </div>
      <KitchenLayoutStarter
        v-model:lines="planLines"
        v-model:footprints="planFootprints"
        @placed="onLayoutPlaced"
      />
      <KitchenPlanBoard
        ref="wallsBoard"
        phase="walls"
        v-model:footprints="planFootprints"
        v-model:items="planItems"
        v-model:lines="planLines"
      />
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="text-sm text-ink/55">
          {{
            planLines.length
              ? `${planLines.length} wall line${planLines.length === 1 ? "" : "s"}`
              : "Add at least one wall line to continue"
          }}
        </p>
        <button
          type="button"
          class="rounded-full bg-ink px-6 py-3 text-cream disabled:opacity-40"
          :disabled="!planLines.length"
          @click="goTo(2)"
        >
          Continue to utilities →
        </button>
      </div>
    </section>

    <section v-else-if="step === 2" class="space-y-4">
      <div>
        <h2 class="font-serif text-3xl">Step 2 — Utilities</h2>
        <p class="mt-2 max-w-2xl text-ink/70">
          Doors, windows, outlets, plumbing. These feed the room-scan export Flip Fixer loads.
        </p>
      </div>
      <KitchenPlanBoard
        phase="utilities"
        v-model:footprints="planFootprints"
        v-model:items="planItems"
        v-model:lines="planLines"
      />
      <div class="flex flex-wrap items-center justify-between gap-3">
        <button type="button" class="rounded-full border border-sand px-5 py-3" @click="goTo(1)">← Back</button>
        <button type="button" class="rounded-full bg-ink px-6 py-3 text-cream" @click="goTo(3)">
          Continue to stock →
        </button>
      </div>
    </section>

    <section v-else-if="step === 3" class="space-y-4">
      <div>
        <h2 class="font-serif text-3xl">Step 3 — Appliances & stock</h2>
        <p class="mt-2 max-w-2xl text-ink/70">
          Place sink · DW · range · fridge, then fill runs with Northville widths (B24, W2430, FLR*). No prices here —
          estimator owns pricing.
        </p>
      </div>
      <KitchenPlanBoard
        phase="appliances"
        v-model:footprints="planFootprints"
        v-model:items="planItems"
        v-model:lines="planLines"
      />
      <KitchenRunTools v-model:lines="planLines" v-model:items="planItems" />
      <div class="flex flex-wrap items-center justify-between gap-3">
        <button type="button" class="rounded-full border border-sand px-5 py-3" @click="goTo(2)">← Back</button>
        <button type="button" class="rounded-full bg-ink px-6 py-3 text-cream" @click="goTo(4)">
          Continue to export →
        </button>
      </div>
    </section>

    <section v-else class="space-y-4">
      <div>
        <h2 class="font-serif text-3xl">Step 4 — Export for Flip Fixer</h2>
        <p class="mt-2 max-w-2xl text-ink/70">
          PDF for the job folder. Room-scan JSON for estimator quantities. Cabinet takeoff JSON for SKU lines. No
          purchase-email packaging.
        </p>
      </div>

      <div class="rounded-2xl border border-sand bg-white p-5 text-sm text-ink/70">
        <label class="mb-3 block text-sm">
          <span class="mb-1 block font-medium text-ink/70">Job id (optional)</span>
          <input
            v-model="jobId"
            class="w-full max-w-md rounded-lg border border-sand bg-cream px-3 py-2"
            placeholder="kitchen-123 / address shorthand"
          />
        </label>
        <p>
          Walls:
          <span class="font-medium text-ink">{{ planLines.length }}</span>
          · Utilities:
          <span class="font-medium text-ink">{{ utilityCount }}</span>
          · Stock pieces:
          <span class="font-medium text-ink">{{ applianceCount }}</span>
        </p>
        <ul v-if="takeoff.length" class="mt-4 space-y-1 border-t border-sand pt-3">
          <li v-for="line in takeoff" :key="line.sku + (line.note || '')" class="flex justify-between gap-3">
            <span class="font-medium text-ink">{{ line.qty }}× {{ line.sku }}</span>
            <span>{{ line.name }} · {{ inchesToFeetInches(line.width) }}{{ line.note ? ` · ${line.note}` : "" }}</span>
          </li>
        </ul>
        <p v-else class="mt-3 text-ink/50">Place stock in step 3 to build a takeoff.</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" class="rounded-full bg-ink px-5 py-2 text-cream" @click="downloadPdfPack">
            Download plan PDF
          </button>
          <button type="button" class="rounded-full border border-ink px-5 py-2" @click="downloadRoomScan">
            Download room scan JSON
          </button>
          <button type="button" class="rounded-full border border-ink px-5 py-2" @click="downloadCabinetJson">
            Download cabinet takeoff JSON
          </button>
          <button type="button" class="rounded-full border border-sand px-5 py-2" @click="copyTakeoff">
            Copy takeoff text
          </button>
        </div>
        <p v-if="msg" class="mt-3 text-moss">{{ msg }}</p>
        <div class="mt-4">
          <button type="button" class="rounded-full border border-sand px-5 py-3" @click="goTo(3)">← Back</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  PLAN_STEPS,
  inchesToFeetInches,
  labelMeta,
  type PlanFootprint,
  type PlanItem,
  type PlanLine,
  type PlanStepId,
} from "../../utils/kitchen-plan";
import { buildTakeoff, takeoffSummary } from "../../utils/kitchen-stock";
import { buildPlanPdf, downloadPdf } from "../../utils/kitchen-pdf";
import {
  buildCabinetTakeoffJson,
  buildRoomScanJson,
  downloadJson,
} from "../../utils/kitchen-export";

definePageMeta({ middleware: "staff" });

const step = ref<PlanStepId>(1);
const planFootprints = ref<PlanFootprint[]>([]);
const planItems = ref<PlanItem[]>([]);
const planLines = ref<PlanLine[]>([]);
const wallsBoard = ref<{ scrollToWalls?: () => void; selectMove?: () => void } | null>(null);
const jobId = ref("");
const msg = ref("");

const utilityCount = computed(
  () => planItems.value.filter((item) => labelMeta(item.labelId).category === "utility").length,
);
const applianceCount = computed(
  () => planItems.value.filter((item) => labelMeta(item.labelId).category === "appliance").length,
);
const takeoff = computed(() =>
  buildTakeoff(planItems.value.filter((item) => labelMeta(item.labelId).category === "appliance")),
);

function canGoTo(id: PlanStepId) {
  if (id === 1) return true;
  return planLines.value.length > 0;
}

function goTo(id: PlanStepId) {
  if (!canGoTo(id)) return;
  step.value = id;
  msg.value = "";
}

function onLayoutPlaced() {
  nextTick(() => {
    wallsBoard.value?.selectMove?.();
    wallsBoard.value?.scrollToWalls?.();
  });
}

function exportOpts() {
  return {
    lines: planLines.value,
    items: planItems.value,
    footprints: planFootprints.value,
    jobId: jobId.value.trim() || undefined,
  };
}

function downloadPdfPack() {
  downloadPdf(
    "kitchen-plan.pdf",
    buildPlanPdf({
      ...exportOpts(),
      title: jobId.value.trim() ? `Kitchen — ${jobId.value.trim()}` : "Kitchen estimator",
      studio: SITE.name,
    }),
  );
  msg.value = "PDF downloaded.";
}

function downloadRoomScan() {
  downloadJson("kitchen-room-scan.json", buildRoomScanJson(exportOpts()));
  msg.value = "Room scan JSON downloaded — load in Flip Fixer estimator.";
}

function downloadCabinetJson() {
  downloadJson("kitchen-cabinet-takeoff.json", buildCabinetTakeoffJson(exportOpts()));
  msg.value = "Cabinet takeoff JSON downloaded.";
}

async function copyTakeoff() {
  const appliances = planItems.value.filter((item) => labelMeta(item.labelId).category === "appliance");
  const text = [
    `Kitchen takeoff — staff`,
    jobId.value.trim() ? `Job: ${jobId.value.trim()}` : "",
    takeoffSummary(appliances),
    "",
    "Send with kitchen-room-scan.json + kitchen-cabinet-takeoff.json to Flip Fixer estimator.",
  ]
    .filter(Boolean)
    .join("\n");
  try {
    await navigator.clipboard.writeText(text);
    msg.value = "Takeoff text copied.";
  } catch {
    msg.value = "Could not copy — check console.";
    console.log(text);
  }
}

useSeoMeta({
  title: "Kitchen estimator — staff",
  description: "Sketch the kitchen, pack Northville stock, export for Flip Fixer.",
  robots: "noindex, nofollow",
});
</script>
