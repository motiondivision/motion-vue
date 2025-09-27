<script setup lang="tsx">
/** @jsxImportSource vue */
import { AnimatePresence, LayoutGroup, motion } from 'motion-v'
import { Tabs } from 'reka-ui/namespaced'
import { ref } from 'vue'

const tab = ref('account')

const tabs = [
  {
    value: 'account',
    label: 'Account',
    title: 'Account settings',
    content: () => (
      <div class="form-fields">
        <input
          type="text"
          placeholder="Username"
          class="input-field"
        />
        <input
          type="email"
          placeholder="Email"
          class="input-field"
        />
      </div>
    ),
    buttonText: 'Save changes',
  },
  {
    value: 'password',
    label: 'Password',
    title: 'Password',
    content: () => 'Change your password here. After saving, you\'ll be logged out.',
    buttonText: 'Change password',
  },
  {
    value: 'settings',
    label: 'Settings',
    title: 'Settings',
    content: () => 'Manage your notification and privacy settings.',
    buttonText: 'Update settings',
  },
]
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <LayoutGroup>
      <Tabs.Root
        v-model="tab"
        as-child
      >
        <motion.div
          class="tabs-root"
          layout
          :data-layout-id="tab"
        >
          <Tabs.List as-child>
            <motion.div
              class="tabs-list"
              layout
            >
              <Tabs.Trigger
                v-for="item in tabs"
                :key="item.value"
                :value="item.value"
                class="tabs-trigger"
              >
                {{ item.label }}
                <motion.div
                  v-if="tab === item.value"
                  class="tabs-indicator"
                  layout-id="tabs-indicator"
                />
              </Tabs.Trigger>
            </motion.div>
          </Tabs.List>

          <AnimatePresence
            :initial="false"
            mode="wait"
          >
            <template
              v-for="item in tabs"
              :key="item.value"
            >
              <Tabs.Content
                v-if="tab === item.value"
                :value="item.value"
                as-child
              >
                <motion.div
                  layout
                  class="tabs-content"
                  :initial="{ opacity: 0, filter: 'blur(5px)' }"
                  :animate="{ opacity: 1, filter: 'blur(0px)' }"
                  :exit="{
                    opacity: 0,
                    filter: 'blur(5px)',
                    transition: { duration: 0.15 },
                  }"
                >
                  <h3>{{ item.title }}</h3>
                  <div class="content-wrapper">
                    <component :is="item.content" />
                  </div>
                  <motion.button
                    as="button"
                    class="button large"
                    :while-press="{ scale: 0.95 }"
                  >
                    {{ item.buttonText }}
                  </motion.button>
                </motion.div>
              </Tabs.Content>
            </template>
          </AnimatePresence>
        </motion.div>
      </Tabs.Root>
    </LayoutGroup>
  </div>
</template>

<style>
.tabs-root {
  display: flex;
  flex-direction: column;
  width: 400px;
  max-width: 100%;
  background-color: #0b1011;
  border: 1px solid #1d2628;
  overflow: hidden;
  border-radius: 10px;
}

.tabs-list {
  display: flex;
  border-bottom: 1px solid #1d2628;
}

.tabs-trigger {
  font-family: inherit;
  padding: 0 20px;
  height: 45px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  line-height: 1;
  color: var(--feint-text);
  user-select: none;
  cursor: pointer;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  position: relative;
}

.tabs-trigger .tabs-indicator {
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: #ff0088;
}

.tabs-trigger:hover {
  color: var(--text);
}

.tabs-trigger[data-state='active'] {
  color: var(--text);
}

.tabs-content {
  padding: 20px;
  will-change: opacity, filter;
}

.tabs-content h3 {
  margin: 0 0 10px 0;
  color: var(--text);
  font-size: 18px;
  font-weight: 500;
}

.content-wrapper {
  margin: 0 0 20px 0;
  color: var(--feint-text);
  font-size: 14px;
  line-height: 1.5;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-field {
  padding: 8px 12px;
  border: 1px solid #1d2628;
  border-radius: 4px;
  background: #0b1011;
  color: var(--text);
  font-size: 14px;
}

.input-field:focus {
  outline: none;
  border-color: #ff0088;
  transition: border-color 0.2s ease;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  font-weight: 500;
  user-select: none;
  border: none;
  background: #ff0088;
  color: white;
  cursor: pointer;
}

.button.large {
  font-size: 16px;
  padding: 0 20px;
  line-height: 35px;
  height: 35px;
}
</style>
