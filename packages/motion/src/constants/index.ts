const components = {
  motion: [
    'Motion',
    'MotionPresence',
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
  ],
}

export type Utilities = keyof typeof utilities
