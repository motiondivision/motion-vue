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
    // {
    //   title: 'GitHub',
    //   href: 'https://github.com/radix-vue/shadcn-vue',
    //   external: true,
    // },
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
  ],
}
