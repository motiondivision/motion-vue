<script setup lang="ts">
const config = useConfig()
</script>

<template>
  <header
    class="fixed top-0 w-full z-40 bg-background/80 backdrop-blur-sm"
    :class="{ 'lg:border-b': config.header.border }"
  >
    <div
      class="flex h-14 items-center justify-between gap-2 px-4 md:px-8"
      :class="{ 'border-b lg:border-none': config.header.border, 'container max-w-screen-2xl': config.main.padded }"
    >
      <LayoutHeaderLogo
        class="flex-1 md:flex"
        :class="[config.header.showTitleInMobile ? 'flex' : 'hidden']"
      />
      <LayoutHeaderNav class="hidden flex-1 lg:flex" />
      <div class="flex flex-1 justify-end gap-2">
        <LayoutHeaderSearch v-if="!config.search.inAside && config.search.style === 'input'" />
        <div class="flex">
          <LayoutHeaderSearch v-if="!config.search.inAside && config.search.style === 'button'" />
          <LayoutHeaderThemeSwitch />
          <NuxtLink
            v-for="(link, i) in config.header.links"
            :key="i"
            :to="link?.to"
            :target="link?.target"
          >
            <UiButton
              variant="ghost"
              size="icon"
              class="flex gap-2"
            >
              <Icon
                v-if="link?.icon"
                :name="link.icon"
                :size="20"
              />
            </UiButton>
          </NuxtLink>
        </div>
      </div>
    </div>
    <div
      v-if="config.toc.enable && config.toc.enableInMobile"
      class="lg:hidden"
    >
      <LayoutToc is-small />
    </div>
  </header>
</template>
