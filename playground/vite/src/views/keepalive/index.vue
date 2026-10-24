<script setup lang="ts">
import { AnimatePresence } from 'motion-v'
import { shallowRef } from 'vue'
import DemoPage from '@/components/DemoPage.vue'
import DemoStage from '@/components/DemoStage.vue'
import DirectiveA from './DirectiveA.vue'
import DirectiveB from './DirectiveB.vue'
import InnerA from './InnerA.vue'
import InnerB from './InnerB.vue'
import PanelA from './PanelA.vue'
import PanelB from './PanelB.vue'
import SharedA from './SharedA.vue'
import SharedB from './SharedB.vue'

const current1 = shallowRef(PanelA)
const current2 = shallowRef(InnerA)
const current3 = shallowRef(DirectiveA)
const current4 = shallowRef(SharedA)
</script>

<template>
  <DemoPage
    eyebrow="KeepAlive"
    title="Cached components and exits"
    description="KeepAlive deactivates instead of unmounting. AnimatePresence installs the transition hooks that defer the storage move, so the exit plays in place."
  >
    <section class="mb-10">
      <h2 class="mb-2 text-sm font-medium text-white/70">
        S1 · AnimatePresence wraps KeepAlive
      </h2>
      <p class="mb-3 text-sm leading-relaxed text-white/45">
        The cached root is a motion element. The outgoing panel exits before it moves to storage.
      </p>
      <button
        id="s1-toggle"
        class="btn btn-primary mb-3"
        @click="current1 = current1 === PanelA ? PanelB : PanelA"
      >
        Switch to {{ current1 === PanelA ? 'B' : 'A' }}
      </button>
      <DemoStage
        class="stage"
        min-height="180px"
      >
        <KeepAlive>
          <AnimatePresence mode="wait">
            <component
              :is="current1"
              :key="current1 === PanelA ? 'panel-a' : 'panel-b'"
            />
          </AnimatePresence>
        </KeepAlive>
      </DemoStage>
    </section>

    <section class="mb-10">
      <h2 class="mb-2 text-sm font-medium text-white/70">
        S2 · AnimatePresence inside the cached component
      </h2>
      <p class="mb-3 text-sm leading-relaxed text-white/45">
        Each cached panel owns its own AnimatePresence. The exit runs before KeepAlive stores the panel.
      </p>
      <button
        id="s2-toggle"
        class="btn btn-primary mb-3"
        @click="current2 = current2 === InnerA ? InnerB : InnerA"
      >
        Switch to {{ current2 === InnerA ? 'B' : 'A' }}
      </button>
      <DemoStage
        class="stage"
        min-height="180px"
      >
        <KeepAlive>
          <component :is="current2" />
        </KeepAlive>
      </DemoStage>
    </section>

    <section class="mb-10">
      <h2 class="mb-2 text-sm font-medium text-white/70">
        S3 · v-motion inside KeepAlive
      </h2>
      <p class="mb-3 text-sm leading-relaxed text-white/45">
        The directive path replays the enter animation on reactivation.
      </p>
      <button
        id="s3-toggle"
        class="btn btn-primary mb-3"
        @click="current3 = current3 === DirectiveA ? DirectiveB : DirectiveA"
      >
        Switch to {{ current3 === DirectiveA ? 'B' : 'A' }}
      </button>
      <DemoStage
        class="stage"
        min-height="180px"
      >
        <KeepAlive>
          <AnimatePresence mode="wait">
            <component
              :is="current3"
              :key="current3 === DirectiveA ? 'directive-a' : 'directive-b'"
            />
          </AnimatePresence>
        </KeepAlive>
      </DemoStage>
    </section>

    <section>
      <h2 class="mb-2 text-sm font-medium text-white/70">
        S4 · Shared layout across cached pages
      </h2>
      <p class="mb-3 text-sm leading-relaxed text-white/45">
        Both pages use layout-id="hero". The hero morphs between the list and detail geometry.
      </p>
      <button
        id="s4-toggle"
        class="btn btn-primary mb-3"
        @click="current4 = current4 === SharedA ? SharedB : SharedA"
      >
        Switch to {{ current4 === SharedA ? 'detail' : 'list' }}
      </button>
      <DemoStage
        class="stage"
        min-height="320px"
      >
        <KeepAlive>
          <component :is="current4" />
        </KeepAlive>
      </DemoStage>
    </section>
  </DemoPage>
</template>

<style>
.stage {
  overflow: hidden;
}

.panel {
  position: absolute;
  inset: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  font-size: 15px;
  color: rgba(255, 255, 255, 0.8);
}

.panel-a {
  background: rgba(255, 255, 255, 0.06);
}

.panel-b {
  border-color: rgba(196, 181, 253, 0.2);
  background: rgba(139, 92, 246, 0.1);
  color: #ddd6fe;
}

.shared-page {
  position: absolute;
  inset: 16px;
}

.hero {
  border-radius: 10px;
  background: rgba(139, 92, 246, 0.35);
}

.hero-small {
  position: absolute;
  top: 0;
  left: 0;
  width: 64px;
  height: 64px;
}

.hero-large {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 160px;
  height: 120px;
}

.label {
  position: absolute;
  left: 0;
  bottom: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}
</style>
