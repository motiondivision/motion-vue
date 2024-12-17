import type { Options } from 'motion-v'

export const slideUp: Options = {
  variants: {
    hidden: { opacity: 0, y: 30, rotate: 3 },
    visible: { opacity: 1, y: 0, rotate: 0 },
  },
  transition: {
    type: 'spring',
    stiffness: 260,
    damping: 50,
  },
}
