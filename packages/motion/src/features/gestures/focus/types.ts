import type { Variant } from '@/types'

export type FocusProps = {
  focus?: string | Variant
  onFocus?: (e: FocusEvent) => void
  onBlur?: (e: FocusEvent) => void
}
