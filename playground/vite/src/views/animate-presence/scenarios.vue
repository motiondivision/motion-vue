<script setup lang="ts">
import { ref, shallowRef } from 'vue'
import { AnimatePresence, Motion } from 'motion-v'
import DemoPage from '@/components/DemoPage.vue'
import DemoStage from '@/components/DemoStage.vue'
import DemoSection from '@/components/DemoSection.vue'
import StatusPill from '@/components/StatusPill.vue'
import CachedA from './scenarios/CachedA.vue'
import CachedB from './scenarios/CachedB.vue'
import NestedPresence from './scenarios/NestedPresence.vue'
import NestedShowCard from './scenarios/NestedShowCard.vue'
import OuterTransition from './scenarios/OuterTransition.vue'

// v-if: the child unmounts only after its exit settles.
const ifVisible = ref(true)
const ifExits = ref(0)

// v-show: the element stays mounted; only display flips, after the exit.
const showVisible = ref(true)
const showExits = ref(0)

// KeepAlive: swap between two cached roots.
const cached = shallowRef<'a' | 'b'>('a')

// Keyed list.
const rows = ref(['one', 'two'])
const pool = ['three', 'four', 'five']
function addRow() {
  const next = pool.find(label => !rows.value.includes(label))
  if (next)
    rows.value = [...rows.value, next]
}

// Shared wait-state for the mode demonstrations.
const waitPage = ref(0)
const pages = ['Overview', 'Activity', 'Settings']

// Re-append a removed row so each section stays replayable.
function resetIfSection() {
  ifVisible.value = true
  ifExits.value = 0
}
function resetShowSection() {
  showVisible.value = true
  showExits.value = 0
}
</script>

<template>
  <DemoPage
    eyebrow="AnimatePresence"
    title="Every presence scenario"
    description="One page covering each way a child can leave the tree: v-if removal, v-show visibility, KeepAlive swaps, keyed lists, wait mode, nesting, and an outer Transition. Each card is live and carries the minimal code for that shape."
  >
    <DemoSection
      index="01"
      title="v-if · the child is removed from the tree"
      note="The child keeps its component instance and its content while the exit runs. Only when every motion element and presence subscriber has settled does AnimatePresence drop it, so onUnmounted fires after the animation rather than when the boolean flips."
      code="<AnimatePresence @exit-complete=&quot;exits++&quot;>
  <Motion
    v-if=&quot;visible&quot;
    :initial=&quot;{ opacity: 0, y: 12 }&quot;
    :animate=&quot;{ opacity: 1, y: 0 }&quot;
    :exit=&quot;{ opacity: 0, y: 12 }&quot;
  />
</AnimatePresence>"
    >
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <button
          id="scenario-if-toggle"
          class="btn btn-primary"
          @click="ifVisible = !ifVisible"
        >
          {{ ifVisible ? 'Hide' : 'Show' }}
        </button>
        <StatusPill
          id="scenario-if-count"
          :label="`exits ${ifExits}`"
          :tone="ifExits > 0 ? 'accent' : 'idle'"
        />
        <button
          class="btn btn-outline !px-3 !py-1 text-xs"
          @click="resetIfSection"
        >
          reset
        </button>
      </div>
      <DemoStage min-height="180px">
        <AnimatePresence @exit-complete="ifExits++">
          <Motion
            v-if="ifVisible"
            id="scenario-if-card"
            :initial="{ opacity: 0, y: 12 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: 12 }"
            :transition="{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }"
            class="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.06] px-5 py-4 text-sm text-white/75"
          >
            Card mounted by <code class="font-mono text-white/50">v-if</code>
          </Motion>
        </AnimatePresence>
      </DemoStage>
    </DemoSection>

    <DemoSection
      index="02"
      title="v-show · the element stays, the display flips"
      note="v-show never removes anything, so there is no unmount to defer. AnimatePresence supplies the transition hooks instead, which is what holds display: none until the exit hands back. Flipping the boolean back mid-exit reverses it rather than replaying."
      code="<AnimatePresence>
  <Motion
    v-show=&quot;visible&quot;
    :animate=&quot;{ opacity: 1, x: 0 }&quot;
    :exit=&quot;{ opacity: 0, x: 24 }&quot;
  />
