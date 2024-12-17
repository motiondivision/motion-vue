<template>
  <UiCard class="divide-y overflow-hidden [&:not(:first-child)]:mt-5">
    <div
      v-for="(slot, i) in $slots.default?.() ?? []"
      :key="i"
    >
      <component
        :is="slot"
        :in-stack="true"
      />
    </div>
  </UiCard>
</template>
