<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-end gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <template v-if="phase === 'walls'">
        <div class="flex w-full flex-wrap gap-2">
          <button
            type="button"
            class="rounded-full border border-ink px-4 py-2 text-sm"
            :class="tool === 'move' ? 'bg-ink text-cream' : 'bg-cream'"
            @click="tool = 'move'"
          >
            Move / resize
          </button>
          <button
            type="button"
            class="rounded-full border border-ink px-4 py-2 text-sm"
            :class="tool === 'line' ? 'bg-ink text-cream' : 'bg-cream'"
            @click="tool = 'line'"
          >
            Place wall line
          </button>
          <button
            type="button"
            class="rounded-full border border-ink px-4 py-2 text-sm"
            :class="tool === 'erase' ? 'bg-ink text-cream' : 'bg-cream'"
            @click="tool = 'erase'"
          >
            Erase
          </button>
          <button
            type="button"
            class="rounded-full border border-sand px-4 py-2 text-sm disabled:opacity-40"
            :disabled="!lines.length"
            @click="recognizeRoomFromWalls"
          >
            Recognize room
          </button>
          <button type="button" class="rounded-full border border-sand px-4 py-2 text-sm" @click="clearWalls">
            Clear walls
          </button>
        </div>

        <template v-if="tool === 'line'">
          <label class="text-sm">
            <span class="mb-1 block font-medium text-ink/70">Length (in)</span>
            <input
              v-model.number="lineLengthIn"
              type="number"
              min="1"
              step="0.25"
              class="w-28 rounded-lg border border-sand bg-cream px-3 py-2"
            />
          </label>
          <label class="text-sm">
            <span class="mb-1 block font-medium text-ink/70">Angle (°)</span>
            <input
              v-model.number="lineAngle"
              type="number"
              step="1"
              class="w-24 rounded-lg border border-sand bg-cream px-3 py-2"
            />
          </label>
          <button type="button" class="rounded-full border border-sand px-3 py-2 text-sm" @click="lineAngle = (lineAngle + 90) % 360">
            +90°
          </button>
          <label class="text-sm">
            <span class="mb-1 block font-medium text-ink/70">Wall label (optional)</span>
            <input
              v-model="lineLabel"
              type="text"
              placeholder="North / island face"
              class="w-40 rounded-lg border border-sand bg-cream px-3 py-2"
            />
          </label>
          <div class="flex flex-wrap items-center gap-2 pb-1">
            <span class="text-xs font-medium text-ink/55">Line color</span>
            <button
              v-for="c in FOOTPRINT_COLORS"
              :key="c.id"
              type="button"
              class="h-7 w-7 rounded-full border-2"
              :class="lineColor === c.value ? 'border-ink scale-110' : 'border-white shadow'"
              :style="{ backgroundColor: c.value }"
              :title="c.name"
              @click="lineColor = c.value"
            />
          </div>
        </template>
        <p class="w-full text-sm text-ink/55">
          {{ scaleLegend() }}. Default is Move / resize — drag walls and islands, pull island corners to change size.
          Switch to Place wall line only when you need a new wall.
        </p>
      </template>

      <template v-else>
        <div class="flex w-full flex-wrap gap-2">
          <button
            type="button"
            class="rounded-full border border-ink px-4 py-2 text-sm"
            :class="tool === 'place' ? 'bg-ink text-cream' : 'bg-cream'"
            @click="tool = 'place'"
          >
            Place
          </button>
          <button
            type="button"
            class="rounded-full border border-ink px-4 py-2 text-sm"
            :class="tool === 'erase' ? 'bg-ink text-cream' : 'bg-cream'"
            @click="tool = 'erase'"
          >
            Erase
          </button>
        </div>

        <label class="text-sm">
          <span class="mb-1 block font-medium text-ink/70">Label</span>
          <select v-model="activeLabel" class="rounded-lg border border-sand bg-cream px-3 py-2">
            <option v-for="l in categoryLabels" :key="l.id" :value="l.id">{{ labelOptionText(l.id) }}</option>
          </select>
        </label>
        <label class="text-sm">
          <span class="mb-1 block font-medium text-ink/70">Width (in)</span>
          <input
            v-model.number="placeWidthIn"
            type="number"
            min="1"
            step="0.25"
            class="w-24 rounded-lg border border-sand bg-cream px-3 py-2"
          />
        </label>
        <label class="text-sm">
          <span class="mb-1 block font-medium text-ink/70">Depth (in)</span>
          <input
            v-model.number="placeDepthIn"
            type="number"
            min="1"
            step="0.25"
            class="w-24 rounded-lg border border-sand bg-cream px-3 py-2"
          />
        </label>
        <label class="text-sm">
          <span class="mb-1 block font-medium text-ink/70">Rotate (°)</span>
          <input
            v-model.number="placeRotation"
            type="number"
            step="1"
            class="w-24 rounded-lg border border-sand bg-cream px-3 py-2"
          />
        </label>
        <button type="button" class="rounded-full border border-sand px-3 py-2 text-sm" @click="nudgePlaceRotation(90)">
          +90°
        </button>
        <p class="w-full text-sm text-ink/55">
          {{ phase === "utilities" ? "Utilities only on this step." : "Appliances and cabinets on this step." }}
          Click to place · drag to move · right-click to rotate or delete. Walls stay on the board.
        </p>
      </template>
    </div>

    <div ref="scrollEl" class="overflow-auto rounded-2xl border border-sand bg-[#f7f3ea] p-3 shadow-sm">
      <div
        ref="boardEl"
        class="relative mx-auto touch-none select-none"
        :style="{ width: `${PLAN_COLS * PLAN_CELL_PX}px`, height: `${PLAN_ROWS * PLAN_CELL_PX}px` }"
        @pointerdown="onBoardDown"
        @contextmenu="onBoardContextMenu"
      >
        <div
          class="pointer-events-none absolute inset-0"
          :style="{
            backgroundImage: `
              linear-gradient(to right, rgba(31,42,36,0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(31,42,36,0.12) 1px, transparent 1px),
              linear-gradient(to right, rgba(31,42,36,0.28) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(31,42,36,0.28) 1px, transparent 1px)
            `,
            backgroundSize: `
              ${PLAN_CELL_PX}px ${PLAN_CELL_PX}px,
              ${PLAN_CELL_PX}px ${PLAN_CELL_PX}px,
              ${PLAN_CELL_PX * CELLS_PER_FOOT}px ${PLAN_CELL_PX * CELLS_PER_FOOT}px,
              ${PLAN_CELL_PX * CELLS_PER_FOOT}px ${PLAN_CELL_PX * CELLS_PER_FOOT}px
            `,
          }"
        />

        <svg class="absolute inset-0" :width="PLAN_COLS * PLAN_CELL_PX" :height="PLAN_ROWS * PLAN_CELL_PX">
          <polygon
            v-for="fp in closedFootprints"
            :key="`fill-${fp.id}`"
            :points="polyPoints(fp)"
            :fill="fp.color"
            fill-opacity="0.28"
            :stroke="fp.color"
            stroke-width="3"
            class="cursor-grab active:cursor-grabbing"
            :class="activeId === fp.id ? 'stroke-[4px]' : ''"
            @pointerdown.stop="onPolygonDown(fp, $event)"
            @contextmenu.stop.prevent="openFootprintMenu(fp, $event)"
          />
          <polyline
            v-for="fp in openFootprints"
            :key="`line-${fp.id}`"
            :points="polyPoints(fp)"
            fill="none"
            :stroke="fp.color"
            stroke-width="3"
            stroke-dasharray="6 5"
            stroke-linecap="square"
            class="pointer-events-none"
          />
          <g v-for="line in lines" :key="line.id">
            <line
              :x1="lineEndpoints(line).x1 * INCH_PX"
              :y1="lineEndpoints(line).y1 * INCH_PX"
              :x2="lineEndpoints(line).x2 * INCH_PX"
              :y2="lineEndpoints(line).y2 * INCH_PX"
              :stroke="line.color"
              stroke-width="10"
              stroke-opacity="0.01"
              stroke-linecap="round"
              class="cursor-grab"
              @pointerdown.stop="startLineDrag(line, $event)"
              @contextmenu.stop.prevent="openLineMenu(line, $event)"
            />
            <line
              :x1="lineEndpoints(line).x1 * INCH_PX"
              :y1="lineEndpoints(line).y1 * INCH_PX"
              :x2="lineEndpoints(line).x2 * INCH_PX"
              :y2="lineEndpoints(line).y2 * INCH_PX"
              :stroke="line.color"
              stroke-width="4"
              stroke-linecap="round"
              class="pointer-events-none"
            />
            <text
              v-if="line.label || line.lengthInches"
              :x="((lineEndpoints(line).x1 + lineEndpoints(line).x2) / 2) * INCH_PX"
              :y="((lineEndpoints(line).y1 + lineEndpoints(line).y2) / 2) * INCH_PX - 6"
              text-anchor="middle"
              class="pointer-events-none fill-ink text-[10px] font-medium"
            >
              {{ line.label ? `${line.label} · ` : "" }}{{ inchesToFeetInches(line.lengthInches) }}
            </text>
          </g>
        </svg>

        <button
          v-for="handle in pointHandles"
          :key="handle.key"
          type="button"
          class="absolute z-40 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-cream shadow cursor-nwse-resize"
          :class="activeId === handle.footprintId ? 'opacity-100 ring-2 ring-moss' : 'opacity-80'"
          :style="{ left: `${handle.x * PLAN_CELL_PX}px`, top: `${handle.y * PLAN_CELL_PX}px`, backgroundColor: handle.color }"
          :aria-label="`Resize corner ${handle.pointIndex + 1}`"
          :title="'Drag corner to resize'"
          @pointerdown.stop="startCornerResize(handle.footprintId, handle.pointIndex, $event)"
          @contextmenu.stop.prevent="openPointMenu(handle.footprintId, handle.pointIndex, $event)"
        />

        <div
          v-if="activeFootprintSize"
          class="pointer-events-none absolute z-40 rounded bg-ink px-2 py-1 text-[11px] font-medium text-cream shadow"
          :style="activeFootprintSize.style"
        >
          {{ activeFootprintSize.label }}
        </div>

        <!-- Utilities ghost under cabinets (true 6" footprint kept in data). -->
        <div
          v-for="mark in utilityMarks"
          :key="`ghost-${mark.item.id}`"
          class="pointer-events-none absolute z-[15] rounded-sm border border-ink/25 opacity-35"
          :style="itemStyle(mark.item)"
        />

        <div
          v-for="item in boxItems"
          :key="item.id"
          class="absolute z-20 flex items-center justify-center overflow-hidden rounded border border-ink/20 px-1 text-center text-[10px] font-medium leading-tight text-ink"
          :class="[
            phase !== 'walls' ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none opacity-90',
            menu?.kind === 'item' && menu.id === item.id ? 'ring-2 ring-moss' : '',
            phase !== 'walls' && !itemEditable(item) ? 'opacity-55' : '',
          ]"
          :style="itemStyle(item)"
          @pointerdown.stop="phase !== 'walls' ? startItemDrag(item, $event) : undefined"
          @contextmenu.stop.prevent="phase !== 'walls' ? openItemMenu(item, $event) : undefined"
        >
          {{ item.sku || labelMeta(item.labelId).name }}
          <span class="mt-0.5 block text-[9px] font-normal text-ink/60">
            {{ inchesToFeetInches(item.widthInches) }}×{{ inchesToFeetInches(item.depthInches) }}
            <template v-if="item.rotationDeg"> · {{ Math.round(item.rotationDeg) }}°</template>
          </span>
        </div>

        <!-- Readable E/P badges above cabinets; coordinates stay on the 6" cell. -->
        <button
          v-for="mark in utilityMarks"
          :key="`badge-${mark.item.id}`"
          type="button"
          class="absolute z-30 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-ink text-[11px] font-bold shadow"
          :class="[
            phase !== 'walls' && itemEditable(mark.item) ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none',
            menu?.kind === 'item' && menu.id === mark.item.id ? 'ring-2 ring-moss' : '',
          ]"
          :style="badgeStyle(mark.item)"
          :title="`${mark.mark}${mark.n} · ${labelMeta(mark.item.labelId).name}`"
          @pointerdown.stop="phase !== 'walls' ? startItemDrag(mark.item, $event) : undefined"
          @contextmenu.stop.prevent="phase !== 'walls' ? openItemMenu(mark.item, $event) : undefined"
        >
          {{ mark.mark }}{{ mark.n }}
        </button>
      </div>
      <p class="mt-2 text-xs text-ink/50">
        Board {{ inchesToFeetInches(cellsToInches(PLAN_COLS)) }} wide ×
        {{ inchesToFeetInches(cellsToInches(PLAN_ROWS)) }} deep. {{ scaleLegend() }}. Lines use typed inches (any
        fraction).
      </p>
    </div>

    <Teleport to="body">
      <div v-if="menu" class="fixed inset-0 z-[80]" @pointerdown="closeMenu" @contextmenu.prevent="closeMenu">
        <div
          class="absolute min-w-[12rem] overflow-hidden rounded-xl border border-sand bg-white py-1 text-sm shadow-lg"
          :style="{ left: `${menu.x}px`, top: `${menu.y}px` }"
          @pointerdown.stop
        >
          <p class="border-b border-sand/70 px-3 py-2 text-xs font-medium text-ink/55">{{ menu.title }}</p>

          <template v-if="menu.kind === 'item'">
            <button type="button" class="block w-full px-3 py-2 text-left hover:bg-cream" @click="rotateMenuItem(90)">
              Rotate 90°
            </button>
            <button type="button" class="block w-full px-3 py-2 text-left hover:bg-cream" @click="rotateMenuItem(-90)">
              Rotate −90°
            </button>
            <button type="button" class="block w-full px-3 py-2 text-left hover:bg-cream" @click="duplicateMenuItem">
              Duplicate
            </button>
            <button type="button" class="block w-full px-3 py-2 text-left text-red-700 hover:bg-red-50" @click="deleteFromMenu">
              Delete
            </button>
          </template>

          <template v-else-if="menu.kind === 'line'">
            <button type="button" class="block w-full px-3 py-2 text-left hover:bg-cream" @click="rotateMenuLine(90)">
              Rotate 90°
            </button>
            <button type="button" class="block w-full px-3 py-2 text-left hover:bg-cream" @click="rotateMenuLine(-90)">
              Rotate −90°
            </button>
            <button type="button" class="block w-full px-3 py-2 text-left hover:bg-cream" @click="menu.panel = 'edit-line'">
              Edit length / angle…
            </button>
            <button type="button" class="block w-full px-3 py-2 text-left text-red-700 hover:bg-red-50" @click="deleteFromMenu">
              Delete line
            </button>
          </template>

          <template v-else-if="menu.panel === 'edit-line'">
            <div class="space-y-2 px-3 py-3">
              <label class="block text-xs">
                Length (in)
                <input v-model.number="editLineLength" type="number" step="0.25" min="1" class="mt-1 w-full rounded border border-sand px-2 py-1" />
              </label>
              <label class="block text-xs">
                Angle (°)
                <input v-model.number="editLineAngle" type="number" step="1" class="mt-1 w-full rounded border border-sand px-2 py-1" />
              </label>
              <button type="button" class="rounded-full bg-ink px-3 py-1.5 text-cream" @click="applyLineEdit">Apply</button>
            </div>
          </template>

          <template v-else-if="menu.panel === 'colors'">
            <div class="grid grid-cols-4 gap-2 px-3 py-3">
              <button
                v-for="c in FOOTPRINT_COLORS"
                :key="c.id"
                type="button"
                class="h-8 w-8 rounded-full border border-sand"
                :style="{ backgroundColor: c.value }"
                :title="c.name"
                @click="applyMenuColor(c.value)"
              />
            </div>
            <button type="button" class="block w-full px-3 py-2 text-left text-ink/60 hover:bg-cream" @click="menu.panel = 'main'">
              ← Back
            </button>
          </template>

          <template v-else>
            <button
              v-if="menu.kind === 'point'"
              type="button"
              class="block w-full px-3 py-2 text-left hover:bg-cream"
              @click="deleteMenuPoint"
            >
              Delete point
            </button>
            <button type="button" class="block w-full px-3 py-2 text-left hover:bg-cream" @click="menu.panel = 'colors'">
              Change color…
            </button>
            <button type="button" class="block w-full px-3 py-2 text-left hover:bg-cream" @click="snapMenuFootprint">
              Recognize rectangle
            </button>
            <button type="button" class="block w-full px-3 py-2 text-left hover:bg-cream" @click="colorCombineMenu">
              Color combine
            </button>
            <button type="button" class="block w-full px-3 py-2 text-left text-red-700 hover:bg-red-50" @click="deleteFromMenu">
              Delete footprint
            </button>
          </template>
        </div>
      </div>
    </Teleport>

    <ul v-if="phase === 'walls' && lines.length" class="space-y-2 rounded-2xl bg-white p-4 text-sm shadow-sm">
      <li
        v-for="line in lines"
        :key="line.id"
        class="flex flex-wrap items-center justify-between gap-2 border-b border-sand/60 py-2 last:border-0"
      >
        <span class="font-medium">{{ lineSummary(line) }}</span>
        <span class="flex gap-2">
          <button type="button" class="text-ink/50 hover:text-moss" @click="patchLine(line.id, { angleDeg: (line.angleDeg + 90) % 360 })">
            Rotate
          </button>
          <button type="button" class="text-ink/50 hover:text-red-700" @click="removeLine(line.id)">Remove</button>
        </span>
      </li>
    </ul>

    <ul v-if="phase !== 'walls' && categoryItems.length" class="space-y-2 rounded-2xl bg-white p-4 text-sm shadow-sm">
      <li
        v-for="item in categoryItems"
        :key="item.id"
        class="flex flex-wrap items-center justify-between gap-2 border-b border-sand/60 py-2 last:border-0"
      >
        <span class="font-medium">{{ itemSummary(item) }}</span>
        <span class="flex gap-2">
          <button type="button" class="text-ink/50 hover:text-moss" @click="patchItem(item.id, { rotationDeg: (item.rotationDeg + 90) % 360 })">
            Rotate
          </button>
          <button type="button" class="text-ink/50 hover:text-red-700" @click="removeItem(item.id)">Remove</button>
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {
  BOARD_HEIGHT_IN,
  BOARD_WIDTH_IN,
  CELL_INCHES,
  CELLS_PER_FOOT,
  FOOTPRINT_COLORS,
  INCH_PX,
  PLAN_CELL_PX,
  PLAN_COLS,
  PLAN_ROWS,
  applyLabelDefaults,
  cellsToInches,
  clampInches,
  clampPoint,
  combineFootprintsByColor,
  distToLineInches,
  footprintFromWallLines,
  inchesToFeetInches,
  itemSummary,
  labelMeta,
  labelOptionText,
  labelsForCategory,
  lineEndpoints,
  lineSummary,
  pointInPolygon,
  scaleLegend,
  snapFootprintToRectangle,
  type PlanFootprint,
  type PlanItem,
  type PlanLabelCategory,
  type PlanLabelId,
  type PlanLine,
  type PlanPoint,
} from "../utils/kitchen-plan";
import { defaultSkuForLabel, settleStockItem } from "../utils/kitchen-stock";

