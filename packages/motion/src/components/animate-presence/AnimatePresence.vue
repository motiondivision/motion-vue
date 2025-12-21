<script setup lang="ts">
import { Transition, TransitionGroup, computed, onUnmounted } from 'vue'
import { mountedStates } from '@/state'
import { doneCallbacks, removeDoneCallback } from '@/components/animate-presence/presence'
import type { AnimatePresenceProps } from './types'
import { usePopLayout } from './use-pop-layout'
import { delay } from '@/utils/delay'
import { useAnimatePresence } from './presence'

defineOptions({
  name: 'AnimatePresence',
  inheritAttrs: true,
})

const props = withDefaults(defineProps<AnimatePresenceProps>(), {
  mode: 'sync',
  initial: true,
  anchorX: 'left',
})

/**
 * Provide the presence context to the children
 */
useAnimatePresence(props)

const { addPopStyle, removePopStyle, styles } = usePopLayout(props)

function findMotionElement(el: Element): Element | null {
  let current = el

  while (current) {
    if (mountedStates.get(current)) {
      return current
    }
    current = current.firstElementChild
  }
  return null
}

function enter(el: HTMLElement) {
  const state = mountedStates.get(el)
  if (!state) {
    return
  }
  removePopStyle(state)
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
  // Find Motion element
  const motionEl = findMotionElement(el)
  const state = mountedStates.get(motionEl)
  // Handle cases where Motion element or state is not found
  if (!motionEl || !state) {
    done()
    if (exitDom.size === 0) {
      props.onExitComplete?.()
    }
    return
  }

  exitDom.set(motionEl, true)
  removeDoneCallback(motionEl)
  addPopStyle(state)

  function doneCallback(e?: any) {
    if (e?.detail?.isExit) {
      const projection = state.visualElement.projection
      // 存在布局动画
      if (projection?.currentAnimation) {
        return
      }
      removeDoneCallback(motionEl)
      exitDom.delete(motionEl)
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
      if (!motionEl.isConnected) {
        state.unmount(true)
      }
    }
  }

  delay(() => {
    state.setActive('exit', true)
    doneCallbacks.set(motionEl, doneCallback)
    motionEl.addEventListener('motioncomplete', doneCallback)
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
