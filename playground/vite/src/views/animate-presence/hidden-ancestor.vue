<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { ref } from 'vue'

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: 'linear' },
}

// Hidden by a `v-show` above the AnimatePresence: no presence enter will ever fire.
const ancestorShown = ref(false)
const ancestorItems = ref([1])

// Hidden by a `v-show` above a motion element with no AnimatePresence at all.
const barePresenceShown = ref(false)

// Hidden by a `v-show` on the AnimatePresence's own child, a plain wrapper.
const wrapperShown = ref(false)
const wrapperItems = ref<number[]>([])

// `v-show` on the motion element itself.
const directShown = ref(false)
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <section>
      <button
        id="toggle-ancestor"
        @click="ancestorShown = !ancestorShown"
      >
        toggle ancestor
      </button>
      <button
        id="add-ancestor-item"
        @click="ancestorItems.push(ancestorItems.length + 1)"
      >
        add item
      </button>
      <div
        v-show="ancestorShown"
        id="ancestor-host"
      >
        <AnimatePresence>
          <motion.div
            v-for="item in ancestorItems"
            :id="`ancestor-item-${item}`"
            :key="item"
            v-bind="fade"
            class="w-10 h-10 bg-red-500"
          />
        </AnimatePresence>
      </div>
    </section>

    <section>
      <button
        id="toggle-bare"
        @click="barePresenceShown = !barePresenceShown"
      >
        toggle bare
      </button>
      <div v-show="barePresenceShown">
        <motion.div
          id="bare-item"
          v-bind="fade"
          class="w-10 h-10 bg-blue-500"
        />
      </div>
    </section>

    <section>
      <button
        id="toggle-wrapper"
        @click="wrapperShown = !wrapperShown"
      >
        toggle wrapper
      </button>
      <button
        id="add-wrapper-item"
        @click="wrapperItems.push(wrapperItems.length + 1)"
      >
        add wrapper item
      </button>
      <AnimatePresence>
        <div
          v-show="wrapperShown"
          id="wrapper"
        >
          <motion.div
            id="wrapper-item"
            v-bind="fade"
            class="w-10 h-10 bg-green-500"
          />
          <motion.div
            v-for="item in wrapperItems"
            :id="`wrapper-added-${item}`"
            :key="item"
            v-bind="fade"
            class="w-10 h-10 bg-green-300"
          />
        </div>
      </AnimatePresence>
    </section>

    <section>
      <button
        id="toggle-direct"
        @click="directShown = !directShown"
      >
        toggle direct
      </button>
      <AnimatePresence>
        <motion.div
          v-show="directShown"
          id="direct-item"
          v-bind="fade"
          class="w-10 h-10 bg-purple-500"
        />
      </AnimatePresence>
    </section>
  </div>
</template>