type MenuKind = "item" | "footprint" | "point" | "line";
type ContextMenu = {
  kind: MenuKind;
  id: string;
  pointIndex?: number;
  title: string;
  x: number;
  y: number;
  panel: "main" | "colors" | "edit-line";
};

type BoardPhase = "walls" | "utilities" | "appliances";

const props = withDefaults(
  defineProps<{
    phase?: BoardPhase;
  }>(),
  { phase: "walls" },
);

const footprints = defineModel<PlanFootprint[]>("footprints", { default: () => [] });
const items = defineModel<PlanItem[]>("items", { default: () => [] });
const lines = defineModel<PlanLine[]>("lines", { default: () => [] });

const boardEl = ref<HTMLElement | null>(null);
const scrollEl = ref<HTMLElement | null>(null);
const activeLabel = ref<PlanLabelId>("outlet");
const placeWidthIn = ref(applyLabelDefaults("outlet").widthInches);
const placeDepthIn = ref(applyLabelDefaults("outlet").depthInches);
const placeRotation = ref(0);
const lineLengthIn = ref(120);
const lineAngle = ref(0);
const lineLabel = ref("");
const lineColor = ref(FOOTPRINT_COLORS[0].value);
const tool = ref<"move" | "line" | "place" | "erase">("move");
const activeId = ref<string | null>(null);
const menu = ref<ContextMenu | null>(null);
const editLineLength = ref(0);
const editLineAngle = ref(0);

