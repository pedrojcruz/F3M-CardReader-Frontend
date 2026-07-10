<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import AddressPinDialog from '@/presentation/components/AddressPinDialog.vue'
import CitizenCardAddressForm from '@/presentation/components/CitizenCardAddressForm.vue'
import CitizenCardForm from '@/presentation/components/CitizenCardForm.vue'
import { useConnectorStore } from '@/domain/connector/connector.store'
import { useReadersStore } from '@/application/readers/readers.store'
import type { ReaderCard } from '@/domain/readers/reader-card'

type ReaderCardTab = 'cardData' | 'pinData'

const props = defineProps<{
  reader: ReaderCard
}>()

const connectorStore = useConnectorStore()
const readersStore = useReadersStore()

const activeTab = ref<ReaderCardTab>('cardData')
const isAddressPinDialogVisible = ref(false)

const hasReadData = computed(() => {
  return props.reader.citizenCard !== null || props.reader.citizenCardAddress !== null
})

watch(
  () => props.reader.isReading,
  isReading => {
    if (isReading) {
      activeTab.value = 'cardData'
    }
  },
)

watch(
  () => props.reader.lastReadAtUtc,
  lastReadAtUtc => {
    if (lastReadAtUtc) {
      activeTab.value = 'cardData'
    }
  },
)

function setActiveTab(tab: ReaderCardTab): void {
  activeTab.value = tab
}

function openAddressPinDialog(): void {
  if (!props.reader.hasCard) {
    return
  }

  isAddressPinDialogVisible.value = true
}

function closeAddressPinDialog(): void {
  isAddressPinDialogVisible.value = false
}

function clearData(): void {
  readersStore.clearReaderData(props.reader.name)
  activeTab.value = 'cardData'
}

async function submitAddressPin(pin: string): Promise<void> {
  if (!connectorStore.session) {
    return
  }

  await readersStore.readCitizenCardAddress(
    connectorStore.session,
    props.reader.name,
    pin,
  )

  if (!props.reader.addressErrorMessage) {
    activeTab.value = 'pinData'
    closeAddressPinDialog()
  }
}
</script>

