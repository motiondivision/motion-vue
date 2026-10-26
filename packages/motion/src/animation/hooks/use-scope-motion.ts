import type { MotionScope, ScopeOptions, ScopeSetup } from 'motion-dom'
import type { MaybeComputedElementRef, MaybeRefOrGetter } from '@vueuse/core'
import type { ShallowRef } from 'vue'
import { unrefElement } from '@vueuse/core'
import { scopeMotion } from 'motion-dom'
import { shallowRef, toValue, watchEffect } from 'vue'

export type UseScopeMotionOptions = ScopeOptions

export function useScopeMotion(
  domRef: MaybeComputedElementRef,
  setup: ScopeSetup,
  options?: MaybeRefOrGetter<UseScopeMotionOptions>,
): ShallowRef<MotionScope | null> {
  const scope = shallowRef<MotionScope | null>(null)

  watchEffect((onCleanup) => {
    const current = scopeMotion(
      unrefElement(domRef) || undefined,
      setup,
      toValue(options),
    )
    scope.value = current

    onCleanup(() => {
      current.cancel()
      if (scope.value === current)
        scope.value = null
    })
  }, {
    flush: 'post',
  })

  return scope
}