const category = computed<PlanLabelCategory>(() => (props.phase === "utilities" ? "utility" : "appliance"));
const categoryLabels = computed(() => labelsForCategory(category.value));
const categoryItems = computed(() =>
  items.value.filter((item) => labelMeta(item.labelId).category === category.value),
);

watch(activeLabel, (id) => {
  const size = applyLabelDefaults(id);
  placeWidthIn.value = size.widthInches;
  placeDepthIn.value = size.depthInches;
});

let dragKind: "point" | "item" | "line" | "footprint" | null = null;
let dragId: string | null = null;
let dragPointIndex = -1;
let dragOffsetX = 0;
let dragOffsetY = 0;

const closedFootprints = computed(() => footprints.value.filter((f) => f.closed && f.points.length >= 3));
const openFootprints = computed(() => footprints.value.filter((f) => !f.closed && f.points.length >= 1));

function isPointUtility(item: PlanItem) {
  return item.labelId === "outlet" || item.labelId === "plumbing";
}

const boxItems = computed(() => items.value.filter((item) => !isPointUtility(item)));

const utilityMarks = computed(() => {
  let n = 0;
  const out: { item: PlanItem; n: number; mark: string }[] = [];
  for (const item of items.value) {
    if (!isPointUtility(item)) continue;
    n += 1;
    out.push({ item, n, mark: item.labelId === "outlet" ? "E" : "P" });
  }
  return out;
});

