<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import PairingView from '@/presentation/views/PairingView.vue'
import PairedTopBar from '@/presentation/components/PairedTopBar.vue'
import ReadersDashboardView from '@/presentation/views/ReadersDashboardView.vue'
import SessionBootstrapView from '@/presentation/views/SessionBootstrapView.vue'
import { useConnectorStore } from '@/domain/connector/connector.store'
import { useReadersStore } from '@/application/readers/readers.store'
import { useConnectorRealtimeStore } from '@/application/connector/connector-realtime.store'

const connectorStore = useConnectorStore()
const readersStore = useReadersStore()
const realtimeStore = useConnectorRealtimeStore()

function handleBeforeUnload(): void {
  readersStore.clearSensitiveData()
}

onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload)

  await connectorStore.validateStoredSession()
})

onBeforeUnmount(async () => {
  window.removeEventListener('beforeunload', handleBeforeUnload)

  readersStore.clearSensitiveData()
  await realtimeStore.disconnect()
})
</script>

<template>
  <SessionBootstrapView v-if="connectorStore.isValidatingSession" />

  <PairingView v-else-if="!connectorStore.isPaired" />

  <main
    v-else
    class="min-h-screen bg-slate-50 text-slate-950"
  >
    <PairedTopBar />
    <ReadersDashboardView />
  </main>
</template>