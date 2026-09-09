<template>
  <PageHeader
    subtitle="Kitchen plan"
    title="Walls, then utilities, then appliances — ship with the purchase email."
  />

  <div class="mx-auto max-w-6xl space-y-8 px-4 py-12">
    <p class="max-w-3xl text-lg leading-relaxed text-ink/75">
      Start from a layout shape (L, U, galley, or single), optionally add an island, then utilities and stock cabinets.
      Each grid square is 6" (bold square = 1'). Package the design into the same email as the cabinet purchase for San
      Antonio shipping. {{ SITE.preferredContractorOffer }}
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
          Start from a single wall, galley, L, or U — type the real lengths — then tweak on the sheet. You can still
          place extra walls by hand.
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
          Place doors, windows, outlets, and plumbing on the plan. Walls stay visible. Type sizes in inches and rotate
          as needed.
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
          Continue to appliances →
        </button>
      </div>
    </section>

    <section v-else-if="step === 3" class="space-y-4">
      <div>
        <h2 class="font-serif text-3xl">Step 3 — Appliances & cabinets</h2>
        <p class="mt-2 max-w-2xl text-ink/70">
          Start with a standard sink · dishwasher · range · fridge set (same idea as guided retail tools), then fill
          remaining runs with Northville stock. Drag to fine-tune; no finish picker or 3D showroom — this stays a
          supplier plan.
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
          Continue to package →
        </button>
      </div>
    </section>

    <section v-else class="space-y-4">
      <div>
        <h2 class="font-serif text-3xl">Step 4 — Package design with the purchase email</h2>
        <p class="mt-2 max-w-2xl text-ink/70">
          Download the four-page PDF and copy the takeoff into the same email as the cabinet purchase. Homeowners can
          also send it to our preferred contractor to negotiate install.
        </p>
      </div>

      <div class="rounded-2xl border border-sand bg-white p-5 text-sm text-ink/70">
        <p>
          Walls:
          <span class="font-medium text-ink">{{ planLines.length }} line{{ planLines.length === 1 ? "" : "s" }}</span>
        </p>
        <p class="mt-1">
          Utilities:
          <span class="font-medium text-ink">{{ utilityCount }}</span>
          · Appliances & cabinets:
          <span class="font-medium text-ink">{{ applianceCount }}</span>
        </p>
        <ul v-if="takeoff.length" class="mt-4 space-y-1 border-t border-sand pt-3">
          <li v-for="line in takeoff" :key="line.sku + (line.note || '')" class="flex justify-between gap-3">
            <span class="font-medium text-ink">{{ line.qty }}× {{ line.sku }}</span>
            <span>{{ line.name }} · {{ inchesToFeetInches(line.width) }}{{ line.note ? ` · ${line.note}` : "" }}</span>
          </li>
        </ul>
        <p v-else class="mt-3 text-ink/50">Place stock cabinets in step 3 to build a takeoff.</p>
        <div class="mt-4 flex flex-wrap gap-2">
          <button type="button" class="rounded-full bg-ink px-5 py-2 text-cream" @click="downloadPdfPack">
            Download plan PDF
          </button>
          <button type="button" class="rounded-full border border-ink px-5 py-2" @click="printPlan">
            Print
          </button>
        </div>
      </div>

      <form class="grid gap-4 rounded-2xl bg-white p-8 shadow-sm md:grid-cols-2" @submit.prevent="copyPackage">
        <input v-model="name" required class="rounded-lg border border-sand px-4 py-3" placeholder="Your name / studio" />
        <input v-model="email" required type="email" class="rounded-lg border border-sand px-4 py-3" placeholder="Email" />
        <input v-model="phone" class="rounded-lg border border-sand px-4 py-3" placeholder="Phone" />
        <input
          v-model="poRef"
          class="rounded-lg border border-sand px-4 py-3"
          placeholder="PO / order # (paste with purchase)"
        />
        <select v-model="role" class="rounded-lg border border-sand px-4 py-3 md:col-span-2">
          <option value="designer">I am a designer — ship with my cabinet purchase</option>
          <option value="homeowner">I am a homeowner — negotiate install with preferred contractor</option>
        </select>
        <input
          v-model="budget"
          class="rounded-lg border border-sand px-4 py-3 md:col-span-2"
          placeholder="Target budget (optional)"
        />
        <textarea
          v-model="notes"
          rows="4"
          class="rounded-lg border border-sand px-4 py-3 md:col-span-2"
          placeholder="Finish, island, timeline, ship-to notes, anything the sketch misses"
        />
        <p v-if="msg" class="md:col-span-2 text-moss">{{ msg }}</p>
        <div class="flex flex-wrap gap-3 md:col-span-2">
          <button type="button" class="rounded-full border border-sand px-5 py-3" @click="goTo(3)">← Back</button>
          <button class="rounded-full bg-ink px-6 py-3 text-cream" type="submit" :disabled="sending">
            {{ sending ? "Preparing…" : "Copy design + purchase package" }}
          </button>
          <a
            v-if="role === 'homeowner'"
            :href="SITE.preferredContractorUrl"
            class="rounded-full border border-ink px-6 py-3 text-ink"
            target="_blank"
            rel="noreferrer"
          >
            Open {{ SITE.preferredContractorCta.toLowerCase() }} →
          </a>
          <NuxtLink v-else to="/contractors" class="rounded-full border border-ink px-6 py-3 text-ink">
            Open contractor / trade purchase →
          </NuxtLink>
        </div>
        <p class="md:col-span-2 text-sm text-ink/50">
          Paste the copied package into the purchase email and attach the PDF. Design help:
          <NuxtLink to="/contact" class="text-moss hover:underline">Contact Styles by Design</NuxtLink>.
        </p>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  CELL_INCHES,
  PLAN_STEPS,
  footprintSummary,
  inchesToFeetInches,
  itemSummary,
  labelMeta,
  lineSummary,
  type PlanFootprint,
  type PlanItem,
  type PlanLine,
  type PlanStepId,
} from "../utils/kitchen-plan";
import {
  buildPlanSvg,
  buildTakeoff,
  downloadTextFile,
  takeoffSummary,
} from "../utils/kitchen-stock";
import { buildPlanPdf, downloadPdf } from "../utils/kitchen-pdf";

