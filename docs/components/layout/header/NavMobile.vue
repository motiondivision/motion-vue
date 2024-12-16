<script setup lang="ts">
const { nav } = useConfig().value.header
</script>

<template>
  <div>
    <LayoutHeaderNavMobileItem
      v-for="(item, i) in nav"
      :key="i"
      :item="item"
      :index="i"
    />
  </div>
</template>
