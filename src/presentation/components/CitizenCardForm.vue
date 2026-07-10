<script setup lang="ts">
import { computed } from 'vue'
import type { CitizenCardData } from '@/domain/cards/citizen-card-data'

const props = defineProps<{
  card: CitizenCardData
  lastReadAtUtc: string | null
}>()

const photoSource = computed(() => {
  if (!props.card.photo) {
    return null
  }

  if (props.card.photo.startsWith('data:image')) {
    return props.card.photo
  }

  return `data:image/jpeg;base64,${props.card.photo}`
})
</script>

<template>
  <div class="rounded-xl border border-slate-200 bg-slate-50 p-3">
    <div
      v-if="photoSource"
      class="mb-3 flex justify-center"
    >
      <img
        :src="photoSource"
        alt="Fotografia do cidadão"
        class="h-24 w-20 rounded-lg border border-slate-200 bg-white object-cover"
      >
    </div>

    <div class="grid grid-cols-1 gap-2">
      <div class="space-y-1">
        <label class="text-xs font-medium text-slate-600">
          Nome completo
        </label>

        <input
          :value="card.fullName"
          readonly
          class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
        >
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            Nomes próprios
          </label>

          <input
            :value="card.givenNames"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            Apelidos
          </label>

          <input
            :value="card.surnames"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>
      </div>

      <div class="space-y-1">
        <label class="text-xs font-medium text-slate-600">
          Filiação
        </label>

        <input
          :value="card.parentsNames"
          readonly
          class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
        >
      </div>

      <div class="grid grid-cols-3 gap-2">
        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            Sexo
          </label>

          <input
            :value="card.gender"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            Nacionalidade
          </label>

          <input
            :value="card.nationality"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            Altura
          </label>

          <input
            :value="card.height"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            Data nascimento
          </label>

          <input
            :value="card.birthDate ?? ''"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            Validade
          </label>

          <input
            :value="card.expiryDate ?? ''"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            Documento
          </label>

          <input
            :value="card.documentNumber"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            NIF
          </label>

          <input
            :value="card.nifNumber"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            Segurança Social
          </label>

          <input
            :value="card.socialSecurityNumber"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>

        <div class="space-y-1">
          <label class="text-xs font-medium text-slate-600">
            Número de utente
          </label>

          <input
            :value="card.healthNumber"
            readonly
            class="h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-950 outline-none"
          >
        </div>
      </div>
    </div>
  </div>
</template>