const pointHandles = computed(() => {
  const list: { key: string; footprintId: string; pointIndex: number; x: number; y: number; color: string }[] = [];
  for (const fp of footprints.value) {
    if (!fp.closed || fp.points.length < 3) continue;
    fp.points.forEach((p, pointIndex) => {
      list.push({
        key: `${fp.id}-${pointIndex}`,
        footprintId: fp.id,
        pointIndex,
        x: p.x,
        y: p.y,
        color: fp.color,
      });
    });
  }
  return list;
});

const activeFootprintSize = computed(() => {
  if (!activeId.value) return null;
  const fp = footprints.value.find((f) => f.id === activeId.value);
  if (!fp?.closed || !fp.points.length) return null;
  const xs = fp.points.map((p) => p.x);
  const ys = fp.points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const wIn = (maxX - minX) * CELL_INCHES;
  const dIn = (maxY - minY) * CELL_INCHES;
  return {
    label: `${inchesToFeetInches(wIn)} × ${inchesToFeetInches(dIn)}`,
    style: {
      left: `${((minX + maxX) / 2) * PLAN_CELL_PX}px`,
      top: `${minY * PLAN_CELL_PX - 22}px`,
      transform: "translateX(-50%)",
    },
  };
});

function syncPhaseDefaults() {
  if (props.phase === "walls") {
    tool.value = "move";
    return;
  }
  tool.value = "place";
  const first = categoryLabels.value[0];
  if (first) {
    activeLabel.value = first.id;
    const size = applyLabelDefaults(first.id);
    placeWidthIn.value = size.widthInches;
    placeDepthIn.value = size.depthInches;
  }
}

