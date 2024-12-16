<script setup lang="ts">
const {
  inStack = false,
  command,
  sync = '_pm',
  noSync,
} = defineProps<{
  inStack?: boolean
  command: string
  sync?: string
  noSync?: boolean
}>()

const md = `
::code-group{${inStack ? 'in-stack' : ''} ${noSync ? '' : `sync="${sync}"`}}
${
  usePm().packageManagers.value.map((pm) => {
    const code = `${pm.x}${command}`
    return `\`\`\`bash [${pm.name}]\n${code}\n\`\`\`\n`
  }).join('\n')
}
::
`
</script>

<template>
  <MDC
    :value="md"
    class="[&:not(:first-child)]:mt-5"
  />
</template>
