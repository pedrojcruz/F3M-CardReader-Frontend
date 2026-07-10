<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Password from 'primevue/password'
import Message from 'primevue/message'

const props = defineProps<{
  visible: boolean
  isLoading: boolean
  errorMessage: string | null
}>()

const emit = defineEmits<{
  close: []
  submit: [pin: string]
}>()

const pin = ref('')

watch(
  () => props.visible,
  visible => {
    if (visible) {
      pin.value = ''
    }
  },
)

function submit(): void {
  emit('submit', pin.value)
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    header="Leitura com PIN"
    :style="{ width: '420px' }"
    :pt="{
      root: {
        class: 'bg-white text-slate-950 border border-slate-200 shadow-xl',
      },
      header: {
        class: 'bg-white text-slate-950 border-b border-slate-100 px-6 py-4',
      },
      title: {
        class: 'text-lg font-semibold text-slate-950',
      },
      content: {
        class: 'bg-white text-slate-950 px-6 py-5',
      },
      mask: {
        class: 'bg-black/40',
      },
      closeButton: {
        class: 'text-slate-500 hover:text-slate-900 hover:bg-slate-100',
      },
    }"
    @update:visible="value => !value && emit('close')"
  >
    <form
      class="space-y-4"
      @submit.prevent="submit"
    >
      <p class="text-sm text-slate-600">
        Introduz o PIN para ler os dados protegidos do Cartão de Cidadão.
      </p>

      <div class="space-y-2">
        

        <Password
          v-model="pin"
          input-id="pin"
          class="w-full"
          input-class="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          :feedback="false"
          toggle-mask
          inputmode="numeric"
          maxlength="4"
          placeholder="PIN"
        />
      </div>

      <Message
        v-if="errorMessage"
        severity="error"
        size="small"
      >
        {{ errorMessage }}
      </Message>

      <div class="flex justify-end gap-2 pt-2">
        <button
          type="button"
          class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="isLoading"
          @click="emit('close')"
        >
          Cancelar
        </button>

        <button
          type="submit"
          class="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="isLoading"
        >
          <i
            v-if="!isLoading"
            class="pi pi-lock-open text-xs"
          />

          <i
            v-else
            class="pi pi-spin pi-spinner text-xs"
          />

          <span>
            {{ isLoading ? 'A ler...' : 'Ler com PIN' }}
          </span>
        </button>
      </div>
    </form>
  </Dialog>
</template>