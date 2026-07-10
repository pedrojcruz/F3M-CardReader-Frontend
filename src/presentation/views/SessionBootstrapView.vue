<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner'
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-6">
    <div class="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <ProgressSpinner />

      <p class="mt-4 text-sm font-medium text-slate-700">
        A validar sessão guardada...
      </p>

      <p class="mt-1 text-xs text-slate-500">
        A confirmar ligação ao connector local.
      </p>
    </div>
  </main>
</template>