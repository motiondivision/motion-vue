import type { VariantType } from '@/types'
import type { VariantLabels } from 'motion-dom'

type MarginValue = `${number}${'px' | '%'}`

type MarginType = MarginValue | `${MarginValue} ${MarginValue}` | `${MarginValue} ${MarginValue} ${MarginValue}` | `${MarginValue} ${MarginValue} ${MarginValue} ${MarginValue}`

export interface InViewOptions {
  root?: Element | Document
  margin?: MarginType
  amount?: 'some' | 'all' | number
}

type ViewportEventHandler = (entry: IntersectionObserverEntry | null) => void

export interface InViewProps {
  inViewOptions?: InViewOptions & { once?: boolean }
  /**
   * @deprecated Use `whileInView` instead.
   */
  inView?: VariantLabels | VariantType
  /**
   * Variant to apply when the element is in view.
   */
  whileInView?: VariantLabels | VariantType
  onViewportEnter?: ViewportEventHandler
  onViewportLeave?: ViewportEventHandler
}
