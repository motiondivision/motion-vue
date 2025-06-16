import type { VariantType } from '@/types'
import type { VariantLabels } from 'motion-dom'

export type FocusProps = {
  /**
   * @deprecated Use `whileFocus` instead.
   */
  focus?: VariantLabels | VariantType
  /**
   * Variant to apply when the element is focused.
   */
  whileFocus?: VariantLabels | VariantType
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
}
