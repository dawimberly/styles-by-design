<template>
  <div class="space-y-4 rounded-2xl bg-white p-4 shadow-sm">
    <div>
      <p class="text-sm font-medium text-ink">Measure from photos</p>
      <p class="mt-1 text-sm text-ink/55">
        Drop job photos, assign a tape reading to each slot, then build the L + peninsula. Reference shots stay in the
        strip — they do not feed the layout.
      </p>
    </div>

    <div>
      <label class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink px-4 py-2 text-sm">
        <input class="hidden" type="file" accept="image/*" multiple @change="onFiles" />
        Upload photos
      </label>
      <p v-if="!photos.length" class="mt-2 text-sm text-ink/45">No photos yet.</p>
    </div>

    <div v-if="photos.length" class="flex gap-2 overflow-x-auto pb-1">
      <button
        v-for="photo in photos"
        :key="photo.id"
        type="button"
        class="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border-2"
        :class="selectedPhotoId === photo.id ? 'border-ink' : 'border-sand'"
        @click="selectedPhotoId = photo.id"
      >
        <img :src="photo.url" :alt="photo.name" class="h-full w-full object-cover" />
        <span class="absolute bottom-0 left-0 right-0 bg-ink/70 px-1 text-[10px] text-cream truncate">{{
          photo.name
        }}</span>
      </button>
    </div>

    <div class="grid gap-3 md:grid-cols-2">
      <div
        v-for="slot in slots"
        :key="slot.id"
        class="rounded-xl border border-sand bg-cream/50 p-3"
      >
        <p class="text-sm font-medium text-ink">{{ slot.title }}</p>
        <p class="mt-0.5 text-xs text-ink/50">{{ slot.hint }}</p>
        <div class="mt-2 flex flex-wrap items-end gap-2">
          <label class="text-xs">
            <span class="mb-1 block text-ink/60">Photo</span>
            <select v-model="slot.photoId" class="max-w-[10rem] rounded border border-sand bg-white px-2 py-1.5 text-sm">
              <option value="">—</option>
              <option v-for="photo in photos" :key="photo.id" :value="photo.id">{{ photo.name }}</option>
            </select>
          </label>
          <label class="text-xs">
            <span class="mb-1 block text-ink/60">Inches</span>
            <input
              v-model.number="slot.inches"
              type="number"
              min="12"
              step="0.25"
              class="w-24 rounded border border-sand bg-white px-2 py-1.5 text-sm"
            />
          </label>
          <button
            v-if="selectedPhotoId"
            type="button"
            class="rounded-full border border-sand px-3 py-1.5 text-xs"
            @click="slot.photoId = selectedPhotoId"
          >
            Use selected
          </button>
        </div>
        <div v-if="slot.photoId" class="mt-2 h-16 w-24 overflow-hidden rounded border border-sand">
          <img :src="photoUrl(slot.photoId)" alt="" class="h-full w-full object-cover" />
        </div>
      </div>
    </div>

    <div>
      <p class="mb-2 text-sm font-medium text-ink">Reference (no measure)</p>
      <div class="flex min-h-[4.5rem] flex-wrap gap-2 rounded-xl border border-dashed border-sand p-2">
        <button
          v-for="photo in referencePhotos"
          :key="photo.id"
          type="button"
          class="h-16 w-24 overflow-hidden rounded-lg border border-sand opacity-80"
          title="Reference only"
          @click="selectedPhotoId = photo.id"
        >
          <img :src="photo.url" :alt="photo.name" class="h-full w-full object-cover" />
        </button>
        <p v-if="!referencePhotos.length" class="self-center text-xs text-ink/40">
          Photos not assigned to a slot stay here.
        </p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <button type="button" class="rounded-full bg-ink px-5 py-2 text-sm text-cream" @click="build">
        Build layout
      </button>
      <p class="text-sm text-ink/50">
        Builds L walls + 24" peninsula + living-end door. No cabinets from photos.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { buildMeasuredLKitchen } from "../utils/kitchen-layouts";
import type { PlanFootprint, PlanItem, PlanLine } from "../utils/kitchen-plan";

const emit = defineEmits<{ built: [] }>();

const lines = defineModel<PlanLine[]>("lines", { default: () => [] });
const footprints = defineModel<PlanFootprint[]>("footprints", { default: () => [] });
const items = defineModel<PlanItem[]>("items", { default: () => [] });

type Photo = { id: string; name: string; url: string };

type Slot = {
  id: "peninsula" | "depth" | "livingGap" | "rangeWall" | "aisle";
  title: string;
  hint: string;
  inches: number;
  photoId: string;
  required: boolean;
};

const photos = ref<Photo[]>([]);
const selectedPhotoId = ref("");

const slots = ref<Slot[]>([
  {
    id: "peninsula",
    title: "1. Peninsula length",
    hint: "Tape on granite beside sink",
    inches: 71,
    photoId: "",
    required: true,
  },
  {
    id: "depth",
    title: "2. Kitchen depth",
    hint: "Floor tape carpet → fridge",
    inches: 124,
    photoId: "",
    required: true,
  },
  {
    id: "livingGap",
    title: "3. Opening at living end",
    hint: "Peninsula end → door wall",
    inches: 39,
    photoId: "",
    required: true,
  },
  {
    id: "rangeWall",
    title: "4. Range-wall length (optional)",
    hint: "L return / range run",
    inches: 0,
    photoId: "",
    required: false,
  },
  {
    id: "aisle",
    title: "5. Aisle width (optional)",
    hint: "Peninsula face → range",
    inches: 0,
    photoId: "",
    required: false,
  },
]);

const assignedIds = computed(() => new Set(slots.value.map((s) => s.photoId).filter(Boolean)));
const referencePhotos = computed(() => photos.value.filter((p) => !assignedIds.value.has(p.id)));

function photoUrl(id: string) {
  return photos.value.find((p) => p.id === id)?.url || "";
}

function onFiles(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = [...(input.files || [])];
  for (const file of files) {
    const url = URL.createObjectURL(file);
    photos.value.push({ id: crypto.randomUUID(), name: file.name, url });
  }
  if (!selectedPhotoId.value && photos.value.length) selectedPhotoId.value = photos.value[0].id;
  input.value = "";
}

function slotInches(id: Slot["id"]) {
  return slots.value.find((s) => s.id === id)?.inches || 0;
}

function build() {
  if (lines.value.length) {
    const ok = window.confirm("Replace existing walls with measured L + peninsula?");
    if (!ok) return;
  }
  const built = buildMeasuredLKitchen({
    peninsulaLengthIn: slotInches("peninsula") || 71,
    kitchenDepthIn: slotInches("depth") || 124,
    livingEndGapIn: slotInches("livingGap") || 39,
    peninsulaDepthIn: 24,
    rangeWallIn: slotInches("rangeWall") > 0 ? slotInches("rangeWall") : undefined,
    aisleWidthIn: slotInches("aisle") > 0 ? slotInches("aisle") : undefined,
  });
  lines.value = built.lines;
  footprints.value = built.footprints;
  // Keep non-door utilities/stock; drop prior living-end door from a rebuild.
  const keep = items.value.filter((item) => !(item.labelId === "door" && item.note === "Living end"));
  items.value = [...keep, built.door];
  emit("built");
}

onBeforeUnmount(() => {
  for (const photo of photos.value) URL.revokeObjectURL(photo.url);
});
</script>
