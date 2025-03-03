import type { Variant, VariantLabels } from '@/types'

export type FocusProps = {
  focus?: VariantLabels | Variant
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
}
