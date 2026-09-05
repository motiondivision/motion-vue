<script setup lang="ts">
import { AnimatePresence } from 'motion-v'
import { shallowRef } from 'vue'
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
  <div class="page">
    <h1>KeepAlive × motion-v</h1>

    <section>
      <h2>S1: AnimatePresence wraps KeepAlive</h2>
      <p><code>&lt;AnimatePresence&gt;&lt;KeepAlive&gt;&lt;component&gt;</code>, cached root = motion.div</p>
      <button
        id="s1-toggle"
        @click="current1 = current1 === PanelA ? PanelB : PanelA"
      >
        switch ({{ current1 === PanelA ? 'A' : 'B' }})
      </button>
      <div class="stage">
        <KeepAlive>
          <AnimatePresence mode="wait">
            <component :is="current1" />
          </AnimatePresence>
        </KeepAlive>
      </div>
    </section>

    <section>
      <h2>S2: AnimatePresence inside cached component</h2>
      <p><code>&lt;KeepAlive&gt;&lt;component&gt;</code>, cached root = AnimatePresence + motion.div</p>
      <button
        id="s2-toggle"
        @click="current2 = current2 === InnerA ? InnerB : InnerA"
      >
        switch ({{ current2 === InnerA ? 'A' : 'B' }})
      </button>
      <div class="stage">
        <KeepAlive>
          <component :is="current2" />
        </KeepAlive>
      </div>
    </section>

    <section>
      <h2>S3: v-motion directive inside KeepAlive</h2>
      <p><code>&lt;KeepAlive&gt;&lt;component&gt;</code>, cached root = element with v-motion (no AnimatePresence — enter replays on reactivation)</p>
      <button
        id="s3-toggle"
        @click="current3 = current3 === DirectiveA ? DirectiveB : DirectiveA"
      >
        switch ({{ current3 === DirectiveA ? 'A' : 'B' }})
      </button>
      <div class="stage">
        <KeepAlive>
          <AnimatePresence mode="wait">
            <component :is="current3" />
          </AnimatePresence>
        </KeepAlive>
      </div>
    </section>

    <section>
      <h2>S4: shared layout animation across cached components</h2>
      <p>Same <code>layout-id="hero"</code> in both cached pages — the hero should morph from the old page's position/size to the new one</p>
      <button
        id="s4-toggle"
        @click="current4 = current4 === SharedA ? SharedB : SharedA"
      >
        switch ({{ current4 === SharedA ? 'list' : 'detail' }})
      </button>
      <div class="stage stage-tall">
        <KeepAlive>
          <component :is="current4" />
        </KeepAlive>
      </div>
    </section>
  </div>
</template>

<style>
.page { padding: 24px; font-family: sans-serif; }
.stage { position: relative; height: 160px; border: 1px dashed #999; margin-top: 12px; overflow: hidden; }
.panel {
  position: absolute; inset: 16px; display: flex; align-items: center; justify-content: center;
  font-size: 24px; color: #fff; border-radius: 12px;
}
.panel-a { background: #7c5cff; }
.panel-b { background: #ff5c8a; }
.stage-tall { height: 300px; }
.shared-page { position: absolute; inset: 16px; }
.hero { border-radius: 10px; background: linear-gradient(135deg, #ffd25c, #ff5c5c); }
.hero-small { width: 64px; height: 64px; position: absolute; top: 0; left: 0; }
.hero-large { width: 160px; height: 120px; position: absolute; right: 0; bottom: 0; }
.label { position: absolute; left: 0; bottom: 0; font-size: 13px; color: #666; }
</style>
