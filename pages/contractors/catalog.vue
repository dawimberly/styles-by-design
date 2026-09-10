<template>
  <div class="mx-auto max-w-6xl px-4 py-10">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm uppercase tracking-[0.2em] text-moss">Contractor catalog</p>
        <h1 class="font-serif text-4xl">Stock cabinets at trade price</h1>
        <p class="mt-2 max-w-2xl text-ink/70">
          {{ catalog?.source || "Estimator price list" }} · {{ Math.round((catalog?.discount || 0.2) * 100) }}% off MSRP
        </p>
      </div>
      <button class="text-sm text-moss" type="button" @click="logout">Sign out</button>
    </div>

    <div class="mt-8 grid gap-3 md:grid-cols-3">
      <input v-model="q" class="rounded-lg border border-sand bg-white px-4 py-3" placeholder="Search SKU or description" />
      <select v-model="group" class="rounded-lg border border-sand bg-white px-4 py-3">
        <option value="">All categories</option>
        <optgroup v-for="section in catalog?.sections || []" :key="section.id" :label="section.name">
          <option v-for="g in section.groups" :key="g.id" :value="g.id">{{ g.name }}</option>
        </optgroup>
      </select>
      <select v-model="finish" class="rounded-lg border border-sand bg-white px-4 py-3">
        <option v-for="f in catalog?.finishes || []" :key="f" :value="f">{{ f }}</option>
      </select>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <button
        v-for="f in catalog?.finishes || []"
        :key="f"
        type="button"
        class="flex items-center gap-2 rounded-full border px-2 py-1 text-left text-xs"
        :class="f === finish ? 'border-ink bg-ink text-cream' : 'border-sand bg-white text-ink'"
        @click="finish = f"
      >
        <img :src="finishPhotos(f).door" :alt="''" class="h-8 w-8 rounded-full object-cover" />
        <span>{{ f }}</span>
      </button>
    </div>

    <figure class="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
      <div class="grid gap-0 md:grid-cols-[minmax(0,1fr)_11rem]">
        <img :src="selectedLook.room" :alt="`${finish} photo`" class="h-64 w-full object-cover md:h-80" />
        <img :src="selectedLook.door" :alt="`${finish} sample`" class="h-40 w-full object-cover md:h-80" />
      </div>
      <figcaption class="border-t border-sand px-4 py-3 text-sm text-ink/70">
        {{
          isClosetFinish
            ? `${finish} — Northville closet line. Units, shelves, drawers, doors, and upgrades.`
            : `${finish} — door sample and a Northville kitchen in this finish. SKUs share this look.`
        }}
      </figcaption>
    </figure>

    <div class="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border border-sand bg-white p-4 shadow-sm">
      <div class="min-w-[12rem] flex-1">
        <label class="mb-1 block text-xs uppercase tracking-[0.15em] text-ink/50" for="active-room">Add qty to room</label>
        <select id="active-room" v-model="activeRoomId" class="w-full rounded-lg border border-sand bg-cream px-4 py-3">
          <option v-for="room in rooms" :key="room.instanceId" :value="room.instanceId">
            {{ roomLabel(rooms, room) }}
          </option>
        </select>
      </div>
      <div class="min-w-[10rem]">
        <label class="mb-1 block text-xs uppercase tracking-[0.15em] text-ink/50" for="new-room-type">New room</label>
        <select id="new-room-type" v-model="newRoomType" class="w-full rounded-lg border border-sand px-4 py-3">
          <option v-for="t in ROOM_TYPES" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
      </div>
      <button class="rounded-full border border-ink px-5 py-3 text-sm" type="button" @click="addRoom">+ Add room</button>
      <p class="w-full text-sm text-ink/60">
        Same job can have Kitchen 1, Kitchen 2, Bedroom 1… Quantities go into the selected room.
      </p>
    </div>

    <div class="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-sand text-ink/60">
          <tr>
            <th class="px-4 py-3">SKU</th>
            <th class="px-4 py-3">Description</th>
            <th class="px-4 py-3">Group</th>
            <th class="px-4 py-3">MSRP</th>
            <th class="px-4 py-3">Trade</th>
            <th class="px-4 py-3">Save</th>
            <th class="px-4 py-3 whitespace-nowrap">Qty in {{ activeRoomName }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in catalog?.items || []" :key="item.sku" class="border-b border-sand/60">
            <td class="px-4 py-3 font-medium whitespace-nowrap">{{ item.sku }}</td>
            <td class="px-4 py-3 text-ink/70">{{ item.name }}</td>
            <td class="px-4 py-3 text-ink/70">{{ item.groupName }}</td>
            <td class="px-4 py-3 text-ink/50 line-through">${{ item.list.toFixed(2) }}</td>
            <td class="px-4 py-3 text-moss">${{ item.net.toFixed(2) }}</td>
            <td class="px-4 py-3">${{ item.save.toFixed(2) }}</td>
            <td class="px-4 py-3">
              <div class="inline-flex items-center rounded-full border border-sand bg-cream">
                <button
                  class="px-2.5 py-1 text-lg leading-none text-ink disabled:opacity-30"
                  type="button"
                  :disabled="qtyOf(item.sku) <= 0"
                  :aria-label="`Decrease ${item.sku}`"
                  @click="bump(item, -1)"
                >
                  −
                </button>
                <input
                  class="w-14 border-x border-sand bg-white py-1 text-center tabular-nums outline-none"
                  type="number"
                  min="0"
                  max="999"
                  :value="qtyOf(item.sku)"
                  :aria-label="`${item.sku} quantity`"
                  @input="onQtyInput(item, $event)"
                />
                <button
                  class="px-2.5 py-1 text-lg leading-none text-ink disabled:opacity-30"
                  type="button"
                  :disabled="qtyOf(item.sku) >= 999"
                  :aria-label="`Increase ${item.sku}`"
                  @click="bump(item, 1)"
                >
                  +
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <section class="mt-12 rounded-2xl bg-white p-8 shadow-sm">
      <h2 class="font-serif text-3xl">Order cart by room</h2>
      <p class="mt-2 max-w-2xl text-ink/70">
        You pay Styles by Design. After Stripe confirms funds, studio staff confirm payment in the employee portal and
        send the Cabinets To Go work order to Divya at Dura Stone.
      </p>
      <p v-if="!cart.length" class="mt-4 text-ink/60">Set quantities to build an order.</p>
      <div v-else class="mt-6 space-y-8">
        <div v-for="block in cartByRoom" :key="block.instanceId">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-sand pb-2">
            <h3 class="font-serif text-2xl">{{ block.label }}</h3>
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-sm text-ink/60">${{ block.total.toFixed(2) }}</p>
              <button
                v-if="rooms.length > 1"
                class="text-sm text-ink/50 hover:text-ink"
                type="button"
                @click="removeRoom(block.instanceId)"
              >
                Remove room
              </button>
            </div>
          </div>
          <ul class="space-y-3">
            <li v-for="line in block.lines" :key="line.sku + line.roomInstanceId" class="flex items-center justify-between gap-4">
              <span class="flex min-w-0 items-center gap-3">
                <img :src="selectedLook.door" alt="" class="h-12 w-12 shrink-0 rounded object-cover" />
                <span class="min-w-0">
                  <span class="font-medium">{{ line.name }}</span>
                  <span class="block truncate text-sm text-ink/60">SKU {{ line.sku }} · ${{ line.net.toFixed(2) }}</span>
                </span>
              </span>
              <div class="flex shrink-0 items-center gap-2">
                <select
                  class="max-w-[9rem] rounded border border-sand px-2 py-1 text-sm"
                  :value="line.roomInstanceId"
                  :aria-label="`Move ${line.sku} to room`"
                  @change="onMoveLine(line, $event)"
                >
                  <option v-for="room in rooms" :key="room.instanceId" :value="room.instanceId">
                    {{ roomLabel(rooms, room) }}
                  </option>
                </select>
                <input
                  :value="line.qty"
                  min="0"
                  max="999"
                  type="number"
                  class="w-20 rounded border border-sand px-2 py-1"
                  @input="setQtyFromCart(line.sku, line.roomInstanceId, $event)"
                />
              </div>
            </li>
          </ul>
        </div>
      </div>
      <p v-if="cart.length" class="mt-4 font-medium">Trade total ${{ cartTotal.toFixed(2) }}</p>

      <form v-if="cart.length" class="mt-8 grid gap-4 md:grid-cols-2" @submit.prevent="submitQuote">
        <input v-model="company" required class="rounded-lg border border-sand px-4 py-3" placeholder="Company" />
        <input v-model="name" class="rounded-lg border border-sand px-4 py-3" placeholder="Your name" />
        <input v-model="email" type="email" required class="rounded-lg border border-sand px-4 py-3" placeholder="Email" />
        <input v-model="phone" class="rounded-lg border border-sand px-4 py-3" placeholder="Phone" />
        <select v-model="fulfillment" required class="rounded-lg border border-sand px-4 py-3 md:col-span-2">
          <option value="drop_ship">Drop-ship to this address (Cabinets To Go account)</option>
          <option value="delivery">Deliver to this jobsite</option>
        </select>
        <input
          v-model="zip"
          required
          maxlength="5"
          inputmode="numeric"
          pattern="[0-9]{5}"
          class="rounded-lg border border-sand px-4 py-3"
          placeholder="ZIP"
          @input="clearVerified"
          @blur="lookupPostal"
        />
        <select v-model="state" required class="rounded-lg border border-sand px-4 py-3" @change="clearVerified">
          <option value="" disabled>State</option>
          <option v-for="s in US_STATES" :key="s.code" :value="s.code">{{ s.name }}</option>
        </select>
        <input v-model="city" required class="rounded-lg border border-sand px-4 py-3" placeholder="City" @input="clearVerified" />
        <input
          v-model="street"
          required
          class="rounded-lg border border-sand px-4 py-3 md:col-span-2"
          placeholder="Ship-to street"
          @input="clearVerified"
        />
        <div class="md:col-span-2 flex flex-wrap items-center gap-3">
          <button class="rounded-full border border-ink px-5 py-2 text-sm" type="button" :disabled="checkingAddress" @click="verifyAddress">
            {{ checkingAddress ? "Checking postal address…" : "Verify postal address" }}
          </button>
          <p v-if="addressOk" class="text-sm text-moss">Verified: {{ addressOk }}</p>
        </div>
        <textarea v-model="notes" class="md:col-span-2 rounded-lg border border-sand px-4 py-3" rows="3" placeholder="Unit/apt, gate codes, unload notes, mixed finishes" />
        <ol class="md:col-span-2 list-decimal space-y-1 pl-5 text-sm text-ink/70">
          <li>Verify the ship-to ZIP and street.</li>
          <li>Pay Styles by Design.</li>
          <li>Staff confirm funds and send the work order to Divya.</li>
        </ol>
        <p v-if="quoteMsg" class="md:col-span-2 text-moss">{{ quoteMsg }}</p>
        <button class="rounded-full bg-ink px-6 py-3 text-cream" type="submit" :disabled="paying || !addressOk">
          {{ paying ? "Opening checkout…" : "Pay Styles by Design" }}
        </button>
        <p class="md:col-span-2 text-sm text-ink/50">
          Card payment goes to Styles by Design. Staff then confirm funds and email Divya the work order for drop-ship
          or delivery to this address.
        </p>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { CLOSET_FINISH, finishPhotos } from "../../utils/site";
import {
  ROOM_TYPES,
  labelForInstance,
  newRoomInstance,
  roomLabel,
  type CartRoom,
} from "../../utils/room-types";

definePageMeta({ middleware: "contractor" });

const q = ref("");
const group = ref("");
const finish = ref("Elegant White (Shaker)");
const company = ref("");
const name = ref("");
const email = ref("");
const phone = ref("");
const notes = ref("");
const street = ref("");
const city = ref("");
const state = ref("");
const zip = ref("");
const fulfillment = ref<"drop_ship" | "delivery">("drop_ship");
const quoteMsg = ref("");
const paying = ref(false);
const checkingAddress = ref(false);
const addressOk = ref("");

type Item = {
  sku: string;
  name: string;
  groupId: string;
  groupName: string;
  list: number;
  net: number;
  save: number;
};

type CartLine = {
  sku: string;
  name: string;
  net: number;
  qty: number;
  roomInstanceId: string;
  roomLabel: string;
};

const rooms = ref<CartRoom[]>([newRoomInstance("kitchen")]);
const activeRoomId = ref(rooms.value[0].instanceId);
const newRoomType = ref("kitchen");

const cart = ref<CartLine[]>([]);

const headers = useRequestHeaders(["cookie"]);
const { data: catalog } = await useFetch("/api/contractors/catalog", {
  headers,
  credentials: "include",
  query: { q, group, finish },
  watch: [q, group, finish],
});

const cartTotal = computed(() => cart.value.reduce((sum, line) => sum + line.net * line.qty, 0));
const selectedLook = computed(() => finishPhotos(finish.value));
const isClosetFinish = computed(() => finish.value === CLOSET_FINISH);
const activeRoomName = computed(() => labelForInstance(rooms.value, activeRoomId.value));

const cartByRoom = computed(() =>
  rooms.value
    .map((room) => {
      const lines = cart.value.filter((line) => line.roomInstanceId === room.instanceId);
      return {
        instanceId: room.instanceId,
        label: roomLabel(rooms.value, room),
        lines,
        total: lines.reduce((sum, line) => sum + line.net * line.qty, 0),
      };
    })
    .filter((block) => block.lines.length > 0),
);

watch(group, (value) => {
  const closet = isClosetGroup(value);
  if (closet && finish.value !== CLOSET_FINISH) finish.value = CLOSET_FINISH;
  else if (value && !closet && finish.value === CLOSET_FINISH) {
    finish.value = "Elegant White (Shaker)";
  }
});

watch(finish, (value) => {
  if (value === CLOSET_FINISH && !isClosetGroup(group.value)) group.value = "closet";
  else if (value !== CLOSET_FINISH && isClosetGroup(group.value)) group.value = "";
});

function isClosetGroup(value: string) {
  return value === "closet" || value.startsWith("closet-");
}

function refreshLineLabels() {
  for (const line of cart.value) {
    line.roomLabel = labelForInstance(rooms.value, line.roomInstanceId);
  }
}

function addRoom() {
  const room = newRoomInstance(newRoomType.value);
  rooms.value = [...rooms.value, room];
  activeRoomId.value = room.instanceId;
  refreshLineLabels();
}

function removeRoom(instanceId: string) {
  if (rooms.value.length <= 1) return;
  const hasLines = cart.value.some((line) => line.roomInstanceId === instanceId);
  if (hasLines && !window.confirm("Remove this room and its cart lines?")) return;
  cart.value = cart.value.filter((line) => line.roomInstanceId !== instanceId);
  rooms.value = rooms.value.filter((room) => room.instanceId !== instanceId);
  if (activeRoomId.value === instanceId) activeRoomId.value = rooms.value[0].instanceId;
  refreshLineLabels();
}

function moveLine(line: CartLine, targetRoomId: string) {
  if (line.roomInstanceId === targetRoomId) return;
  const existing = cart.value.find((entry) => entry.sku === line.sku && entry.roomInstanceId === targetRoomId);
  if (existing) {
    existing.qty = clampQty(existing.qty + line.qty);
    cart.value = cart.value.filter((entry) => !(entry.sku === line.sku && entry.roomInstanceId === line.roomInstanceId));
  } else {
    line.roomInstanceId = targetRoomId;
    line.roomLabel = labelForInstance(rooms.value, targetRoomId);
  }
  refreshLineLabels();
}

function onMoveLine(line: CartLine, event: Event) {
  moveLine(line, (event.target as HTMLSelectElement).value);
}

let zipLookup = "";

watch(zip, (value) => {
  const code = digitsZip(value);
  if (code !== value) {
    zip.value = code;
    return;
  }
  if (code.length !== 5) {
    zipLookup = "";
    addressOk.value = "";
    return;
  }
  if (code !== zipLookup) addressOk.value = "";
  lookupPostal();
});

const MAX_QTY = 999;

function clampQty(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.min(MAX_QTY, Math.floor(value));
}

function qtyOf(sku: string) {
  return cart.value.find((line) => line.sku === sku && line.roomInstanceId === activeRoomId.value)?.qty ?? 0;
}

function setQty(item: Item, qty: number) {
  const next = clampQty(qty);
  const roomId = activeRoomId.value;
  const existing = cart.value.find((line) => line.sku === item.sku && line.roomInstanceId === roomId);
  if (next === 0) {
    cart.value = cart.value.filter((line) => !(line.sku === item.sku && line.roomInstanceId === roomId));
    return;
  }
  if (existing) existing.qty = next;
  else {
    cart.value.push({
      sku: item.sku,
      name: item.name,
      net: item.net,
      qty: next,
      roomInstanceId: roomId,
      roomLabel: labelForInstance(rooms.value, roomId),
    });
  }
}

function bump(item: Item, delta: number) {
  setQty(item, qtyOf(item.sku) + delta);
}

function onQtyInput(item: Item, event: Event) {
  setQty(item, Number((event.target as HTMLInputElement).value));
}

function setQtyFromCart(sku: string, roomInstanceId: string, event: Event) {
  const line = cart.value.find((entry) => entry.sku === sku && entry.roomInstanceId === roomInstanceId);
  if (!line) return;
  const next = clampQty(Number((event.target as HTMLInputElement).value));
  if (next === 0) cart.value = cart.value.filter((entry) => !(entry.sku === sku && entry.roomInstanceId === roomInstanceId));
  else line.qty = next;
}

async function logout() {
  await $fetch("/api/contractors/logout", { method: "POST" });
  await navigateTo("/contractors");
}

function clearVerified() {
  addressOk.value = "";
}

async function lookupPostal() {
  const code = digitsZip(zip.value);
  zip.value = code;
  if (code.length !== 5 || zipLookup === code) return;
  zipLookup = code;
  addressOk.value = "";
  try {
    const res = await $fetch<{ city: string; state: string; zip: string }>("/api/contractors/address", {
      method: "POST",
      credentials: "include",
      body: { mode: "zip", zip: code },
    });
    city.value = res.city;
    state.value = res.state;
    zip.value = res.zip;
    zipLookup = res.zip;
  } catch (error: unknown) {
    zipLookup = "";
    const err = error as { data?: { statusMessage?: string }; statusMessage?: string };
    quoteMsg.value = err.data?.statusMessage || err.statusMessage || "ZIP could not be verified.";
  }
}

async function verifyAddress() {
  quoteMsg.value = "";
  checkingAddress.value = true;
  clearVerified();
  try {
    const res = await $fetch<{ matched: string; street: string; city: string; state: string; zip: string }>(
      "/api/contractors/address",
      {
        method: "POST",
        credentials: "include",
        body: { street: street.value, city: city.value, state: state.value, zip: zip.value },
      },
    );
    street.value = res.street;
    city.value = res.city;
    state.value = res.state;
    zip.value = res.zip;
    addressOk.value = res.matched;
  } catch (error: unknown) {
    const err = error as { data?: { statusMessage?: string }; statusMessage?: string };
    quoteMsg.value = err.data?.statusMessage || err.statusMessage || "Address could not be verified.";
  } finally {
    checkingAddress.value = false;
  }
}

async function submitQuote() {
  quoteMsg.value = "";
  if (!addressOk.value) {
    quoteMsg.value = "Verify the postal address before paying.";
    return;
  }
  paying.value = true;
  refreshLineLabels();
  try {
    const res = await $fetch<{ url: string }>("/api/contractors/checkout", {
      method: "POST",
      credentials: "include",
      body: {
        company: company.value,
        name: name.value,
        email: email.value,
        phone: phone.value,
        finish: finish.value,
        notes: notes.value,
        street: street.value,
        city: city.value,
        state: state.value,
        zip: zip.value,
        fulfillment: fulfillment.value,
        lines: cart.value,
      },
    });
    await navigateTo(res.url, { external: true });
  } catch (error: unknown) {
    const err = error as { data?: { statusMessage?: string }; statusMessage?: string };
    quoteMsg.value = err.data?.statusMessage || err.statusMessage || "Checkout failed. Stripe may not be connected yet.";
  } finally {
    paying.value = false;
  }
}

useSeoMeta({ title: "Cabinet catalog" });
</script>
