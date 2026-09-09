<template>
  <div class="space-y-4">
    <div class="grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-4">
      <label class="text-sm">
        <span class="mb-1 block font-medium text-ink/70">Width (in)</span>
        <input v-model.number="draft.w" type="number" min="3" step="3" class="w-full rounded-lg border border-sand bg-cream px-3 py-2" />
      </label>
      <label class="text-sm">
        <span class="mb-1 block font-medium text-ink/70">Depth (in)</span>
        <input v-model.number="draft.d" type="number" min="3" step="3" class="w-full rounded-lg border border-sand bg-cream px-3 py-2" />
      </label>
      <label class="text-sm">
        <span class="mb-1 block font-medium text-ink/70">Height (in)</span>
        <input v-model.number="draft.h" type="number" min="3" step="3" class="w-full rounded-lg border border-sand bg-cream px-3 py-2" />
      </label>
      <label class="text-sm">
        <span class="mb-1 block font-medium text-ink/70">Label</span>
        <select v-model="draft.labelId" class="w-full rounded-lg border border-sand bg-cream px-3 py-2">
          <option v-for="l in PLAN_LABELS" :key="l.id" :value="l.id">{{ l.name }}</option>
        </select>
      </label>
      <button type="button" class="rounded-full bg-ink px-4 py-2 text-sm text-cream md:col-span-2 xl:col-span-4" @click="addBox">
        Add box
      </button>
    </div>

    <div v-if="selected" class="grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-3">
      <label class="text-sm md:col-span-3 font-medium">Rotate selected · {{ labelMeta(selected.labelId).name }}</label>
      <label class="text-sm">
        <span class="mb-1 block text-ink/70">Rotate X {{ Math.round(selected.rx) }}°</span>
        <input :value="selected.rx" type="range" min="0" max="360" class="w-full" @input="setRotation('rx', $event)" />
      </label>
      <label class="text-sm">
        <span class="mb-1 block text-ink/70">Rotate Y {{ Math.round(selected.ry) }}°</span>
        <input :value="selected.ry" type="range" min="0" max="360" class="w-full" @input="setRotation('ry', $event)" />
      </label>
      <label class="text-sm">
        <span class="mb-1 block text-ink/70">Rotate Z {{ Math.round(selected.rz) }}°</span>
        <input :value="selected.rz" type="range" min="0" max="360" class="w-full" @input="setRotation('rz', $event)" />
      </label>
      <div class="flex flex-wrap gap-2 md:col-span-3">
        <button type="button" class="rounded-full border border-sand px-3 py-1 text-sm" @click="nudge(12, 0)">+X 1'</button>
        <button type="button" class="rounded-full border border-sand px-3 py-1 text-sm" @click="nudge(-12, 0)">−X 1'</button>
        <button type="button" class="rounded-full border border-sand px-3 py-1 text-sm" @click="nudge(0, 12)">+Z 1'</button>
        <button type="button" class="rounded-full border border-sand px-3 py-1 text-sm" @click="nudge(0, -12)">−Z 1'</button>
        <button type="button" class="rounded-full border border-ink px-3 py-1 text-sm" @click="removeSelected">Remove box</button>
      </div>
    </div>

    <div ref="host" class="h-[420px] overflow-hidden rounded-2xl border border-sand bg-[#1f2a24] shadow-sm" />
    <p class="text-xs text-ink/50">
      Drag to orbit. Scroll to zoom. Floor grid matches the plan board (3" squares). Boxes are for rough cabinet /
      appliance massing — not a finished 3D design for the customer.
    </p>
  </div>
</template>

<script setup lang="ts">
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PLAN_LABELS, labelMeta, type PlanBox, type PlanLabelId } from "../utils/kitchen-plan";

const boxes = defineModel<PlanBox[]>({ default: () => [] });

const host = ref<HTMLElement | null>(null);
const selectedId = ref<string | null>(null);
const draft = reactive({
  w: 36,
  d: 24,
  h: 34.5,
  labelId: "base-cab" as PlanLabelId,
});

const selected = computed(() => boxes.value.find((b) => b.id === selectedId.value) || null);

const INCH = 1;
let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let controls: OrbitControls | null = null;
let meshById = new Map<string, THREE.Mesh>();
let raf = 0;
let raycaster: THREE.Raycaster | null = null;
let pointer = new THREE.Vector2();

