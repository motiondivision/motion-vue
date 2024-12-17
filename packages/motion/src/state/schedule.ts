import type { MotionState } from '@/state/motion-state'
import { addUniqueItem, removeItem } from './utils'

let scheduled: MotionState[] | undefined
const fireNext = (iterator: Iterator<void>) => iterator.next()
const fireAnimateUpdates = (state: MotionState) => state.animateUpdates()

function processScheduledAnimations() {
  if (!scheduled)
    return

  const generators = scheduled.sort(compareByDepth).map(fireAnimateUpdates)

  generators.forEach(fireNext)
  generators.forEach(fireNext)

  scheduled = undefined
}

export function scheduleAnimation(state: MotionState) {
  if (!scheduled) {
    scheduled = [state]
    requestAnimationFrame(processScheduledAnimations)
  }
  else {
    addUniqueItem(scheduled, state)
  }
}

export function unscheduleAnimation(state: MotionState) {
  scheduled && removeItem(scheduled, state)
}

function compareByDepth(a: MotionState, b: MotionState) {
  return a.depth - b.depth
}
