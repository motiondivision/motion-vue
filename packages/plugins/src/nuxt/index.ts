import { addComponent, addImports, defineNuxtModule } from '@nuxt/kit'

import { components as allComponents, utilities as allUtilities } from 'motion-v'

export interface ModuleOptions {
  components: Partial<Record<keyof typeof allComponents, boolean>> | boolean
  prefix: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'motion-v',
    configKey: 'motionV',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },
  defaults: {
    prefix: '',
    components: true,
  },
  setup(options, _nuxtApp) {
    function getComponents() {
      if (typeof options.components === 'object') {
        return Object.entries(allComponents)
          .filter(([name]) => (options.components as Record<string, boolean>)[name])
          .flatMap(([_, components]) => components)
      }

      if (options.components)
        return Object.values(allComponents).flat()

      return []
    }

    for (const component of getComponents()) {
      addComponent({
        name: `${options.prefix}${component}`,
        export: component,
        filePath: 'motion-v',
      })
    }

    function getUtilities() {
      if (typeof options.components === 'object') {
        return Object.entries(allUtilities)
          .filter(([name]) => (options.components as Record<string, boolean>)[name])
          .flatMap(([_, utilities]) => utilities)
      }

      if (options.components)
        return Object.values(allUtilities).flat()

      return []
    }

    for (const utility of getUtilities()) {
      addImports({
        from: 'motion-v',
        name: utility,
      })
    }
  },
})
