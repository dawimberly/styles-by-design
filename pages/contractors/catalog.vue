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
      <input v-model="q" class="rounded-lg border border-sand bg-white px-4 py-3" placeholder="Search SKU" />
      <select v-model="group" class="rounded-lg border border-sand bg-white px-4 py-3">
        <option value="">All groups</option>
        <option v-for="g in catalog?.groups || []" :key="g.id" :value="g.id">{{ g.name }}</option>
      </select>
      <select v-model="finish" class="rounded-lg border border-sand bg-white px-4 py-3">
        <option v-for="f in catalog?.finishes || []" :key="f" :value="f">{{ f }}</option>
      </select>
    </div>

    <div class="mt-8 overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table class="min-w-full text-left text-sm">
        <thead class="border-b border-sand text-ink/60">
          <tr>
            <th class="px-4 py-3">SKU</th>
            <th class="px-4 py-3">Group</th>
            <th class="px-4 py-3">MSRP</th>
            <th class="px-4 py-3">Trade</th>
            <th class="px-4 py-3">Save</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in catalog?.items || []" :key="item.sku" class="border-b border-sand/60">
            <td class="px-4 py-3 font-medium">{{ item.sku }}</td>
            <td class="px-4 py-3 text-ink/70">{{ item.groupName }}</td>
            <td class="px-4 py-3 text-ink/50 line-through">${{ item.list.toFixed(2) }}</td>
            <td class="px-4 py-3 text-moss">${{ item.net.toFixed(2) }}</td>
            <td class="px-4 py-3">${{ item.save.toFixed(2) }}</td>
            <td class="px-4 py-3">
              <button class="text-sm font-medium text-ink" type="button" @click="add(item)">Add</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <section class="mt-12 rounded-2xl bg-white p-8 shadow-sm">
      <h2 class="font-serif text-3xl">Quote cart</h2>
      <p v-if="!cart.length" class="mt-4 text-ink/60">Add SKUs to request a trade quote.</p>
      <ul v-else class="mt-4 space-y-3">
        <li v-for="line in cart" :key="line.sku" class="flex items-center justify-between gap-4">
          <span>{{ line.sku }} · ${{ line.net.toFixed(2) }}</span>
          <input v-model.number="line.qty" min="1" type="number" class="w-20 rounded border border-sand px-2 py-1" />
        </li>
      </ul>
      <p v-if="cart.length" class="mt-4 font-medium">Trade total ${{ cartTotal.toFixed(2) }}</p>

      <form v-if="cart.length" class="mt-8 grid gap-4 md:grid-cols-2" @submit.prevent="submitQuote">
        <input v-model="company" required class="rounded-lg border border-sand px-4 py-3" placeholder="Company" />
        <input v-model="name" class="rounded-lg border border-sand px-4 py-3" placeholder="Your name" />
        <input v-model="email" type="email" required class="rounded-lg border border-sand px-4 py-3" placeholder="Email" />
        <input v-model="phone" class="rounded-lg border border-sand px-4 py-3" placeholder="Phone" />
        <textarea v-model="notes" class="md:col-span-2 rounded-lg border border-sand px-4 py-3" rows="3" placeholder="Job notes, address, finish if mixed" />
        <p v-if="quoteMsg" class="md:col-span-2 text-moss">{{ quoteMsg }}</p>
        <button class="rounded-full bg-ink px-6 py-3 text-cream" type="submit">Request quote</button>
      </form>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: "contractor" });

const q = ref("");
const group = ref("");
const finish = ref("Elegant White (Shaker)");
const company = ref("");
const name = ref("");
const email = ref("");
const phone = ref("");
const notes = ref("");
const quoteMsg = ref("");

type Item = {
  sku: string;
  name: string;
  groupId: string;
  groupName: string;
  list: number;
  net: number;
  save: number;
};

const cart = ref<{ sku: string; name: string; net: number; qty: number }[]>([]);

const headers = useRequestHeaders(["cookie"]);
const { data: catalog } = await useFetch("/api/contractors/catalog", {
  headers,
  credentials: "include",
  query: { q, group, finish },
  watch: [q, group, finish],
});

const cartTotal = computed(() => cart.value.reduce((sum, line) => sum + line.net * line.qty, 0));

function add(item: Item) {
  const existing = cart.value.find((line) => line.sku === item.sku);
  if (existing) existing.qty += 1;
  else cart.value.push({ sku: item.sku, name: item.name, net: item.net, qty: 1 });
}

async function logout() {
  await $fetch("/api/contractors/logout", { method: "POST" });
  await navigateTo("/contractors");
}

async function submitQuote() {
  const res = await $fetch<{ message: string }>("/api/contractors/quote", {
    method: "POST",
    body: {
      company: company.value,
      name: name.value,
      email: email.value,
      phone: phone.value,
      finish: finish.value,
      notes: notes.value,
      lines: cart.value,
    },
  });
  quoteMsg.value = res.message;
  cart.value = [];
}

useSeoMeta({ title: "Cabinet catalog" });
</script>
