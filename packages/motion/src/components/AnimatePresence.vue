<script setup lang="ts">
import { Transition, TransitionGroup, toRefs, watch } from 'vue'
import { mountedStates } from '@/state'
import { doneCallbacks, provideAnimatePresence, removeDoneCallback, unPresenceDom } from '@/components/presence'
import { injectLayoutGroup, provideLayoutGroup } from './context'
import { useForceUpdate } from './use-force-update'
import { useIdle } from '@vueuse/core'
import { useLayoutGroup } from './use-layout-group'
import type { AnimatePresenceProps } from './type'

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
function enter(el: Element) {
  const state = mountedStates.get(el)
  if (!state) {
    return
  }
  removeDoneCallback(el)
  state.setActive('exit', false)
  unPresenceDom.value.delete(el)
  state.isPresence.value = true
}

const layoutGroup = useLayoutGroup(props as any)
// 处理元素退出动画
function exit(el: Element, done: VoidFunction) {
  unPresenceDom.value.set(el, true)
  const state = mountedStates.get(el)
  if (!state) {
    return done()
  }
  state.isPresence.value = false
  removeDoneCallback(el)
  function doneCallback(e?: any) {
    if (e?.detail?.isExit) {
      removeDoneCallback(el)
      unPresenceDom.value.delete(el)
      // trigger projection update
      state.visualElement.projection?.willUpdate()
      layoutGroup.forceRender?.()
      done()
      if (!el.isConnected) {
        state.unmount()
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
