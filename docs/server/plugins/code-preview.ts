import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'

interface ComponentFile {
  name: string
  code: string
}

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('content:file:beforeParse', async (file) => {
    if (typeof file.body !== 'string')
      return

    const getComponentFiles = (name: string): ComponentFile[] => {
      try {
        const componentDir = resolve(process.cwd(), 'components/demo', name)
        const files = readdirSync(componentDir, { withFileTypes: true })
          .filter(file => file.isFile())
          .map((file) => {
            const code = readFileSync(resolve(componentDir, file.name), 'utf-8')
            return {
              name: file.name,
              code,
            }
          }).sort((a, b) => {
            if (a.name === 'index.vue')
              return -1
            if (b.name === 'index.vue')
              return 1
            return a.name.localeCompare(b.name)
          })
        return files
      }
      catch (error) {
        console.error(`Failed to read component files for ${name}:`, error)
        return []
      }
    }

    // 使用正则表达式一次性匹配所有props
    const PROPS_REGEX = /(\w+)="([^"]*)"/g

    file.body = file.body.replaceAll(
      /<ComponentPreview\s+([^>]+)\/>/g,
      (_, bindingValue) => {
        const matches = Array.from(bindingValue.matchAll(PROPS_REGEX))
        const props: Record<string, string> = {}
        for (const match of matches as RegExpMatchArray[]) {
          const [, key, value] = match
          if (key && value)
            props[key] = value
        }

        const files = getComponentFiles(props.name)
        const fileNoCode = files.map((file) => {
          return {
            ...file,
            code: '',
          }
        })
        return `::ComponentPreview
---
name:
  ${props.name}
files:
  ${JSON.stringify(fileNoCode)}
---
${generateCodeSlots(files)}
::`
      },
    )
  })
})

function generateCodeSlots(files: ComponentFile[]) {
  return files.map((file, i) => {
    return `#slot-${i} 
\`\`\`${file.name.split('.')[1]}
${file.code}
\`\`\`
`
  }).join('\n')
}
