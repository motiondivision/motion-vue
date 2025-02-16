<script setup lang="ts">
import { Transition, TransitionGroup, computed, onMounted, onUnmounted } from 'vue'
import { mountedStates } from '@/state'
import { doneCallbacks, provideAnimatePresence, removeDoneCallback } from '@/components/presence'
import type { AnimatePresenceProps } from './types'
import { usePopLayout } from './use-pop-layout'
import { frame } from 'framer-motion/dom'

// 定义组件选项
defineOptions({
  name: 'AnimatePresence',
  inheritAttrs: true,
})

// 设置Props默认值
const props = withDefaults(defineProps<AnimatePresenceProps>(), {
  mode: 'sync',
  initial: true,
  multiple: false,
  unwrapElement: false,
})

const presenceContext = {
  initial: props.initial,
  custom: props.custom,
}
provideAnimatePresence(presenceContext)

onMounted(() => {
  presenceContext.initial = undefined
})

// 处理元素进入动画
function enter(el: HTMLElement) {
  const state = mountedStates.get(el)
  if (!state) {
    return
  }
  state.isVShow = true
  removeDoneCallback(el)
  state.setActive('exit', false)
}

const { addPopStyle, removePopStyle, styles } = usePopLayout(props)

const exitDom = new Map<Element, boolean>()

onUnmounted(() => {
  exitDom.clear()
})
// 处理元素退出动画
function exit(el: Element, done: VoidFunction) {
  let state = mountedStates.get(el)
  if (!state) {
    if (!props.unwrapElement) {
      return done()
    }
    el = el.firstElementChild as Element
    state = mountedStates.get(el)
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
        frame.render(() => {
          removePopStyle(state)
        })
      }
      done()

      if (!el?.isConnected) {
        state.unmount(true)
      }
    }
  }
  doneCallbacks.set(el, doneCallback)
  el.addEventListener('motioncomplete', doneCallback)
  state.setActive('exit', true)
}

const transitionProps = computed(() => {
  if (props.multiple) {
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
    :is="multiple ? TransitionGroup : Transition"
    :css="false"
    v-bind="transitionProps"
    @enter="enter"
    @leave="exit"
  >
    <slot />
  </component>
</template>

<style scoped>

</style>
