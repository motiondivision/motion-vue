import { getParameters } from 'codesandbox/lib/api/define'
import sdk from '@stackblitz/sdk'
import tailwindConfigRaw from '../../../tailwind.config?raw'
import type { Style } from '@/lib/registry/styles'

export function makeCodeSandboxParams(componentName: string, style: Style, sources: Record<string, string>) {
  let files: Record<string, any> = {}
  files = constructFiles(componentName, style, sources)
  files['.codesandbox/Dockerfile'] = {
    content: 'FROM node:18',
  }
  return getParameters({ files, template: 'node' })
}

export function makeStackblitzParams(componentName: string, style: Style, sources: Record<string, string>) {
  const files: Record<string, string> = {}
  Object.entries(constructFiles(componentName, style, sources)).forEach(([k, v]) => (files[`${k}`] = typeof v.content === 'object' ? JSON.stringify(v.content, null, 2) : v.content))
  return sdk.openProject({
    title: `${componentName} - Radix Vue`,
    files,
    template: 'node',
  }, {
    newWindow: true,
    openFile: ['src/App.vue'],
  })
}

const viteConfig = {
  'vite.config.js': {
    content: `import path from "path"
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})`,
    isBinary: false,
  },
  'index.html': {
    content: `<!DOCTYPE html>
    <html class="dark" lang="en">
      <head>
        <meta charset="UTF-8" />
        <link rel="icon" type="image/svg+xml" href="/vite.svg" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vite + Vue + TS</title>
      </head>
      <body>
        <div id="app"></div>
        <script type="module" src="/src/main.ts"></script>
      </body>
    </html>
    `,
    isBinary: false,
  },
}

