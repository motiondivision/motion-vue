export interface NavItem {
  title: string
  href?: string
  disabled?: boolean
  external?: boolean
  icon?: string
  label?: string
}

export type SidebarNavItem = NavItem & {
  items: SidebarNavItem[]
}

export type NavItemWithChildren = NavItem & {
  items: NavItemWithChildren[]
}

interface DocsConfig {
  mainNav: NavItem[]
  sidebarNav: SidebarNavItem[]
}

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: 'Documentation',
      href: '/docs/introduction',
    },
  ],
  sidebarNav: [
    {
      title: 'Getting Started',
      items: [
        {
          title: 'Introduction',
          href: '/docs/introduction',
          items: [],
        },
        {
          title: 'Installation',
          href: '/docs/installation',
          items: [],
        },
        {
          title: 'Changelog',
          href: '/docs/changelog',
          items: [],
        },
      ],
    },
    {
      title: 'Components',
      items: [
        {
          title: 'Motion',
          href: '/docs/components/motion',
          items: [],
        },
        {
          title: 'AnimatePresence',
          href: '/docs/components/animate-presence',
          items: [],
        },
      ],
    },
    {
      title: 'Motion Values',
      items: [
        {
          title: 'Overview',
          href: '/docs/motion-values/overview',
          items: [],
        },
        {
          title: 'useMotionValueEvent',
          href: '/docs/motion-values/use-motion-value-event',
          items: [],
        },
        {
          title: 'useMotionTemplate',
          href: '/docs/motion-values/use-motion-template',
          items: [],
        },
        {
          title: 'useScroll',
          href: '/docs/motion-values/use-scroll',
          items: [],
        },
        {
          title: 'useSpring',
          href: '/docs/motion-values/use-spring',
          items: [],
        },
        {
          title: 'useTime',
          href: '/docs/motion-values/use-time',
          items: [],
        },
        {
          title: 'useTransform',
          href: '/docs/motion-values/use-transform',
          items: [],
        },
        {
          title: 'useVelocity',
          href: '/docs/motion-values/use-velocity',
          items: [],
        },
      ],
    },
    {
      title: 'Hooks',
      items: [
        {
          title: 'useAnimate',
          href: '/docs/hooks/use-animate',
          items: [],
        },
        {
          title: 'useInView',
          href: '/docs/hooks/use-in-view',
          items: [],
        },
        {
          title: 'useAnimateFrame',
          href: '/docs/hooks/use-animate-frame',
          items: [],
        },
      ],
    },
  ],
}
