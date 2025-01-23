<script setup lang="ts">
type PropDef = {
  name?: string
  required?: boolean
  default?: string | boolean
  type: string
  typeSimple: string
  description?: string
}

interface PropsTableProps {
  data: PropDef[]
}
const { data } = defineProps<PropsTableProps>()
</script>

<template>
  <ProseTable class="rounded-md border border-border/50 bg-white">
    <ProseThead>
      <ProseTr>
        <ProseTh class="w-1/6 bg-muted/30 py-3 text-sm font-medium">
          <span>Prop</span>
        </ProseTh>
        <ProseTh class="w-1/6 bg-muted/30 py-3 text-sm font-medium">
          <span>Default</span>
        </ProseTh>
        <ProseTh class="w-2/3 bg-muted/30 py-3 text-sm font-medium">
          <span>Type</span>
        </ProseTh>
      </ProseTr>
    </ProseThead>

    <ProseTbody>
      <ProseTr
        v-for="(prop, index) in data"
        :key="`${prop.name}-${index}`"
        class=" transition-colors"
      >
        <ProseTd class="py-3">
          <div class="flex h-full items-start gap-1">
            <ProseCodeInline class="text-[13px] font-medium text-primary">
              {{ prop.name }}{{ prop.required ? "*" : null }}
            </ProseCodeInline>
          </div>
        </ProseTd>

        <ProseTd class="py-3">
          <div
            v-if="prop.default"
            class="flex h-full items-start gap-1"
          >
            <ProseCodeInline
              variant="secondary"
              class="text-muted-foreground"
            >
              {{ prop.default }}
            </ProseCodeInline>
          </div>
          <template v-else>
            <div
              as="{AccessibleIcon}"
              label="No default value"
              class="text-muted-foreground/50"
            >
              <!-- <Icon name="da" /> -->
            </div>
          </template>
        </ProseTd>

        <ProseTd class="py-3">
          <div class="flex flex-col">
            <ProseCodeInline
              variant="secondary"
              class="w-max text-sm text-primary/80"
            >
              {{ prop.typeSimple ? prop.typeSimple : prop.type }}
            </ProseCodeInline>
            <div
              class="mt-2 flex flex-col gap-2 text-sm text-muted-foreground [&_p]:mb-0 [&_p]:mt-0"
              v-html="prop.description"
            />
          </div>
        </ProseTd>
      </ProseTr>
    </ProseTbody>
  </ProseTable>
</template>
