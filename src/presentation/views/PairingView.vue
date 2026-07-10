<script setup lang="ts">
import { ref } from 'vue'
import Message from 'primevue/message'
import { useConnectorStore } from '@/domain/connector/connector.store'

const connectorStore = useConnectorStore()

const portText = ref(String(connectorStore.port))

async function submitPairing(): Promise<void> {
  connectorStore.setPort(Number(portText.value.trim()))

  await connectorStore.pair()
}
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-950">
    <section class="flex min-h-screen items-center justify-center px-6">
      <form
        class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
        @submit.prevent="submitPairing"
      >
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            F3M Connector
          </p>

          <h1 class="mt-2 text-2xl font-semibold text-slate-950">
            Emparelhar frontend
          </h1>

          <p class="mt-3 text-sm leading-6 text-slate-600">
            Indica a porta onde o connector desktop está a correr.
            Depois aprova o pedido na aplicação desktop.
          </p>
        </div>

        <div class="mt-7 space-y-5">
          <div class="space-y-2">
            <label
              for="connectorPort"
              class="text-sm font-medium text-slate-700"
            >
              Porta do connector
            </label>

            <input
              id="connectorPort"
              v-model="portText"
              type="text"
              inputmode="numeric"
              autocomplete="off"
              class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              placeholder="37491"
            >
          </div>

          <Message
            v-if="connectorStore.errorMessage"
            severity="error"
            class="w-full"
          >
            {{ connectorStore.errorMessage }}
          </Message>

          <button
            type="submit"
            class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
            :disabled="connectorStore.isPairing"
          >
            <i
              v-if="!connectorStore.isPairing"
              class="pi pi-link text-sm"
            />

            <i
              v-else
              class="pi pi-spin pi-spinner text-sm"
            />

            <span>
              {{ connectorStore.isPairing ? 'A emparelhar...' : 'Emparelhar' }}
            </span>
          </button>
        </div>
      </form>
    </section>
  </main>
</template>