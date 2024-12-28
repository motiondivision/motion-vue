<script setup lang="ts">
import { Transition, TransitionGroup, toRefs } from 'vue'
import { mountedStates } from '@/state'
import { doneCallbacks, provideAnimatePresence, removeDoneCallback } from '@/components/presence'
import type { AnimatePresenceProps } from './types'
import { usePopLayout } from './use-pop-layout'
import { createStyles } from '@/state/style'
// 定义组件Props接口

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
})

// 解构并保持响应性
const { initial } = toRefs(props)

// 提供动画上下文
provideAnimatePresence({
  initial,
  safeUnmount(el) {
    return !doneCallbacks.has(el)
  },
})
// 处理元素进入动画
function enter(el: HTMLElement) {
  const state = mountedStates.get(el)
  const motionStateId = el.dataset.motionId
  const motionState = mountedStates.get(motionStateId)
  if (motionState) {
    const baseStyle = createStyles(motionState.baseTarget)
    Object.assign(el.style, baseStyle)
  }
  if (!state) {
    return
  }
  removeDoneCallback(el)
  state.setActive('exit', false)
}

const { addPopStyle, removePopStyle } = usePopLayout(props)
// 处理元素退出动画
function exit(el: Element, done: VoidFunction) {
  const state = mountedStates.get(el)
  if (!state) {
    return done()
  }
  removeDoneCallback(el)
  addPopStyle(state)
  function doneCallback(e?: any) {
    if (e?.detail?.isExit) {
      const projection = state.visualElement.projection
      // @ts-ignore
      if ((projection?.animationProgress > 0 && !state.isSafeToRemove)) {
        return
      }
      state.willUpdate('done')

      removePopStyle(state)
      removeDoneCallback(el)
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
</script>

<template>
  <!-- 根据multiple属性动态选择Transition或TransitionGroup组件 -->
  <component
    :is="multiple ? TransitionGroup : Transition"
    :tag="multiple ? as : undefined"
    :css="false"
    :mode="mode === 'wait' ? 'out-in' : undefined"
    @enter="enter"
    @leave="exit"
  >
    <slot />
  </component>
</template>

<style scoped>

</style>