const step = ref<PlanStepId>(1);
const planFootprints = ref<PlanFootprint[]>([]);
const planItems = ref<PlanItem[]>([]);
const planLines = ref<PlanLine[]>([]);
const wallsBoard = ref<{ scrollToWalls?: () => void } | null>(null);
const name = ref("");
const email = ref("");
const phone = ref("");
const poRef = ref("");
const role = ref<"designer" | "homeowner">("designer");
const budget = ref("");
const notes = ref("");
const msg = ref("");
const sending = ref(false);

const utilityCount = computed(
  () => planItems.value.filter((item) => labelMeta(item.labelId).category === "utility").length,
);
const applianceCount = computed(
  () => planItems.value.filter((item) => labelMeta(item.labelId).category === "appliance").length,
);
const takeoff = computed(() => buildTakeoff(planItems.value.filter((item) => labelMeta(item.labelId).category === "appliance")));

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
  nextTick(() => wallsBoard.value?.scrollToWalls?.());
}

function summarize() {
  const lines = [
    `Kitchen design package — ${SITE.name}`,
    `Scale: each square = ${CELL_INCHES}" · bold square = 1'`,
    `Role: ${role.value === "designer" ? "Designer — include with cabinet purchase / ship to SA" : "Homeowner — negotiate install"}`,
    `Preferred contractor offer: ${SITE.preferredContractorOffer}`,
    "",
    `Name / studio: ${name.value}`,
    `Email: ${email.value}`,
    `Phone: ${phone.value || "(none)"}`,
    `PO / order #: ${poRef.value || "(attach when purchasing)"}`,
    `Target budget: ${budget.value || "(not set)"}`,
    `Notes: ${notes.value || "(none)"}`,
    "",
    "Walls (one line each):",
  ];
  if (!planLines.value.length) lines.push("(none)");
  for (const line of planLines.value) lines.push(`- ${lineSummary(line)}`);
  lines.push("", "Room fills:");
  if (!planFootprints.value.length) lines.push("(none)");
  for (const fp of planFootprints.value) lines.push(`- ${footprintSummary(fp)}`);
  lines.push("", "Utilities:");
  const utilities = planItems.value.filter((item) => labelMeta(item.labelId).category === "utility");
  if (!utilities.length) lines.push("(none)");
  for (const item of utilities) lines.push(`- ${itemSummary(item)}`);
  lines.push("", "Appliances & cabinets:");
  const appliances = planItems.value.filter((item) => labelMeta(item.labelId).category === "appliance");
  if (!appliances.length) lines.push("(none)");
  for (const item of appliances) lines.push(`- ${itemSummary(item)}`);
  lines.push("", "Stock takeoff:");
  lines.push(takeoffSummary(appliances));
  lines.push(
    "",
    "Attach kitchen-plan.pdf (Download plan PDF) to this email — do not attach an SVG.",
    role.value === "designer"
      ? "Please keep this design with the cabinet purchase email for San Antonio shipping."
      : "Please reply with an install quote and options we can negotiate.",
  );
  return lines.join("\n");
}

async function copyPackage() {
  msg.value = "";
  sending.value = true;
  try {
    await navigator.clipboard.writeText(summarize());
    msg.value =
      role.value === "designer"
        ? "Design package copied. Paste it into the same email as your cabinet purchase and attach the PDF."
        : "Package copied. Paste it when you contact the preferred contractor.";
  } catch {
    msg.value = "Could not copy automatically — summary logged to the browser console.";
    console.log(summarize());
  } finally {
    sending.value = false;
  }
}

function planOpts() {
  return {
    lines: planLines.value,
    items: planItems.value,
    footprints: planFootprints.value,
    title: name.value ? `Kitchen plan - ${name.value}` : "Kitchen plan",
    studio: SITE.name,
  };
}

function downloadSvg() {
  downloadTextFile("kitchen-plan.svg", buildPlanSvg(planOpts()), "image/svg+xml");
}

function downloadPdfPack() {
  downloadPdf("kitchen-plan.pdf", buildPlanPdf(planOpts()));
}

function printPlan() {
  const svg = buildPlanSvg(planOpts());
  const win = window.open("", "_blank");
  if (!win) {
    downloadPdfPack();
    return;
  }
  win.document.open();
  win.document.write("<!doctype html><title>Kitchen plan</title>");
  win.document.write('<body style="margin:0;background:#f7f3ea">');
  win.document.write(svg);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 250);
}

useSeoMeta({
  title: "Plan my kitchen",
  description: "Walls, utilities, then appliances — package a kitchen design with the cabinet purchase email.",
});
</script>