watch(() => props.phase, syncPhaseDefaults, { immediate: true });

onMounted(() => {
  window.addEventListener("keydown", onKeyDown);
});
onBeforeUnmount(() => window.removeEventListener("keydown", onKeyDown));

function onKeyDown(event: KeyboardEvent) {
  if (event.key === "Escape") closeMenu();
}

function itemEditable(item: PlanItem) {
  if (props.phase === "walls") return false;
  return labelMeta(item.labelId).category === category.value;
}

function nudgePlaceRotation(delta: number) {
  placeRotation.value = ((placeRotation.value || 0) + delta) % 360;
  if (placeRotation.value < 0) placeRotation.value += 360;
}

function itemStyle(item: PlanItem) {
  return {
    left: `${item.xInches * INCH_PX}px`,
    top: `${item.yInches * INCH_PX}px`,
    width: `${item.widthInches * INCH_PX}px`,
    height: `${item.depthInches * INCH_PX}px`,
    backgroundColor: labelMeta(item.labelId).color,
    transform: `rotate(${item.rotationDeg}deg)`,
    transformOrigin: "top left",
  };
}

function badgeStyle(item: PlanItem) {
  return {
    left: `${(item.xInches + item.widthInches / 2) * INCH_PX}px`,
    top: `${(item.yInches + item.depthInches / 2) * INCH_PX}px`,
    backgroundColor: labelMeta(item.labelId).color,
  };
}

function scrollToWalls() {
  const scroller = scrollEl.value;
  if (!scroller || !lines.value.length) {
    scroller?.scrollTo({ left: 0, top: 0, behavior: "smooth" });
    return;
  }
  let minX = Infinity;
  let minY = Infinity;
  for (const line of lines.value) {
    const e = lineEndpoints(line);
    minX = Math.min(minX, e.x1, e.x2);
    minY = Math.min(minY, e.y1, e.y2);
  }
  for (const fp of footprints.value) {
    for (const p of fp.points) {
      minX = Math.min(minX, p.x * CELL_INCHES);
      minY = Math.min(minY, p.y * CELL_INCHES);
    }
  }
  const pad = 48;
  const left = Math.max(0, minX * INCH_PX - pad);
  const top = Math.max(0, minY * INCH_PX - pad);
  scroller.scrollTo({ left, top, behavior: "smooth" });
}

defineExpose({ scrollToWalls, selectMove });

function selectMove() {
  tool.value = "move";
  const last = [...footprints.value].reverse().find((f) => f.closed && f.points.length >= 3);
  if (last) activeId.value = last.id;
}

