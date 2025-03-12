<script setup lang="ts">
import { Transition, TransitionGroup, computed, onMounted, onUnmounted } from 'vue'
import { mountedStates } from '@/state'
import { doneCallbacks, provideAnimatePresence, removeDoneCallback } from '@/components/presence'
import type { AnimatePresenceProps } from './types'
import { usePopLayout } from './use-pop-layout'
import { delay } from '@/utils/delay'

defineOptions({
  name: 'AnimatePresence',
  inheritAttrs: true,
})

const props = withDefaults(defineProps<AnimatePresenceProps>(), {
  mode: 'sync',
  initial: true,
  unwrapElement: false,
  anchorX: 'left',
})

const presenceContext = {
  initial: props.initial,
  custom: props.custom,
}
provideAnimatePresence(presenceContext)

onMounted(() => {
  presenceContext.initial = undefined
})
const { addPopStyle, removePopStyle, styles } = usePopLayout(props)

function enter(el: HTMLElement) {
  const state = mountedStates.get(el)
  if (!state) {
    return
  }
  removePopStyle(state)
  state.isVShow = true
  removeDoneCallback(el)
  /**
   * Delay to ensure animations read the latest state before triggering.
   * This allows the animation system to capture updated values after component updates.
   */
  delay(() => {
    state.setActive('exit', false)
  })
}

const exitDom = new Map<Element, boolean>()

onUnmounted(() => {
  exitDom.clear()
})
function exit(el: Element, done: VoidFunction) {
  if (props.unwrapElement) {
    el = el.firstElementChild as Element
  }
  const state = mountedStates.get(el)
  if (!state) {
    return done()
  }
  exitDom.set(el, true)
  removeDoneCallback(el)
  addPopStyle(state)
  function doneCallback(e?: any) {
    if (e?.detail?.isExit) {
      const projection = state.visualElement.projection
      // @ts-ignore
      if ((projection?.animationProgress > 0 && !state.isSafeToRemove && !state.isVShow)) {
        return
      }
      removeDoneCallback(el)
      exitDom.delete(el)
      if (exitDom.size === 0) {
        props.onExitComplete?.()
      }
      if (!styles.has(state)) {
        state.willUpdate('done')
      }
      else {
        removePopStyle(state)
      }
      done()
      if (!el.isConnected) {
        state.unmount(true)
      }
    }
  }

  /**
   * Delay to ensure animations read the latest state before triggering.
   * This allows the animation system to capture updated values after component updates.
   */
  delay(() => {
    state.setActive('exit', true)
    doneCallbacks.set(el, doneCallback)
    el.addEventListener('motioncomplete', doneCallback)
  })
}

const transitionProps = computed(() => {
  if (props.mode !== 'wait') {
    return {
      tag: props.as,
    }
  }
  return {
    mode: props.mode === 'wait' ? 'out-in' : undefined,
  }
})
</script>

<template>
  <!-- @vue-ignore -->
  <!-- eslint-disable-next-line vue/require-component-is -->
  <component
    :is="mode === 'wait' ? Transition : TransitionGroup"
    :css="false"
    v-bind="transitionProps"
    appear
    @enter="enter"
    @leave="exit"
  >
    <slot />
  </component>
</template>
