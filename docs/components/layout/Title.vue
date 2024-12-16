<script setup lang="ts">
const { title, description, badges } = defineProps<{
  title?: string
  description?: string
  badges?: {
    value?: string
    icon?: string
    to?: string
    target?: Target
    type?: 'default' | 'info' | 'warning' | 'success' | 'danger' | 'lime'
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }[]
}>()
</script>

<template>
  <div class="mb-6">
    <ProseH1>
      {{ title }}
    </ProseH1>
    <p class="pt-1 text-lg text-secondary-foreground">
      {{ description }}
    </p>

    <div
      v-if="badges"
      class="flex gap-2 pt-4"
    >
      <NuxtLink
        v-for="(badge, i) in badges"
        :key="i"
        :to="badge.to"
        :target="badge.target"
      >
        <UiBadge
          :variant="badge.variant || 'secondary'"
          :type="badge.type"
          class="gap-1 rounded-md"
        >
          {{ badge.value }}
          <Icon
            v-if="badge.to || badge.icon"
            :size="12"
            :name="badge.icon || 'lucide:external-link'"
          />
        </UiBadge>
      </NuxtLink>
    </div>
  </div>
</template>
