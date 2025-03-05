import type { Variant, VariantLabels } from '@/types'

export type FocusProps = {
  /**
   * @deprecated Use `whileFocus` instead.
   */
  focus?: VariantLabels | Variant
  /**
   * Variant to apply when the element is focused.
   */
  whileFocus?: VariantLabels | Variant
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
}
