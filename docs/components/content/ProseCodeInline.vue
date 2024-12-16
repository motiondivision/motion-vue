<template>
  <code class="inline-code relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono">
    <slot />
  </code>
</template>

<style scoped>
.inline-code:not(h1>code, h1>a>code, h2>a>code, h3>a>code, h4>a>code, h5>a>code, strong>a>code) {
  /* text-sm */
  font-size: 0.875rem;
  line-height: 1.25rem;
}
</style>
