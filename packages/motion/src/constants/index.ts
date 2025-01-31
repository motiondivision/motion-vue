const components = {
  motion: [
    'Motion',
    'AnimatePresence',
    'LayoutGroup',
    'MotionConfig',
    'ReorderGroup',
    'ReorderItem',
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
    'useLayoutGroup',
    'useDragControls',
  ],
}

export type Utilities = keyof typeof utilities
