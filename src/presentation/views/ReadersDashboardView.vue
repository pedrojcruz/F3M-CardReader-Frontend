<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from 'vue'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import ReaderCard from '@/presentation/components/ReaderCard.vue'
import { useConnectorStore } from '@/domain/connector/connector.store'
import { useReadersStore } from '@/application/readers/readers.store'
import { useConnectorRealtimeStore } from '@/application/connector/connector-realtime.store'
import type { ReaderCard as ReaderCardModel } from '@/domain/readers/reader-card'

const connectorStore = useConnectorStore()
const readersStore = useReadersStore()
const realtimeStore = useConnectorRealtimeStore()

const missingReaderCard = computed<ReaderCardModel>(() => ({
  name: 'Leitor de Cartão de Cidadão',
  readerStatus: 'disconnected',
  cardStatus: 'not-inserted',
  hasCard: false,

  isReading: false,
  isReadingAddress: false,

  citizenCard: null,
  citizenCardAddress: null,

  lastReadAtUtc: null,
  lastAddressReadAtUtc: null,

  errorMessage: null,
  addressErrorMessage: null,
}))

const visibleReaders = computed<ReaderCardModel[]>(() => {
  if (readersStore.hasReaders) {
    return readersStore.readers
  }

  return [missingReaderCard.value]
})

async function loadReaders(): Promise<void> {
  if (!connectorStore.session) {
    readersStore.clearReaders()
    return
  }

  await readersStore.synchronizeReaders(connectorStore.session)
  await readersStore.readInsertedCards(connectorStore.session)
}

async function connectRealtime(): Promise<void> {
  if (!connectorStore.session) {
    await realtimeStore.disconnect()
    return
  }

  await realtimeStore.connect(connectorStore.session)
}

async function initializeDashboard(): Promise<void> {
  await loadReaders()
  await connectRealtime()
}

onMounted(async () => {
  await initializeDashboard()
})

onUnmounted(async () => {
  await realtimeStore.disconnect()
})

watch(
  () => connectorStore.session,
  async session => {
    if (!session) {
      readersStore.clearReaders()
      await realtimeStore.disconnect()
      return
    }

    await readersStore.synchronizeReaders(session)
    await readersStore.readInsertedCards(session)
    await realtimeStore.connect(session)
  },
)
</script>

<template>
  <section class="min-h-[calc(100vh-88px)] bg-slate-50 px-6 py-8">
    <div class="mx-auto flex max-w-7xl flex-col gap-6">
      <div
        v-if="realtimeStore.errorMessage || readersStore.errorMessage"
        class="space-y-3"
      >
        <Message
          v-if="realtimeStore.errorMessage"
          severity="warn"
          class="w-full"
        >
          {{ realtimeStore.errorMessage }}
        </Message>

        <Message
          v-if="readersStore.errorMessage"
          severity="error"
          class="w-full"
        >
          {{ readersStore.errorMessage }}
        </Message>
      </div>

      <div
        v-if="readersStore.isLoading"
        class="flex min-h-[420px] items-center justify-center"
      >
        <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <ProgressSpinner />

          <p class="mt-4 text-sm font-medium text-slate-700">
            A sincronizar leitores...
          </p>
        </div>
      </div>

      <div
        v-else
        class="flex flex-wrap justify-center gap-8"
      >
        <ReaderCard
          v-for="reader in visibleReaders"
          :key="reader.name"
          :reader="reader"
        />
      </div>
    </div>
  </section>
</template>