onMounted(() => {
  if (!host.value) return;
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#1f2a24");

  camera = new THREE.PerspectiveCamera(50, host.value.clientWidth / host.value.clientHeight, 0.1, 5000);
  camera.position.set(120, 100, 140);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(host.value.clientWidth, host.value.clientHeight);
  host.value.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(60, 20, 50);
  controls.update();

  const hemi = new THREE.HemisphereLight(0xfff6e8, 0x2a3530, 1.1);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.7);
  dir.position.set(80, 120, 40);
  scene.add(dir);

  const grid = new THREE.GridHelper(240, 80, 0xc9a66b, 0x3b4a42);
  grid.position.set(120, 0, 120);
  scene.add(grid);

  const axes = new THREE.AxesHelper(36);
  axes.position.set(0, 0.5, 0);
  scene.add(axes);

  raycaster = new THREE.Raycaster();
  renderer.domElement.addEventListener("pointerdown", onPick);

  rebuildMeshes();
  animate();
  window.addEventListener("resize", onResize);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener("resize", onResize);
  controls?.dispose();
  renderer?.dispose();
  if (renderer?.domElement.parentElement) renderer.domElement.parentElement.removeChild(renderer.domElement);
  meshById.forEach((mesh) => {
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  });
  meshById.clear();
});

watch(boxes, rebuildMeshes, { deep: true });

function animate() {
  raf = requestAnimationFrame(animate);
  controls?.update();
  if (renderer && scene && camera) renderer.render(scene, camera);
}

function onResize() {
  if (!host.value || !camera || !renderer) return;
  camera.aspect = host.value.clientWidth / host.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(host.value.clientWidth, host.value.clientHeight);
}

function rebuildMeshes() {
  if (!scene) return;
  const keep = new Set(boxes.value.map((b) => b.id));
  for (const [id, mesh] of meshById) {
    if (keep.has(id)) continue;
    scene.remove(mesh);
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
    meshById.delete(id);
  }
  for (const box of boxes.value) {
    let mesh = meshById.get(box.id);
    if (!mesh) {
      const geo = new THREE.BoxGeometry(1, 1, 1);
      const mat = new THREE.MeshStandardMaterial({
        color: labelMeta(box.labelId).color,
        metalness: 0.05,
        roughness: 0.7,
      });
      mesh = new THREE.Mesh(geo, mat);
      mesh.userData.id = box.id;
      scene.add(mesh);
      meshById.set(box.id, mesh);
    }
    mesh.scale.set(box.w * INCH, box.h * INCH, box.d * INCH);
    mesh.position.set(box.x + box.w / 2, box.y + box.h / 2, box.z + box.d / 2);
    mesh.rotation.set(
      THREE.MathUtils.degToRad(box.rx),
      THREE.MathUtils.degToRad(box.ry),
      THREE.MathUtils.degToRad(box.rz),
    );
    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.color.set(labelMeta(box.labelId).color);
    mat.emissive.set(selectedId.value === box.id ? 0x224422 : 0x000000);
  }
}

function addBox() {
  const next: PlanBox = {
    id: crypto.randomUUID(),
    labelId: draft.labelId,
    w: draft.w,
    d: draft.d,
    h: draft.h,
    x: 24,
    y: 0,
    z: 24,
    rx: 0,
    ry: 0,
    rz: 0,
  };
  boxes.value = [...boxes.value, next];
  selectedId.value = next.id;
  nextTick(rebuildMeshes);
}

function patchSelected(patch: Partial<PlanBox>) {
  if (!selectedId.value) return;
  boxes.value = boxes.value.map((b) => (b.id === selectedId.value ? { ...b, ...patch } : b));
}

function setRotation(axis: "rx" | "ry" | "rz", event: Event) {
  const value = Number((event.target as HTMLInputElement).value);
  patchSelected({ [axis]: value });
}

function nudge(dx: number, dz: number) {
  if (!selected.value) return;
  patchSelected({ x: selected.value.x + dx, z: selected.value.z + dz });
}

function removeSelected() {
  if (!selectedId.value) return;
  boxes.value = boxes.value.filter((b) => b.id !== selectedId.value);
  selectedId.value = null;
  rebuildMeshes();
}

function onPick(event: PointerEvent) {
  if (!renderer || !camera || !raycaster) return;
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects([...meshById.values()]);
  if (hits[0]?.object.userData.id) {
    selectedId.value = String(hits[0].object.userData.id);
    rebuildMeshes();
  }
}
</script>