function startCornerResize(footprintId: string, pointIndex: number, event: PointerEvent) {
  if (event.button !== 0 || !boardEl.value) return;
  if (tool.value === "erase") {
    removeFootprint(footprintId);
    return;
  }
  closeMenu();
  activeId.value = footprintId;
  const fp = footprints.value.find((f) => f.id === footprintId);
  if (!fp) return;
  const board = boardEl.value;
  const origin = fp.points.map((pt) => ({ x: pt.x, y: pt.y }));
  const anchor = origin[(pointIndex + 2) % origin.length] || origin[0];
  const keepRect = fp.closed && origin.length === 4;
  dragKind = "point";
  dragId = footprintId;
  dragPointIndex = pointIndex;
  const onMove = (ev: PointerEvent) => {
    if (dragKind !== "point" || !dragId) return;
    const next = cornerFromEvent(ev, board);
    if (keepRect && anchor) {
      const minX = Math.min(anchor.x, next.x);
      const maxX = Math.max(anchor.x, next.x);
      const minY = Math.min(anchor.y, next.y);
      const maxY = Math.max(anchor.y, next.y);
      if (maxX - minX < 1 || maxY - minY < 1) return;
      patchFootprint(dragId, {
        points: [
          { x: minX, y: minY },
          { x: maxX, y: minY },
          { x: maxX, y: maxY },
          { x: minX, y: maxY },
        ],
      });
      return;
    }
    updatePoint(dragId, dragPointIndex, next);
  };
  const onUp = () => {
    dragKind = null;
    dragId = null;
    dragPointIndex = -1;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function polyPoints(fp: PlanFootprint) {
  return fp.points.map((p) => `${p.x * PLAN_CELL_PX},${p.y * PLAN_CELL_PX}`).join(" ");
}

function cornerFromEvent(event: PointerEvent | MouseEvent, el: HTMLElement): PlanPoint {
  const rect = el.getBoundingClientRect();
  return clampPoint({
    x: (event.clientX - rect.left) / PLAN_CELL_PX,
    y: (event.clientY - rect.top) / PLAN_CELL_PX,
  });
}

function inchesFromEvent(event: PointerEvent | MouseEvent, el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  return clampInches((event.clientX - rect.left) / INCH_PX, (event.clientY - rect.top) / INCH_PX);
}

function menuPosition(event: MouseEvent) {
  const pad = 8;
  const width = 210;
  const height = 260;
  return {
    x: Math.min(event.clientX, window.innerWidth - width - pad),
    y: Math.min(event.clientY, window.innerHeight - height - pad),
  };
}

function closeMenu() {
  menu.value = null;
}

function snapMenuFootprint() {
  if (!menu.value || (menu.value.kind !== "footprint" && menu.value.kind !== "point")) return;
  const id = menu.value.id;
  const target = footprints.value.find((f) => f.id === id);
  if (!target) return;
  const snapped = snapFootprintToRectangle(target);
  if (!snapped) return;
  footprints.value = footprints.value.map((f) => (f.id === id ? snapped : f));
  closeMenu();
}

function patchFootprint(id: string, patch: Partial<PlanFootprint>) {
  footprints.value = footprints.value.map((f) => (f.id === id ? { ...f, ...patch } : f));
}

function patchItem(id: string, patch: Partial<PlanItem>) {
  items.value = items.value.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

function patchLine(id: string, patch: Partial<PlanLine>) {
  lines.value = lines.value.map((line) => (line.id === id ? { ...line, ...patch } : line));
}

function updatePoint(id: string, index: number, point: PlanPoint) {
  footprints.value = footprints.value.map((f) => {
    if (f.id !== id) return f;
    return { ...f, points: f.points.map((p, i) => (i === index ? point : p)) };
  });
}

function removeFootprint(id: string) {
  footprints.value = footprints.value.filter((f) => f.id !== id);
  if (activeId.value === id) activeId.value = null;
}

function removeItem(id: string) {
  items.value = items.value.filter((item) => item.id !== id);
}

function removeLine(id: string) {
  lines.value = lines.value.filter((line) => line.id !== id);
}

function clearFootprints() {
  footprints.value = [];
  activeId.value = null;
  closeMenu();
}

function openFootprintMenu(fp: PlanFootprint, event: MouseEvent) {
  const pos = menuPosition(event);
  activeId.value = fp.id;
  menu.value = { kind: "footprint", id: fp.id, title: "Footprint", x: pos.x, y: pos.y, panel: "main" };
}

function openPointMenu(footprintId: string, pointIndex: number, event: MouseEvent) {
  const pos = menuPosition(event);
  activeId.value = footprintId;
  menu.value = {
    kind: "point",
    id: footprintId,
    pointIndex,
    title: `Point ${pointIndex + 1}`,
    x: pos.x,
    y: pos.y,
    panel: "main",
  };
}

function openItemMenu(item: PlanItem, event: MouseEvent) {
  const pos = menuPosition(event);
  menu.value = {
    kind: "item",
    id: item.id,
    title: labelMeta(item.labelId).name,
    x: pos.x,
    y: pos.y,
    panel: "main",
  };
}

function openLineMenu(line: PlanLine, event: MouseEvent) {
  const pos = menuPosition(event);
  editLineLength.value = line.lengthInches;
  editLineAngle.value = line.angleDeg;
  menu.value = {
    kind: "line",
    id: line.id,
    title: line.label || "Line",
    x: pos.x,
    y: pos.y,
    panel: "main",
  };
}

function onBoardContextMenu(event: MouseEvent) {
  event.preventDefault();
  if (!boardEl.value) return;

  const inches = inchesFromEvent(event, boardEl.value);
  const hitLine = [...lines.value].reverse().find((line) => distToLineInches(inches.x, inches.y, line) <= 4);
  if (hitLine) {
    openLineMenu(hitLine, event);
    return;
  }

  if (props.phase !== "walls") {
    const hitItem = [...items.value].reverse().find((item) => itemEditable(item) && itemContains(item, inches.x, inches.y));
    if (hitItem) {
      openItemMenu(hitItem, event);
      return;
    }
    closeMenu();
    return;
  }

  const corner = cornerFromEvent(event, boardEl.value);
  for (const fp of [...closedFootprints.value].reverse()) {
    if (pointInPolygon(corner, fp.points)) {
      openFootprintMenu(fp, event);
      return;
    }
  }
  closeMenu();
}

/** Axis-aligned hit (ignores free rotation beyond 0/90/180/270 approx via bounding box of unrotated). */
function itemContains(item: PlanItem, x: number, y: number) {
  const rot = ((item.rotationDeg % 360) + 360) % 360;
  if (rot === 0) {
    return x >= item.xInches && x <= item.xInches + item.widthInches && y >= item.yInches && y <= item.yInches + item.depthInches;
  }
  // Local coords relative to top-left, inverse rotate
  const rad = (-rot * Math.PI) / 180;
  const dx = x - item.xInches;
  const dy = y - item.yInches;
  const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
  const ly = dx * Math.sin(rad) + dy * Math.cos(rad);
  return lx >= 0 && lx <= item.widthInches && ly >= 0 && ly <= item.depthInches;
}

function deleteFromMenu() {
  if (!menu.value) return;
  if (menu.value.kind === "item") removeItem(menu.value.id);
  else if (menu.value.kind === "line") removeLine(menu.value.id);
  else removeFootprint(menu.value.id);
  closeMenu();
}

function deleteMenuPoint() {
  if (!menu.value || menu.value.kind !== "point" || menu.value.pointIndex == null) return;
  const id = menu.value.id;
  const index = menu.value.pointIndex;
  footprints.value = footprints.value
    .map((f) => {
      if (f.id !== id) return f;
      const points = f.points.filter((_, i) => i !== index);
      return { ...f, points, closed: points.length >= 3 ? f.closed : false };
    })
    .filter((f) => f.points.length > 0);
  closeMenu();
}

function applyMenuColor(color: string) {
  if (!menu.value || menu.value.kind === "item" || menu.value.kind === "line") return;
  patchFootprint(menu.value.id, { color });
  closeMenu();
}

function colorCombineMenu() {
  if (!menu.value || menu.value.kind === "item" || menu.value.kind === "line") return;
  const fp = footprints.value.find((f) => f.id === menu.value!.id);
  if (!fp) return;
  footprints.value = combineFootprintsByColor(footprints.value, fp.color);
  closeMenu();
}

function rotateMenuItem(delta: number) {
  if (!menu.value || menu.value.kind !== "item") return;
  const item = items.value.find((i) => i.id === menu.value!.id);
  if (!item) return;
  let next = (item.rotationDeg + delta) % 360;
  if (next < 0) next += 360;
  patchItem(item.id, { rotationDeg: next });
  closeMenu();
}

function rotateMenuLine(delta: number) {
  if (!menu.value || menu.value.kind !== "line") return;
  const line = lines.value.find((l) => l.id === menu.value!.id);
  if (!line) return;
  let next = (line.angleDeg + delta) % 360;
  if (next < 0) next += 360;
  patchLine(line.id, { angleDeg: next });
  closeMenu();
}

function applyLineEdit() {
  if (!menu.value || menu.value.kind !== "line") return;
  patchLine(menu.value.id, {
    lengthInches: Math.max(1, Number(editLineLength.value) || 1),
    angleDeg: Number(editLineAngle.value) || 0,
  });
  closeMenu();
}

function duplicateMenuItem() {
  if (!menu.value || menu.value.kind !== "item") return;
  const source = items.value.find((item) => item.id === menu.value!.id);
  if (!source) return;
  items.value = [
    ...items.value,
    {
      ...source,
      id: crypto.randomUUID(),
      xInches: Math.min(BOARD_WIDTH_IN - source.widthInches, source.xInches + 6),
      yInches: Math.min(BOARD_HEIGHT_IN - source.depthInches, source.yInches + 6),
    },
  ];
  closeMenu();
}

function onPolygonDown(fp: PlanFootprint, event: PointerEvent) {
  if (event.button !== 0 || !boardEl.value) return;
  activeId.value = fp.id;
  closeMenu();
  if (tool.value === "erase") {
    removeFootprint(fp.id);
    return;
  }
  const board = boardEl.value;
  const start = inchesFromEvent(event, board);
  const origin = fp.points.map((pt) => ({ x: pt.x, y: pt.y }));
  dragKind = "footprint";
  dragId = fp.id;
  const onMove = (ev: PointerEvent) => {
    if (dragKind !== "footprint" || !dragId) return;
    const pos = inchesFromEvent(ev, board);
    let dx = (pos.x - start.x) / CELL_INCHES;
    let dy = (pos.y - start.y) / CELL_INCHES;
    const xs = origin.map((pt) => pt.x + dx);
    const ys = origin.map((pt) => pt.y + dy);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    if (minX < 0) dx -= minX;
    if (minY < 0) dy -= minY;
    if (maxX > PLAN_COLS) dx -= maxX - PLAN_COLS;
    if (maxY > PLAN_ROWS) dy -= maxY - PLAN_ROWS;
    patchFootprint(dragId, { points: origin.map((pt) => ({ x: pt.x + dx, y: pt.y + dy })) });
  };
  const onUp = () => {
    dragKind = null;
    dragId = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function clearWalls() {
  lines.value = [];
  footprints.value = [];
  closeMenu();
}

function recognizeRoomFromWalls() {
  const room = footprintFromWallLines(lines.value, lineColor.value);
  if (!room) return;
  footprints.value = [room];
  closeMenu();
}

function onBoardDown(event: PointerEvent) {
  if (event.button !== 0) return;
  closeMenu();
  if (!boardEl.value) return;

  if (props.phase === "walls") {
    if (tool.value === "erase") {
      const inches = inchesFromEvent(event, boardEl.value);
      const hitLine = [...lines.value].reverse().find((line) => distToLineInches(inches.x, inches.y, line) <= 4);
      if (hitLine) removeLine(hitLine.id);
      return;
    }
    if (tool.value === "line") placeLineAtEvent(event);
    return;
  }

  onPlaceBoardDown(event);
}

function placeLineAtEvent(event: PointerEvent) {
  if (!boardEl.value) return;
  const inches = inchesFromEvent(event, boardEl.value);
  const length = Math.max(1, Number(lineLengthIn.value) || 1);
  const angle = Number(lineAngle.value) || 0;
  lines.value = [
    ...lines.value,
    {
      id: crypto.randomUUID(),
      xInches: inches.x,
      yInches: inches.y,
      lengthInches: length,
      angleDeg: angle,
      color: lineColor.value,
      label: lineLabel.value.trim() || undefined,
    },
  ];
}

function onPlaceBoardDown(event: PointerEvent) {
  if (!boardEl.value) return;
  const inches = inchesFromEvent(event, boardEl.value);

  if (tool.value === "erase") {
    const hitItem = [...items.value]
      .reverse()
      .find((item) => itemEditable(item) && itemContains(item, inches.x, inches.y));
    if (hitItem) removeItem(hitItem.id);
    return;
  }

  if (tool.value === "place") {
    const widthInches = Math.max(1, Number(placeWidthIn.value) || 1);
    const depthInches = Math.max(1, Number(placeDepthIn.value) || 1);
    const draft: PlanItem = {
      id: crypto.randomUUID(),
      labelId: activeLabel.value,
      xInches: inches.x,
      yInches: inches.y,
      widthInches,
      depthInches,
      rotationDeg: Number(placeRotation.value) || 0,
    };
    if (labelMeta(draft.labelId).category === "appliance") {
      const sku = defaultSkuForLabel(draft.labelId);
      if (sku) {
        draft.sku = sku.sku;
        draft.widthInches = sku.width;
        draft.depthInches = sku.depth;
      }
      const settled = settleStockItem(draft, items.value, lines.value);
      items.value = [...items.value, settled];
    } else {
      items.value = [...items.value, draft];
    }
  }
}

function startItemDrag(item: PlanItem, event: PointerEvent) {
  if (event.button !== 0 || !boardEl.value) return;
  if (!itemEditable(item)) return;
  closeMenu();
  if (tool.value === "erase") {
    removeItem(item.id);
    return;
  }
  const board = boardEl.value;
  const inches = inchesFromEvent(event, board);
  dragKind = "item";
  dragId = item.id;
  dragOffsetX = inches.x - item.xInches;
  dragOffsetY = inches.y - item.yInches;
  const onMove = (ev: PointerEvent) => {
    if (dragKind !== "item" || !dragId) return;
    const pos = inchesFromEvent(ev, board);
    patchItem(dragId, {
      xInches: clampInches(pos.x - dragOffsetX, 0).x,
      yInches: clampInches(0, pos.y - dragOffsetY).y,
    });
  };
  const onUp = () => {
    if (dragKind === "item" && dragId) {
      const current = items.value.find((i) => i.id === dragId);
      if (current && labelMeta(current.labelId).category === "appliance") {
        const settled = settleStockItem(
          current,
          items.value.filter((i) => i.id !== current.id),
          lines.value,
        );
        patchItem(current.id, settled);
      }
    }
    dragKind = null;
    dragId = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function startLineDrag(line: PlanLine, event: PointerEvent) {
  if (event.button !== 0 || !boardEl.value) return;
  closeMenu();
  if (tool.value === "erase") {
    removeLine(line.id);
    return;
  }
  const board = boardEl.value;
  const inches = inchesFromEvent(event, board);
  dragKind = "line";
  dragId = line.id;
  dragOffsetX = inches.x - line.xInches;
  dragOffsetY = inches.y - line.yInches;
  const onMove = (ev: PointerEvent) => {
    if (dragKind !== "line" || !dragId) return;
    const pos = inchesFromEvent(ev, board);
    const next = clampInches(pos.x - dragOffsetX, pos.y - dragOffsetY);
    patchLine(dragId, { xInches: next.x, yInches: next.y });
  };
  const onUp = () => {
    dragKind = null;
    dragId = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
  };
  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}
</script>
