import type { VariantType } from '@/types'
import type { VariantLabels } from 'motion-dom'

export type FocusProps = {
  /**
   * Variant to apply when the element is focused.
   */
  whileFocus?: VariantLabels | VariantType
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
}
