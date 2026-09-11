<template>
  <div class="mx-auto max-w-4xl px-4 py-10">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm uppercase tracking-[0.2em] text-moss">Staff</p>
        <h1 class="font-serif text-4xl">Send a design invoice</h1>
        <p class="mt-2 max-w-2xl text-ink/70">
          Stripe emails a hosted invoice. Tax is calculated from the customer address if you have an active
          registration in that state.
        </p>
        <p class="mt-3 flex flex-wrap gap-4">
          <NuxtLink to="/staff/orders" class="text-sm font-medium text-moss hover:underline">Cabinet orders →</NuxtLink>
          <NuxtLink to="/staff/kitchen" class="text-sm font-medium text-moss hover:underline">Kitchen estimator →</NuxtLink>
        </p>
      </div>
      <button class="text-sm text-moss" type="button" @click="logout">Sign out</button>
    </div>

    <form class="mt-10 grid gap-4 rounded-2xl bg-white p-8 shadow-sm md:grid-cols-2" @submit.prevent="send">
      <input v-model="company" required class="rounded-lg border border-sand px-4 py-3" placeholder="Company or household" />
      <input v-model="name" class="rounded-lg border border-sand px-4 py-3" placeholder="Contact name" />
      <input v-model="email" type="email" required class="rounded-lg border border-sand px-4 py-3" placeholder="Email" />
      <input v-model="phone" class="rounded-lg border border-sand px-4 py-3" placeholder="Phone" />
      <input
        v-model="description"
        required
        class="rounded-lg border border-sand px-4 py-3 md:col-span-2"
        placeholder="What this invoice is for (design deposit, plans, etc.)"
      />
      <input
        v-model="amount"
        required
        type="number"
        min="1"
        step="0.01"
        class="rounded-lg border border-sand px-4 py-3"
        placeholder="Amount (USD, before tax)"
      />
      <select v-model="daysUntilDue" class="rounded-lg border border-sand px-4 py-3">
        <option :value="7">Due in 7 days</option>
        <option :value="14">Due in 14 days</option>
        <option :value="30">Due in 30 days</option>
      </select>
      <input
        v-model="zip"
        required
        maxlength="5"
        inputmode="numeric"
        class="rounded-lg border border-sand px-4 py-3"
        placeholder="ZIP"
      />
      <select v-model="state" required class="rounded-lg border border-sand px-4 py-3">
        <option value="" disabled>State</option>
        <option v-for="s in US_STATES" :key="s.code" :value="s.code">{{ s.name }}</option>
      </select>
      <input v-model="city" required class="rounded-lg border border-sand px-4 py-3 md:col-span-2" placeholder="City" />
      <input v-model="street" required class="rounded-lg border border-sand px-4 py-3 md:col-span-2" placeholder="Street" />
      <textarea v-model="notes" class="md:col-span-2 rounded-lg border border-sand px-4 py-3" rows="3" placeholder="Internal notes" />
      <p v-if="message" class="md:col-span-2 text-sm" :class="error ? 'text-red-700' : 'text-moss'">{{ message }}</p>
      <button class="rounded-full bg-ink px-6 py-3 text-cream disabled:opacity-50" type="submit" :disabled="sending">
        {{ sending ? "Sending…" : "Create and email invoice" }}
      </button>
    </form>

    <h2 class="mt-12 font-serif text-3xl">Recent invoices</h2>
    <p v-if="pending" class="mt-4 text-ink/60">Loading invoices…</p>
    <p v-else-if="loadError" class="mt-4 text-red-700">{{ loadError }}</p>
    <p v-else-if="!invoices.length" class="mt-4 text-ink/60">No invoices yet.</p>
    <ul v-else class="mt-6 space-y-4">
      <li v-for="invoice in invoices" :key="invoice.id" class="rounded-2xl bg-white p-6 shadow-sm">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="font-medium">{{ invoice.company || invoice.email || "Invoice" }} · {{ invoice.total }}</p>
            <p class="mt-1 text-sm text-ink/70">{{ invoice.description }}</p>
            <p class="mt-1 text-sm text-ink/50">{{ invoice.status }} · {{ invoice.email }}</p>
          </div>
          <a
            v-if="invoice.hostedInvoiceUrl"
            :href="invoice.hostedInvoiceUrl"
            class="text-sm text-moss"
            target="_blank"
            rel="noreferrer"
          >
            Open hosted invoice
          </a>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { US_STATES } from "../../utils/us-states";

definePageMeta({ middleware: "staff" });

type Invoice = {
  id: string;
  status: string | null;
  total: string;
  email: string;
  company: string;
  description: string;
  hostedInvoiceUrl: string | null;
};

const company = ref("");
const name = ref("");
const email = ref("");
const phone = ref("");
const description = ref("");
const amount = ref("");
const daysUntilDue = ref(14);
const notes = ref("");
const street = ref("");
const city = ref("");
const state = ref("TX");
const zip = ref("");
const sending = ref(false);
const message = ref("");
const error = ref(false);
const invoices = ref<Invoice[]>([]);
const pending = ref(true);
const loadError = ref("");

async function load() {
  pending.value = true;
  loadError.value = "";
  try {
    const res = await $fetch<{ invoices: Invoice[] }>("/api/staff/invoices", { credentials: "include" });
    invoices.value = res.invoices;
  } catch {
    loadError.value = "Could not load invoices.";
  } finally {
    pending.value = false;
  }
}

async function send() {
  sending.value = true;
  message.value = "";
  error.value = false;
  try {
    const res = await $fetch<{ hostedInvoiceUrl?: string; total: string }>("/api/staff/invoices", {
      method: "POST",
      credentials: "include",
      body: {
        company: company.value,
        name: name.value,
        email: email.value,
        phone: phone.value,
        description: description.value,
        amount: Number(amount.value),
        daysUntilDue: daysUntilDue.value,
        notes: notes.value,
        street: street.value,
        city: city.value,
        state: state.value,
        zip: zip.value,
      },
    });
    message.value = `Invoice sent (${res.total}).`;
    await load();
  } catch (err: unknown) {
    error.value = true;
    const e = err as { data?: { statusMessage?: string }; statusMessage?: string };
    message.value = e.data?.statusMessage || e.statusMessage || "Could not send invoice.";
  } finally {
    sending.value = false;
  }
}

async function logout() {
  await $fetch("/api/staff/logout", { method: "POST" });
  await navigateTo("/staff");
}

onMounted(load);
useSeoMeta({ title: "Staff invoices", robots: "noindex, nofollow" });
</script>
