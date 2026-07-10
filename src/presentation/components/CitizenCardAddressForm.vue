<script setup lang="ts">
import type { CitizenCardAddress } from '@/domain/cards/citizen-card-address'

defineProps<{
  address: CitizenCardAddress
}>()
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div class="grid grid-cols-1 gap-2">
      <div class="space-y-1">
        <label class="text-xs font-medium text-slate-600">
          Rua
        </label>

        <input
          :value="address.street"
          readonly
          class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
        >
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            Código postal
          </label>

          <input
            :value="address.postalCode"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            Cidade
          </label>

          <input
            :value="address.city"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            Distrito
          </label>

          <input
            :value="address.district"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            Município
          </label>

          <input
            :value="address.municipality"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            Freguesia
          </label>

          <input
            :value="address.parish"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            País
          </label>

          <input
            :value="address.country"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>
      </div>
    </div>
  </div>
</template>