</AnimatePresence>"
    >
      <div class="mb-4 flex flex-wrap items-center gap-3">
        <button
          id="scenario-show-toggle"
          class="btn btn-primary"
          @click="showVisible = !showVisible"
        >
          {{ showVisible ? 'Hide' : 'Show' }}
        </button>
        <StatusPill
          id="scenario-show-count"
          :label="`exits ${showExits}`"
          :tone="showExits > 0 ? 'accent' : 'idle'"
        />
        <button
          class="btn btn-outline !px-3 !py-1 text-xs"
          @click="resetShowSection"
        >
          reset
        </button>
      </div>
      <DemoStage min-height="180px">
        <AnimatePresence @exit-complete="showExits++">
          <Motion
            v-show="showVisible"
            id="scenario-show-card"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: 24 }"
            :transition="{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }"
            class="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.06] px-5 py-4 text-sm text-white/75"
          >
            Element kept in the DOM by <code class="font-mono text-white/50">v-show</code>
          </Motion>
        </AnimatePresence>
      </DemoStage>
    </DemoSection>

    <DemoSection
      index="03"
      title="KeepAlive · deactivation is not removal"
      note="The swapped component is deactivated, not unmounted, so Vue would move it straight to the storage container. The transition hooks AnimatePresence installs defer that move until the exit settles, which is why the outgoing panel animates in place before disappearing."
      code="<KeepAlive>
  <AnimatePresence mode=&quot;wait&quot;>
    <component :is=&quot;current&quot; :key=&quot;currentKey&quot; />
  </AnimatePresence>
</KeepAlive>"
    >
      <p class="mb-4 rounded-lg border border-amber-300/20 bg-amber-400/[0.06] px-4 py-3 text-xs leading-relaxed text-amber-100/70">
        The swapped components need distinct keys. Without them both children share the same
        generated key, so the core reads the swap as one child changing contents and no exit runs.
      </p>
      <DemoStage min-height="180px">
        <KeepAlive>
          <component
            :is="cached === 'a' ? CachedA : CachedB"
            :key="cached"
          />
        </KeepAlive>
      </DemoStage>
      <div class="mt-4">
        <button
          id="scenario-cache-toggle"
          class="btn btn-primary"
          @click="cached = cached === 'a' ? 'b' : 'a'"
        >
          Swap to {{ cached === 'a' ? 'B' : 'A' }}
        </button>
      </div>
    </DemoSection>

    <DemoSection
      index="04"
      title="Keyed list · one exit, many reflows"
      note="Keys are the identity AnimatePresence diffs. The removed row finishes its exit while every surviving sibling animates to its new slot, which is why the wrapper needs layout on the moving items rather than on the container."
      code="<AnimatePresence>
  <Motion
    v-for=&quot;row in rows&quot;
    :key=&quot;row&quot;
    :exit=&quot;{ opacity: 0, x: 12 }&quot;
    :layout=&quot;true&quot;
  />
</AnimatePresence>"
    >
      <div class="mb-4 flex flex-wrap gap-2">
        <button
          id="scenario-list-add"
          class="btn btn-primary"
          :disabled="rows.length >= 5"
          @click="addRow"
        >
          Add row
        </button>
        <button
          id="scenario-list-reset"
          class="btn btn-outline"
          @click="rows = ['one', 'two']"
        >
          Reset
        </button>
      </div>
      <DemoStage min-height="200px">
        <ul
          id="scenario-list"
          class="m-0 flex w-full max-w-sm list-none flex-col gap-2 p-0"
        >
          <AnimatePresence>
            <Motion
              v-for="row in rows"
              :id="`scenario-row-${row}`"
              :key="row"
              as="li"
              :initial="{ opacity: 0, y: 8 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, x: 12 }"
              :transition="{ duration: 0.24 }"
              :layout="true"
              class="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/75"
            >
              <span>{{ row }}</span>
              <button
                :id="`scenario-drop-${row}`"
                class="font-mono text-[11px] text-white/35 hover:text-white/70"
                @click="rows = rows.filter(r => r !== row)"
              >
                drop
              </button>
            </Motion>
          </AnimatePresence>
        </ul>
      </DemoStage>
    </DemoSection>

    <DemoSection
      index="05"
      title="wait mode · one leaves before the next arrives"
      note="In wait mode the incoming children are held in pendingPresent while the outgoing set animates. Both are keyed, so the swap is a removal plus an insertion rather than a content change."
      code="<AnimatePresence mode=&quot;wait&quot;>
  <Motion
    :key=&quot;page&quot;
    :initial=&quot;{ opacity: 0, x: 24 }&quot;
    :animate=&quot;{ opacity: 1, x: 0 }&quot;
    :exit=&quot;{ opacity: 0, x: -24 }&quot;
  />
