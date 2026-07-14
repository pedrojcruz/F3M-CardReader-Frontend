<script setup lang="ts">
import { computed, ref } from 'vue'
import wolfSmartIndustriesLogo from '@/assets/wolf-smart-industries-logo.png'
import { useConnectorStore } from '@/domain/connector/connector.store'
import { useReadersStore } from '@/application/readers/readers.store'
import { useConnectorRealtimeStore } from '@/application/connector/connector-realtime.store'

const connectorStore = useConnectorStore()
const readersStore = useReadersStore()
const realtimeStore = useConnectorRealtimeStore()

const isUnpairing = ref(false)
const isStatusTooltipVisible = ref(false)

const appName = computed(() => {
  return connectorStore.session?.appName ?? '—'
})

const port = computed(() => {
  return connectorStore.session?.port ?? '—'
})

const statusLabel = computed(() => {
  return realtimeStore.isConnected
    ? 'CardReader online'
    : 'CardReader offline'
})

const statusDotClass = computed(() => {
  return realtimeStore.isConnected
    ? 'bg-emerald-500 shadow-emerald-200'
    : 'bg-red-500 shadow-red-200'
})

async function unpair(): Promise<void> {
  if (isUnpairing.value) {
    return
  }

  isUnpairing.value = true

  try {
    readersStore.clearSensitiveData()
    await realtimeStore.disconnect()
    readersStore.clearReaders()
    await connectorStore.unpairRemote()
  } finally {
    isUnpairing.value = false
  }
}

function showStatusTooltip(): void {
  isStatusTooltipVisible.value = true
}

function hideStatusTooltip(): void {
  isStatusTooltipVisible.value = false
}
</script>

<template>
  <header
    class="sticky top-0 z-20 w-full border-b border-slate-200 bg-white px-6 py-3 shadow-sm"
  >
    <div class="flex w-full items-center justify-between gap-6">
      <div class="flex min-w-0 items-center gap-5">
        <div class="flex shrink-0 items-center border-r border-slate-200 pr-5">
          <img
            :src="wolfSmartIndustriesLogo"
            alt="Wolf Smart Industries"
            class="h-11 w-auto object-contain"
          >
        </div>

        <div class="w-56 shrink-0">
          <p class="text-xs font-semibold text-slate-500">
            Emparelhado com
          </p>

          <p class="mt-1 truncate text-sm font-semibold text-slate-950">
            {{ appName }}
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div
            class="w-32 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <p
              class="text-[11px] font-medium uppercase tracking-wide text-slate-500"
            >
              Porta
            </p>

            <p
              class="mt-1 truncate font-mono text-sm font-semibold text-slate-950"
            >
              {{ port }}
            </p>
          </div>

          <div
            class="w-48 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
          >
            <p
              class="text-[11px] font-medium uppercase tracking-wide text-slate-500"
            >
              Token
            </p>

            <p
              class="mt-1 truncate font-mono text-sm font-semibold text-slate-950"
            >
              {{ connectorStore.maskedToken }}
            </p>
          </div>
        </div>

        <div class="relative flex items-center">
          <div
            class="flex h-8 w-8 items-center justify-center"
            :title="statusLabel"
            :aria-label="statusLabel"
            role="status"
            @mouseenter="showStatusTooltip"
            @mouseleave="hideStatusTooltip"
          >
            <span
              class="h-3 w-3 rounded-full shadow-md"
              :class="statusDotClass"
            />
          </div>

          <div
            v-if="isStatusTooltipVisible"
            class="absolute left-9 top-1/2 z-30 -translate-y-1/2 whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md"
          >
            {{ statusLabel }}
          </div>
        </div>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-100 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="isUnpairing"
        @click="unpair"
      >
        <i
          v-if="!isUnpairing"
          class="pi pi-unlink text-xs"
        />

        <i
          v-else
          class="pi pi-spin pi-spinner text-xs"
        />

        <span>
          {{ isUnpairing ? 'A desconectar...' : 'Desconectar' }}
        </span>
      </button>
    </div>
  </header>
</template>