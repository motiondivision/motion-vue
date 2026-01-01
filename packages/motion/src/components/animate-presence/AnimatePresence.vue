<script setup lang="ts">
import { Transition, TransitionGroup, computed, onUnmounted } from 'vue'
import { mountedStates } from '@/state'
import type { AnimatePresenceProps } from './types'
import { usePopLayout } from './use-pop-layout'
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

const exitDom = new Map<Element, boolean>()

function enter(el: HTMLElement) {
  const state = mountedStates.get(el)
  if (state) {
    state.getSnapshot(state.options, true)
    state.setActive('exit', false)
  }
}

onUnmounted(() => {
  exitDom.forEach((value, key) => {
    const state = mountedStates.get(key)
    if (state) {
      state.unmount(true)
    }
  })
  exitDom.clear()
})

function exit(el: Element, done: VoidFunction) {
  // Find Motion element
  const motionEl = findMotionElement(el)
  const state = mountedStates.get(motionEl)
  // Handle cases where Motion element or state is not found
  if (!state) {
    done()
    if (exitDom.size === 0) {
      props.onExitComplete?.()
    }
    return
  }

  const doneCallback = function (e?: any) {
    if (!motionEl.isConnected)
      return
    if (e?.detail?.isExit) {
      const projection = state.visualElement.projection
      // have layout animation, wait for layout animation to complete when exit is not defined
      if (projection?.currentAnimation && projection.currentAnimation.state === 'running' && !state.options.exit) {
        return
      }
      // exit animation is not finished, wait for it to complete
      if (state.isExiting)
        return
      motionEl.removeEventListener('motioncomplete', doneCallback)
      exitDom.delete(motionEl)
      if (exitDom.size === 0) {
        props.onExitComplete?.()
      }
      if (styles.has(state)) {
        removePopStyle(state)
      }
      state.getSnapshot(state.options, false)
      done()
      if (!motionEl.isConnected) {
        state.unmount(true)
      }
      else {
        state.didUpdate()
      }
    }
  }
  exitDom.set(motionEl, true)
  addPopStyle(state)
  motionEl.addEventListener('motioncomplete', doneCallback)
  state.setActive('exit', true)
  state.getSnapshot(state.options, false)
  state.didUpdate()
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
    @leave="exit"
    @enter="enter"
  >
    <slot />
  </component>
</template>
