<script setup lang="ts">
const {
  inStack = false,
  name,
  sync = '_pm',
  saveDev = false,
  noSync,
} = defineProps<{
  inStack?: boolean
  name?: string
  sync?: string
  saveDev?: boolean
  noSync?: boolean
}>()

const md = `
::code-group{${inStack ? 'in-stack' : ''} ${noSync ? '' : `sync="${sync}"`}}
${
  usePm().packageManagers.value.map((pm) => {
    const code = name
      ? `${pm.command}${pm.install}${saveDev ? pm.saveDev : ''}${name}`
      : `${pm.command}${pm.installEmpty}`
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
