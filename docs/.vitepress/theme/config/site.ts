import { version } from '../../../package.json'

export const siteConfig = {
  name: 'motion-vue',
  url: 'https://motion-vue.com',
  ogImage: 'https://motion-vue.com/og.png',
  description:
    'Beautifully designed components built with Motion and Tailwind CSS.',
  links: {},
  keywords: 'Motion,Vue,Nuxt,Vue Components,Framer Motion',
}

export const announcementConfig = {
  icon: '✨',
  title: `New v${version}`,
  link: 'https://github.com/rick-hup/motion-vue/releases',
}
