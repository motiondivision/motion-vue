<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, LayoutGroup, Motion } from 'motion-v'
import DemoPage from '@/components/DemoPage.vue'
import DemoStage from '@/components/DemoStage.vue'

interface Task {
  id: number
  label: string
}

const taskPool = [
  'Review the release notes',
  'Update the changelog',
  'Tag the next version',
  'Notify the team',
]

let nextId = 1

const tasks = ref<Task[]>([
  { id: nextId++, label: 'Review the release notes' },
  { id: nextId++, label: 'Update the changelog' },
])

function addTask() {
  const label = taskPool[tasks.value.length % taskPool.length]
  tasks.value.push({ id: nextId++, label })
}

function removeTask(id: number) {
  tasks.value = tasks.value.filter(task => task.id !== id)
}
</script>

<template>
  <DemoPage
    eyebrow="AnimatePresence"
    title="Keyed list removal"
    description="Keys tell AnimatePresence which row is leaving. Siblings animate to their new positions while the removed row finishes its exit."
  >
    <div class="mb-4 flex flex-wrap gap-2">
      <button
        id="add-task"
        class="btn btn-primary"
        @click="addTask"
      >
        Add task
      </button>
      <button
        id="clear-tasks"
        class="btn btn-outline"
        @click="tasks = []"
      >
        Clear all
      </button>
    </div>

    <DemoStage>
      <LayoutGroup>
        <ul
          id="task-list"
          class="m-0 flex w-full max-w-sm list-none flex-col gap-2 p-0"
        >
          <AnimatePresence>
            <Motion
              v-for="(task, index) in tasks"
              :id="`task-${task.id}`"
              :key="task.id"
              layout
              as="li"
              :initial="{ opacity: 0, y: 8 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, x: 24 }"
              :transition="{ duration: 0.3, delay: index * 0.02, ease: [0.22, 1, 0.36, 1] }"
              class="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3"
            >
              <span class="text-sm text-white/75">{{ task.label }}</span>
              <button
                class="text-xs text-white/30 transition-colors hover:text-white"
                @click="removeTask(task.id)"
              >
                Remove
              </button>
            </Motion>
          </AnimatePresence>
        </ul>
      </LayoutGroup>
    </DemoStage>
  </DemoPage>
</template>
