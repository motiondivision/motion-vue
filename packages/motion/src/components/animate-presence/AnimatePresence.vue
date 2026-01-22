<script setup lang="ts">
import { Transition, TransitionGroup, computed, onMounted, onUnmounted, watch } from 'vue'
import { mountedStates } from '@/state'
import type { MotionState } from '@/state'
import type { AnimatePresenceProps } from './types'
import { usePopLayout } from './use-pop-layout'
import { PRESENCE_CHILD_ATTR, provideAnimatePresence } from './presence'

defineOptions({
  name: 'AnimatePresence',
  inheritAttrs: true,
})

const props = withDefaults(defineProps<AnimatePresenceProps>(), {
  mode: 'sync',
  initial: true,
  anchorX: 'left',
})

// ===== Container State Management =====
interface ContainerState {
  motions: Set<MotionState>
  exitingMotions: Set<MotionState>
  done?: VoidFunction
  el: HTMLElement
}

const containerStates = new WeakMap<Element, ContainerState>()
const activeContainers = new Set<Element>()
// Pending states for SSR hydration scenario (enter hook not triggered)
const pendingStates = new Set<MotionState>()

// ===== Context Methods =====

// Called by motion component on mount
function register(container: Element, state: MotionState) {
  let containerState = containerStates.get(container)
  if (!containerState) {
    containerState = {
      motions: new Set(),
      exitingMotions: new Set(),
      el: container as HTMLElement,
    }
    containerStates.set(container, containerState)
  }
  containerState.motions.add(state)
}

// Called by motion component on unmount
function unregister(container: Element, state: MotionState) {
  const containerState = containerStates.get(container)
  if (containerState) {
    containerState.motions.delete(state)
    containerState.exitingMotions.delete(state)
  }
}

// Called when a motion component's exit animation is complete
function onMotionExitComplete(container: Element, state: MotionState) {
  const containerState = containerStates.get(container)
  if (!containerState)
    return

  containerState.exitingMotions.delete(state)

  // When all motion components have completed exit
  if (containerState.exitingMotions.size === 0 && containerState.done) {
    finalizeExit(container, containerState)
  }
}

// Register a motion component to pending list (for SSR hydration scenario)
function registerPending(state: MotionState) {
  pendingStates.add(state)
}

// Unregister a motion component from pending list
function unregisterPending(state: MotionState) {
  pendingStates.delete(state)
}

// ===== Provide Context =====
const presenceContext = {
  initial: props.initial,
  custom: props.custom,
  register,
  unregister,
  onMotionExitComplete,
  registerPending,
  unregisterPending,
}

watch(() => props.custom, (v) => {
  presenceContext.custom = v
}, { flush: 'pre' })

provideAnimatePresence(presenceContext)

onMounted(() => {
  presenceContext.initial = undefined
})

// ===== Pop Layout =====
const { addPopStyle, removePopStyle } = usePopLayout(props)

// ===== Mark Children with PRESENCE_CHILD_ATTR =====
function markChild(el: Element) {
  if (el instanceof HTMLElement && !el.hasAttribute(PRESENCE_CHILD_ATTR)) {
    el.setAttribute(PRESENCE_CHILD_ATTR, '')
    // If child is a motion component, register it
    const state = mountedStates.get(el)
    if (state && !state.presenceContainer) {
      state.presenceContainer = el
      register(el, state)
    }
  }
}

// ===== Enter =====
function enter(el: HTMLElement, done: VoidFunction) {
  console.log('enter', el)
  // Mark the direct child with PRESENCE_CHILD_ATTR
  markChild(el)
  // Reset exit state for all motion components in this container
  const containerState = containerStates.get(el)
  if (containerState) {
    containerState.exitingMotions.clear()
    containerState.motions.forEach((s) => {
      s.setActive('exit', false)
    })
  }
  done()
}

// ===== Exit =====
function exit(el: Element, done: VoidFunction) {
  const container = el as HTMLElement
  // Mark the direct child with PRESENCE_CHILD_ATTR
  markChild(container)

  // Register pending states that belong to this container (SSR hydration scenario)
  pendingStates.forEach((state) => {
    if (state.element && container.contains(state.element)) {
      state.presenceContainer = container
      register(container, state)
      pendingStates.delete(state)
    }
  })

  const containerState = containerStates.get(container)
  const containerMotionState = mountedStates.get(container)

  // If no registered motion components, complete immediately
  if ((!containerState || containerState.motions.size === 0) && !containerMotionState) {
    done()
    if (activeContainers.size === 0) {
      props.onExitComplete?.()
    }
    return
  }

  // Save done callback
  containerState.done = done
  activeContainers.add(container)

  // Add pop style to the container
  addPopStyle(container)

  // Trigger exit animation for all motion components
  containerState.motions.forEach((state) => {
    containerState.exitingMotions.add(state)
    state.setActive('exit', true)
    state.getSnapshot(state.options, false)
    state.didUpdate()
  })
}

// ===== Finalize Exit =====
function finalizeExit(container: Element, containerState: ContainerState) {
  // Remove pop style
  removePopStyle(containerState.el)

  // Call done to remove DOM
  containerState.done?.()
  containerState.done = undefined

  // Unmount motion states
  containerState.motions.forEach((state) => {
    state.getSnapshot(state.options, false)
    if (!state.element?.isConnected) {
      state.unmount(true)
    }
    else {
      state.didUpdate()
    }
  })

  // Cleanup
  activeContainers.delete(container)

  // Trigger onExitComplete when all containers have finished
  if (activeContainers.size === 0) {
    props.onExitComplete?.()
  }
}

// ===== Cleanup =====
onUnmounted(() => {
  activeContainers.forEach((container) => {
    const containerState = containerStates.get(container)
    if (containerState) {
      containerState.motions.forEach((state) => {
        state.unmount(true)
      })
    }
  })
  activeContainers.clear()
})

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

function beforeEnter(el: HTMLElement) {
  console.log('beforeEnter', el)
  // Mark the direct child with PRESENCE_CHILD_ATTR
  markChild(el)
}
</script>

<template>
  <!-- @vue-ignore -->
  <component
    :is="mode === 'wait' ? Transition : TransitionGroup"
    v-bind="transitionProps"
    appear
    @leave="exit"
    @enter="enter"
    @before-enter="beforeEnter"
  >
    <slot />
  </component>
</template>