function constructFiles(componentName: string, style: Style, sources: Record<string, string>) {
  const componentsJson = {
    style,
    tailwind: {
      config: 'tailwind.config.js',
      css: 'src/assets/index.css',
      baseColor: 'zinc',
      cssVariables: true,
    },
    aliases: {
      utils: '@/utils',
      components: '@/components',
    },
  }

  const dependencies = {
    'vue': 'latest',
    'clsx': 'latest',
    'class-variance-authority': 'latest',
    'tailwind-merge': 'latest',
    'tailwindcss-animate': 'latest',
    'motion-v': 'latest',
    'typescript': 'latest',
  }

  const devDependencies = {
    'vite': 'latest',
    '@vitejs/plugin-vue': 'latest',
    'vue-tsc': 'latest',
    'tailwindcss': 'latest',
    'postcss': 'latest',
    'autoprefixer': 'latest',
  }

  const transformImportPath = (code: string) => {
    let parsed = code
    parsed = parsed.replaceAll(`@/lib/registry/${style}`, '@/components')
    parsed = parsed.replaceAll('@/lib/utils', '@/utils')
    return parsed
  }

  const componentFiles = Object.keys(sources).filter(key => key.endsWith('.vue') && key !== 'index.vue')
  const components: Record<string, any> = {}
  componentFiles.forEach((i) => {
    components[`src/${i}`] = {
      isBinary: false,
      content: transformImportPath(sources[i]),
    }
  })

  interface DemoIndexEntry {
    registryDependencies?: string[]
  }

  interface DemoIndex {
    [style: string]: {
      [component: string]: DemoIndexEntry
    }
  }

  const demoIndex: DemoIndex = {}

  const files = {
    'package.json': {
      content: {
        name: `motion-v-${componentName.toLowerCase().replace(/ /g, '-')}`,
        scripts: { start: `vite` },
        dependencies,
        devDependencies,
      },
      isBinary: false,
    },
    'components.json': {
      content: componentsJson,
      isBinary: false,
    },
    ...viteConfig,
    'tailwind.config.js': {
      content: tailwindConfigRaw,
      isBinary: false,
    },
    'postcss.config.js': {
      content: `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}`,
      isBinary: false,
    },
    'tsconfig.json': {
      content: `{
"$schema": "https://json.schemastore.org/tsconfig",
"compilerOptions": {
  "baseUrl": ".",
  "paths": {
    "@/*": ["./src/*"]
  }
}
}`,
      isBinary: false,
    },
    'src/utils.ts': {
      isBinary: false,
      content: `import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { camelize, getCurrentInstance, toHandlerKey } from 'vue'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`,
    },
    'src/assets/index.css': {
      // content: cssRaw,
      isBinary: false,
    },
    'src/main.ts': {
      content: `import { createApp } from 'vue';
import App from './App.vue';
import './assets/global.css';
import './assets/index.css';

createApp(App).mount('#app')`,
      isBinary: false,
    },
    'src/App.vue': {
      isBinary: false,
      content: sources['index.vue'],
    },
    ...components,
    'src/assets/global.css': {
      content: `
      @tailwind base;
      @tailwind components;
      @tailwind utilities;
      
      @layer base {
      :root {
      --background: 0 0% 100%;
      --foreground: 240 10% 3.9%;
      --card: 0 0% 100%;
      --card-foreground: 240 10% 3.9%;
      --popover: 0 0% 100%;
      --popover-foreground: 240 10% 3.9%;
      --primary: 240 5.9% 10%;
      --primary-foreground: 0 0% 98%;
      --secondary: 240 4.8% 95.9%;
      --secondary-foreground: 240 5.9% 10%;
      --muted: 240 4.8% 95.9%;
      --muted-foreground: 240 3.8% 46.1%;
      --accent: 240 4.8% 95.9%;
      --accent-foreground: 240 5.9% 10%;
      --destructive: 0 84.2% 60.2%;
      --destructive-foreground: 0 0% 98%;
      --border: 240 5.9% 90%;
      --input: 240 5.9% 90%;
      --ring: 240 5% 64.9%;
      --radius: 0.5rem;
    }

    .dark {
      --background: 240 10% 3.9%;
      --foreground: 0 0% 98%;
      --card: 240 10% 3.9%;
      --card-foreground: 0 0% 98%;
      --popover: 240 10% 3.9%;
      --popover-foreground: 0 0% 98%;
      --primary: 0 0% 98%;
      --primary-foreground: 240 5.9% 10%;
      --secondary: 240 3.7% 15.9%;
      --secondary-foreground: 0 0% 98%;
      --muted: 240 3.7% 15.9%;
      --muted-foreground: 240 5% 64.9%;
      --accent: 240 3.7% 15.9%;
      --accent-foreground: 0 0% 98%;
      --destructive: 0 62.8% 30.6%;
      --destructive-foreground: 0 85.7% 97.3%;
      --border: 240 3.7% 15.9%;
      --input: 240 3.7% 15.9%;
      --ring: 240 4.9% 83.9%;
    }


    * {
      @apply border-border;
    }
    html {
      -webkit-text-size-adjust: 100%;
      font-variation-settings: normal;
    }
    body {
      @apply bg-background text-foreground min-h-screen antialiased font-sans;
      font-feature-settings: "rlig" 1, "calt" 1;
    }

    /* Mobile tap highlight */
    /* https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-tap-highlight-color */
    html {
      -webkit-tap-highlight-color: rgba(128, 128, 128, 0.5);
    }

    /* === Scrollbars === */

    ::-webkit-scrollbar {
      @apply w-2;
      @apply h-2;
    }

    ::-webkit-scrollbar-track {
      @apply !bg-muted;
    }
    ::-webkit-scrollbar-thumb {
      @apply rounded-sm !bg-muted-foreground/30;
    }

    /* Firefox */
    /* https://developer.mozilla.org/en-US/docs/Web/CSS/scrollbar-color#browser_compatibility */
    html {
      scrollbar-color: hsl(215.4 16.3% 46.9% / 0.3);
    }

    html.dark {
      scrollbar-color: hsl(215.4 16.3% 56.9% / 0.3);
    }

    .hide-scrollbar::-webkit-scrollbar {
      display: none;
    }

    .hide-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .antialised {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

}˝

#app {
  @apply w-full flex items-center justify-center px-12;
}`,
      isBinary: false,
    },
  }

  return files
}
