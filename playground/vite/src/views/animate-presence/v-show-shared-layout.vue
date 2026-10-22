<script setup lang="ts">
import { ref } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'
import DemoPage from '@/components/DemoPage.vue'
import DemoStage from '@/components/DemoStage.vue'
import StatusPill from '@/components/StatusPill.vue'

const show = ref(false)
const animationStarted = ref(false)
const animationCompleted = ref(false)

function onAnimationStart() {
  animationStarted.value = true
  animationCompleted.value = false
}

function onAnimationComplete() {
  animationCompleted.value = true
}

function toggle() {
  animationStarted.value = false
  animationCompleted.value = false
  show.value = !show.value
}
</script>

<template>
  <DemoPage
    eyebrow="AnimatePresence"
    title="Shared layout with v-show"
    description="A v-show child stays mounted, so layoutId can morph between the two states. AnimatePresence supplies the transition hooks that defer display: none."
  >
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <button
        id="toggle"
        class="btn btn-primary"
        @click="toggle"
      >
        {{ show ? 'Show small' : 'Show large' }}
      </button>
      <StatusPill
        id="animation-started"
        :label="animationStarted ? 'started' : 'idle'"
      />
      <StatusPill
        id="animation-completed"
        :label="animationCompleted ? 'completed' : 'pending'"
        :tone="animationCompleted ? 'accent' : 'idle'"
      />
    </div>

    <section class="mb-10">
      <h2 class="mb-3 text-sm font-medium text-white/70">
        Shared element
      </h2>
      <DemoStage min-height="300px">
        <div class="relative h-[240px] w-full">
          <AnimatePresence>
            <Motion
              v-show="!show"
              id="small-box"
              layout-id="shared-box"
              :transition="{ duration: 0.3 }"
              class="absolute right-4 top-4 flex h-[100px] w-[100px] items-end rounded-lg border border-white/10 bg-white/[0.07] p-3 text-xs text-white/60"
              @animation-start="onAnimationStart"
              @animation-complete="onAnimationComplete"
            >
              Small
            </Motion>
            <Motion
              v-show="show"
              id="large-box"
              layout-id="shared-box"
              :transition="{ duration: 0.3 }"
              class="absolute left-4 top-4 flex h-[200px] w-[200px] items-end rounded-xl border border-violet-300/20 bg-violet-400/10 p-4 text-sm text-violet-100"
              @animation-start="onAnimationStart"
              @animation-complete="onAnimationComplete"
            >
              Large
            </Motion>
          </AnimatePresence>
        </div>
      </DemoStage>
    </section>

    <section>
      <h2 class="mb-3 text-sm font-medium text-white/70">
        Nested shared layout
      </h2>
      <DemoStage min-height="240px">
        <div class="relative h-[180px] w-full">
          <AnimatePresence>
            <Motion
              v-show="show"
              id="nested-large"
              layout-id="nested-container"
              :transition="{ duration: 0.3 }"
              class="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-white/[0.06] p-4"
            >
              <Motion
                layout-id="nested-child"
                :transition="{ duration: 0.3 }"
                class="h-[80px] w-[80px] rounded-md bg-violet-300/30"
              />
            </Motion>
            <Motion
              v-show="!show"
              id="nested-small"
              layout-id="nested-container"
              :transition="{ duration: 0.3 }"
              class="absolute bottom-4 right-4 rounded-lg border border-white/10 bg-white/[0.06] p-2"
            >
              <Motion
                layout-id="nested-child"
                :transition="{ duration: 0.3 }"
                class="h-[40px] w-[40px] rounded bg-violet-300/30"
              />
            </Motion>
          </AnimatePresence>
        </div>
      </DemoStage>
    </section>
  </DemoPage>
</template>
