<script setup lang="ts">
import { ref } from 'vue'
import { AnimateView, spring, startTransition } from 'motion-v'

const show = ref(true)
const slowShow = ref(true)
const shared = ref(false)
const wide = ref(false)
const lastEvent = ref('')

function toggle() {
  startTransition(() => {
    show.value = !show.value
  }, { types: ['toggle'] })
}

function slowToggle() {
  startTransition(() => {
    slowShow.value = !slowShow.value
  })
}

function shareToggle() {
  startTransition(() => {
    shared.value = !shared.value
  })
}

function updateToggle() {
  startTransition(() => {
    wide.value = !wide.value
  })
}

function onComplete(type: string) {
  lastEvent.value = type
}
</script>

<template>
  <div>
    <button
      id="toggle"
      @click="toggle"
    >
      Toggle
    </button>
    <AnimateView
      v-if="show"
      :enter="{ opacity: 1 }"
      :exit="{ opacity: 0 }"
      :on-animation-complete="onComplete"
    >
      <div
        id="box"
        class="box"
      />
    </AnimateView>

    <button
      id="slow-toggle"
      @click="slowToggle"
    >
      Slow toggle
    </button>
    <AnimateView
      v-if="slowShow"
      :transition="{ duration: 2 }"
    >
      <div
        id="slow-box"
        class="box"
      />
    </AnimateView>

    <button
      id="update-toggle"
      @click="updateToggle"
    >
      Update toggle
    </button>
    <AnimateView :transition="{ type: spring, visualDuration: 0.3, bounce: 0.2 }">
      <div
        id="update-box"
        class="box"
        :style="{ width: wide ? '300px' : '100px' }"
      />
    </AnimateView>

    <button
      id="share-toggle"
      @click="shareToggle"
    >
      Share toggle
    </button>
    <AnimateView
      v-if="!shared"
      key="share-item"
      name="shared"
      :on-animation-complete="onComplete"
    >
      <div
        id="share-item"
        class="box"
      />
    </AnimateView>
    <AnimateView
      v-else
      key="share-modal"
      name="shared"
      :on-animation-complete="onComplete"
    >
      <div
        id="share-modal"
        class="box modal"
      />
    </AnimateView>

    <div id="status">
      {{ lastEvent }}
    </div>
  </div>
</template>

<style scoped>
.box {
  width: 100px;
  height: 100px;
  background: #0af;
  border-radius: 10px;
  margin: 10px 0;
}

.modal {
  background: #f0a;
  width: 200px;
  height: 200px;
}
</style>
