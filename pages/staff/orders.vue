<template>
  <div class="mx-auto max-w-4xl px-4 py-10">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm uppercase tracking-[0.2em] text-moss">Staff</p>
        <h1 class="font-serif text-4xl">Confirm funds and send to Divya</h1>
        <p class="mt-2 max-w-2xl text-ink/70">
          Paid Stripe checkouts wait here. Confirm funds, then send the work order to
          dawimberly@gmail.com (temporary). Jon gets a copy.
        </p>
        <p class="mt-3">
          <NuxtLink to="/staff/kitchen" class="text-sm font-medium text-moss hover:underline">
            Kitchen estimator →
          </NuxtLink>
        </p>
      </div>
      <button class="text-sm text-moss" type="button" @click="logout">Sign out</button>
    </div>

    <p v-if="pending" class="mt-8 text-ink/60">Loading orders…</p>
    <p v-else-if="error" class="mt-8 text-red-700">{{ error }}</p>
    <p v-else-if="!orders.length" class="mt-8 text-ink/60">No paid checkout sessions yet.</p>

    <ul v-else class="mt-8 space-y-4">
      <li v-for="order in orders" :key="order.id" class="rounded-2xl bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="font-medium">{{ order.company || "No company" }} · {{ order.total }}</p>
            <p class="mt-1 text-sm text-ink/70">{{ order.name }} · {{ order.email }} · {{ order.phone }}</p>
            <p class="mt-2 text-sm">{{ order.shipTo }}</p>
            <p class="mt-1 text-sm text-ink/60">{{ order.fulfillment }} · {{ order.finish }}</p>
            <p v-if="order.notes" class="mt-1 text-sm text-ink/60">{{ order.notes }}</p>
            <p class="mt-2 text-xs text-ink/40">{{ order.id }}</p>
          </div>
          <div class="text-right">
            <p v-if="order.sentToDivya" class="text-sm text-moss">Sent {{ formatWhen(order.sentToDivya) }}</p>
            <button
              v-else
              class="rounded-full bg-ink px-5 py-2 text-sm text-cream disabled:opacity-50"
              type="button"
              :disabled="sending === order.id"
              @click="send(order.id)"
            >
              {{ sending === order.id ? "Sending…" : "Confirm funds & send to Divya" }}
            </button>
          </div>
        </div>
        <p v-if="message[order.id]" class="mt-3 text-sm text-moss">{{ message[order.id] }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "staff" });

type Order = {
  id: string;
  total: string;
  email: string;
  company: string;
  name: string;
  phone: string;
  finish: string;
  fulfillment: string;
  shipTo: string;
  notes: string;
  sentToDivya: string;
};

const orders = ref<Order[]>([]);
const pending = ref(true);
const error = ref("");
const sending = ref("");
const message = ref<Record<string, string>>({});

async function load() {
  pending.value = true;
  error.value = "";
  try {
    const res = await $fetch<{ orders: Order[] }>("/api/staff/orders", { credentials: "include" });
    orders.value = res.orders;
  } catch {
    error.value = "Could not load paid orders.";
  } finally {
    pending.value = false;
  }
}

function formatWhen(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

async function send(id: string) {
  sending.value = id;
  message.value[id] = "";
  try {
    await $fetch("/api/staff/orders/send", {
      method: "POST",
      credentials: "include",
      body: { id },
    });
    message.value[id] = "Sent to Divya.";
    await load();
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; statusMessage?: string };
    message.value[id] = e.data?.statusMessage || e.statusMessage || "Could not send.";
  } finally {
    sending.value = "";
  }
}

async function logout() {
  await $fetch("/api/staff/logout", { method: "POST" });
  await navigateTo("/staff");
}

onMounted(load);
useSeoMeta({ title: "Staff orders", robots: "noindex, nofollow" });
</script>
