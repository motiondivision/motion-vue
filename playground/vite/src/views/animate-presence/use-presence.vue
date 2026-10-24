<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence } from 'motion-v'
import DemoPage from '@/components/DemoPage.vue'
import DemoStage from '@/components/DemoStage.vue'
import PresenceToast from '@/components/PresenceToast.vue'

interface Toast {
  id: number
  title: string
  message: string
}

let nextId = 1

const toasts = ref<Toast[]>([
  { id: nextId++, title: 'Deployment finished', message: 'Production is serving the new build.' },
])

function addToast() {
  toasts.value.push({
    id: nextId++,
    title: `Notification ${nextId - 1}`,
    message: 'Dismiss it to watch the toast hold its own removal.',
  })
}

function dismiss(id: number) {
  toasts.value = toasts.value.filter(toast => toast.id !== id)
}
</script>

<template>
  <DemoPage
    eyebrow="AnimatePresence"
    title="usePresence and safeToRemove"
    description="The hook hands the child its own removal. Keep the DOM until async work finishes, then call safeToRemove."
  >
    <div class="mb-4">
      <button
        id="add-toast"
        class="btn btn-primary"
        @click="addToast"
      >
        Add notification
      </button>
    </div>

    <DemoStage min-height="220px">
      <div
        id="toast-list"
        class="flex w-full max-w-sm flex-col gap-3"
      >
        <AnimatePresence>
          <PresenceToast
            v-for="toast in toasts"
            :key="toast.id"
            :title="toast.title"
            :message="toast.message"
            @dismiss="dismiss(toast.id)"
          />
        </AnimatePresence>

        <p
          v-if="toasts.length === 0"
          class="rounded-xl border border-dashed border-white/10 px-4 py-6 text-center text-sm text-white/35"
        >
          No notifications. Add one to try the exit.
        </p>
      </div>
    </DemoStage>
  </DemoPage>
</template>