</AnimatePresence>"
    >
      <div class="mb-4 flex flex-wrap gap-2">
        <button
          v-for="(page, index) in pages"
          :id="`scenario-wait-${index}`"
          :key="page"
          class="btn"
          :class="index === waitPage ? 'btn-primary' : 'btn-outline'"
          @click="waitPage = index"
        >
          {{ page }}
        </button>
      </div>
      <DemoStage min-height="180px">
        <AnimatePresence mode="wait">
          <Motion
            :id="`scenario-page-${waitPage}`"
            :key="waitPage"
            :initial="{ opacity: 0, x: 24 }"
            :animate="{ opacity: 1, x: 0 }"
            :exit="{ opacity: 0, x: -24 }"
            :transition="{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }"
            class="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.06] px-5 py-6 text-center text-sm text-white/75"
          >
            {{ pages[waitPage] }}
          </Motion>
        </AnimatePresence>
      </DemoStage>
    </DemoSection>

    <DemoSection
      index="06"
      title="Nested AnimatePresence · each layer owns its own exits"
      note="The inner presence removes the swatch while the outer card stays put. Nesting like this is the supported shape: each core keeps its own render set, so one layer leaving never cancels the other's exit."
      code="<AnimatePresence>
  <Motion v-if=&quot;open&quot; :exit=&quot;{ scale: 0.94 }&quot;>
    <AnimatePresence mode=&quot;wait&quot;>
      <Motion :key=&quot;swatch&quot; :exit=&quot;{ y: -8 }&quot; />
    </AnimatePresence>
  </Motion>
</AnimatePresence>"
    >
      <DemoStage min-height="200px">
        <NestedPresence />
      </DemoStage>
    </DemoSection>

    <DemoSection
      index="07"
      title="v-if outer, v-show inner"
      note="These are different mechanisms, so they compose rather than conflict. The outer exit holds the subtree while the inner element keeps its own display binding, which means the inner toggle still works for the whole duration of the outer exit."
      code="<AnimatePresence>
  <Motion v-if=&quot;outerVisible&quot; :exit=&quot;{ }&quot;>
    <Motion v-show=&quot;innerVisible&quot; :exit=&quot;{ }&quot; />
  </Motion>
</AnimatePresence>"
    >
      <div class="mb-4">
        <button
          id="scenario-mixed-toggle"
          class="btn btn-primary"
          @click="ifVisible = !ifVisible"
        >
          {{ ifVisible ? 'Remove outer' : 'Restore outer' }}
        </button>
      </div>
      <DemoStage min-height="200px">
        <AnimatePresence>
          <Motion
            v-if="ifVisible"
            id="scenario-mixed-outer"
            :initial="{ opacity: 0, y: 8 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: 8 }"
            :transition="{ duration: 0.32 }"
            class="w-full max-w-sm rounded-xl border border-violet-300/20 bg-violet-400/[0.06] p-3"
          >
            <NestedShowCard />
          </Motion>
        </AnimatePresence>
      </DemoStage>
    </DemoSection>

    <DemoSection
      index="08"
      title="An outer Transition around the container"
      note="AnimatePresence needs a real element root for an outer Transition to see it. The outer hook fires for the container's own entry and exit only; it never drives the row exits inside, which stay with the inner presence. Browser Transition is used here so the difference is visible."
      code="<Transition>
  <div v-if=&quot;containerVisible&quot;>
    <AnimatePresence>
      <Motion v-for=&quot;row in rows&quot; :key=&quot;row&quot; :exit=&quot;{ }&quot; />
    </AnimatePresence>
  </div>
</Transition>"
    >
      <p class="mb-4 rounded-lg border border-amber-300/20 bg-amber-400/[0.06] px-4 py-3 text-xs leading-relaxed text-amber-100/70">
        With a Fragment root (no <code class="font-mono">as</code>), the outer Transition receives no
        hooks at all and silently does nothing. Use <code class="font-mono">as</code> or a plain element
        when an outside transition has to observe the container.
      </p>
      <DemoStage
        min-height="220px"
        align="start"
      >
        <OuterTransition />
      </DemoStage>
    </DemoSection>
  </DemoPage>
</template>