<template>
  <Card
    class="w-[460px] border border-slate-200 bg-white text-slate-950 shadow-sm"
    :pt="{
      root: {
        class: 'bg-white text-slate-950 border border-slate-200 shadow-sm',
      },
      body: {
        class: 'bg-white text-slate-950 p-4',
      },
      title: {
        class: 'bg-white text-slate-950',
      },
      content: {
        class: 'bg-white text-slate-950',
      },
    }"
  >
    <template #title>
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold text-slate-950">
            {{ reader.name }}
          </p>

          <p class="mt-0.5 text-xs text-slate-500">
            Leitor de Cartão de Cidadão
          </p>
        </div>

        <i class="pi pi-id-card text-base text-slate-500" />
      </div>
    </template>

    <template #content>
      <div class="space-y-3">
        <div class="grid grid-cols-2 gap-2">
          <div class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <span class="text-xs font-medium text-slate-600">
              Leitor
            </span>

            <Tag
              :value="reader.readerStatus === 'connected' ? 'Ligado' : 'Em falta'"
              :severity="reader.readerStatus === 'connected' ? 'success' : 'secondary'"
            />
          </div>

          <div class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <span class="text-xs font-medium text-slate-600">
              Cartão
            </span>

            <Tag
              v-if="reader.hasCard"
              value="Inserido"
              severity="success"
            />

            <Tag
              v-else
              value="Em falta"
              severity="secondary"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="grid flex-1 grid-cols-2 rounded-lg border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              class="rounded-md px-3 py-2 text-xs font-semibold transition"
              :class="activeTab === 'cardData'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'"
              @click="setActiveTab('cardData')"
            >
              Dados do Cartão
            </button>

            <button
              type="button"
              class="rounded-md px-3 py-2 text-xs font-semibold transition"
              :class="activeTab === 'pinData'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'"
              @click="setActiveTab('pinData')"
            >
              Dados com PIN
            </button>
          </div>

          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
            title="Limpar dados"
            :disabled="!hasReadData || reader.isReading || reader.isReadingAddress"
            @click="clearData"
          >
            <i class="pi pi-trash text-xs" />
          </button>
        </div>

        <div
          v-if="reader.errorMessage"
          class="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {{ reader.errorMessage }}
        </div>

        <div
          v-if="reader.addressErrorMessage"
          class="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700"
        >
          {{ reader.addressErrorMessage }}
        </div>

        <div v-if="activeTab === 'cardData'">
          <div
            v-if="reader.citizenCard"
            class="relative"
          >
            <CitizenCardForm
              :card="reader.citizenCard"
              :last-read-at-utc="reader.lastReadAtUtc"
            />

            <div
              v-if="reader.isReading"
              class="absolute inset-0 flex items-center justify-center rounded-xl bg-white/75 backdrop-blur-[1px]"
            >
              <div class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
                <i class="pi pi-spin pi-spinner text-lg text-emerald-500" />

                <p class="mt-2 text-xs font-medium text-slate-700">
                  A atualizar dados do cartão...
                </p>
              </div>
            </div>
          </div>

          <div
            v-else-if="reader.isReading"
            class="flex min-h-[360px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-6"
          >
            <div class="text-center">
              <i class="pi pi-spin pi-spinner text-2xl text-emerald-500" />

              <p class="mt-3 text-sm font-semibold text-slate-800">
                A ler dados do cartão...
              </p>

              <p class="mt-1 text-xs text-slate-500">
                Aguarda enquanto a leitura automática é concluída.
              </p>
            </div>
          </div>

          <div
            v-else
            class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center"
          >
            <i class="pi pi-id-card text-2xl text-slate-400" />

            <p class="mt-3 text-xs font-medium text-slate-700">
              Sem dados do cartão
            </p>

            <p class="mt-1 text-[11px] text-slate-500">
              Insere um Cartão de Cidadão para iniciar a leitura automática.
            </p>
          </div>
        </div>

        <div
          v-if="activeTab === 'pinData'"
          class="space-y-3"
        >
          <div
            class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition"
            :class="reader.hasCard ? 'opacity-100' : 'opacity-50'"
          >
            <div>
              <p class="text-xs font-semibold text-slate-800">
                Leitura protegida
              </p>

              <p class="mt-0.5 text-[11px] text-slate-500">
                Requer PIN.
              </p>
            </div>

            <Button
              label="Ler com PIN"
              icon="pi pi-lock-open"
              outlined
              size="small"
              :disabled="!reader.hasCard || reader.isReadingAddress"
              :loading="reader.isReadingAddress"
              @click="openAddressPinDialog"
            />
          </div>

          <div
            v-if="reader.citizenCardAddress"
            class="relative"
          >
            <CitizenCardAddressForm
              :address="reader.citizenCardAddress"
            />

            <div
              v-if="reader.isReadingAddress"
              class="absolute inset-0 flex items-center justify-center rounded-xl bg-white/75 backdrop-blur-[1px]"
            >
              <div class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center shadow-sm">
                <i class="pi pi-spin pi-spinner text-lg text-emerald-500" />

                <p class="mt-2 text-xs font-medium text-slate-700">
                  A atualizar dados com PIN...
                </p>
              </div>
            </div>
          </div>

          <div
            v-else-if="reader.isReadingAddress"
            class="flex min-h-[220px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-6"
          >
            <div class="text-center">
              <i class="pi pi-spin pi-spinner text-2xl text-emerald-500" />

              <p class="mt-3 text-sm font-semibold text-slate-800">
                A ler dados com PIN...
              </p>

              <p class="mt-1 text-xs text-slate-500">
                Aguarda enquanto a leitura protegida é concluída.
              </p>
            </div>
          </div>

          <div
            v-else
            class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center"
          >
            <i class="pi pi-lock text-2xl text-slate-400" />

            <p class="mt-3 text-xs font-medium text-slate-700">
              Sem dados protegidos
            </p>

            <p class="mt-1 text-[11px] text-slate-500">
              Usa a leitura com PIN para obter os dados protegidos.
            </p>
          </div>
        </div>
      </div>
    </template>
  </Card>

  <AddressPinDialog
    :visible="isAddressPinDialogVisible"
    :is-loading="reader.isReadingAddress"
    :error-message="reader.addressErrorMessage"
    @close="closeAddressPinDialog"
    @submit="submitAddressPin"
  />
</template>