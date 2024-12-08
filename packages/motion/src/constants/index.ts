const components = {
  motion: [
    'Motion',
    'AnimatePresence',
    'LayoutGroup',
  ],
}

export { components }
export type Components = keyof typeof components

export const utilities = {
  utilities: [
    'useTransform',
    'useTime',
    'useMotionTemplate',
    'useSpring',
    'useScroll',
    'useMotionValue',
    'useVelocity',
    'useAnimate',
    'useInView',
    'useAnimationFrame',
    'useMotionValueEvent',
  ],
}

export type Utilities = keyof typeof utilities
