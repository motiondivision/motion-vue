<script setup lang="ts">
import { Transition, TransitionGroup, toRefs } from 'vue'
import { mountedStates } from '@/state'
import { doneCallbacks, provideAnimatePresence, removeDoneCallback } from '@/components/presence'

// 定义组件Props接口
export interface AnimatePresenceProps {
  // 动画模式: wait(等待前一个完成), popLayout(弹出布局), sync(同步)
  mode?: 'wait' | 'popLayout' | 'sync'
  // 是否显示初始动画
  initial?: boolean
  // 是否支持多个元素同时动画
  multiple?: boolean
  as?: string
}

// 定义组件选项
defineOptions({
  name: 'AnimatePresence',
  inheritAttrs: false, // 禁止继承属性到根元素
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
})
// 处理元素进入动画
function enter(el: Element) {
  const state = mountedStates.get(el)
  if (!state) {
    return
  }
  removeDoneCallback(el)
  state.setActive('exit', false)
}

// 处理元素退出动画
function exit(el: Element, done: VoidFunction) {
  const state = mountedStates.get(el)
  if (!state) {
    return done()
  }
  state.setActive('exit', true)
  removeDoneCallback(el)
  function doneCallback(e?: any) {
    if (e?.detail?.isExit) {
      done()
    }
  }
  doneCallbacks.set(el, doneCallback)
  el.addEventListener('motioncomplete', doneCallback)
}
</script>

<template>
  <!-- 根据multiple属性动态选择Transition或TransitionGroup组件 -->
  <component
    :is="multiple ? TransitionGroup : Transition"
    :tag="multiple ? as : undefined"
    :css="false"
    :mode="mode === 'wait' ? 'out-in' : undefined"
    v-bind="$attrs"
    @enter="enter"
    @leave="exit"
  >
    <slot />
  </component>
</template>

<style scoped>

</style>
