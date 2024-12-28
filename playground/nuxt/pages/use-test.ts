import { type Slot, computed, useSlots } from 'vue'

export function useSlotChangeIndex() {
  let prevSlots: ReturnType<NonNullable<Slot>> | undefined
  let index = 0
  const slots = useSlots()
  return computed(() => {
    const newSlots = slots.default?.()
    if (prevSlots !== newSlots) {
      index++
      prevSlots = newSlots
    }
    return index
  })
}
