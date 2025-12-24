<script setup>
const isChecked = ref()
</script>

<template>
  <!-- <client-only> -->
  <div>
    <input
      v-model="isChecked"
      label="toggle"
      type="checkbox"
    >
    With Animate Presence

    <Motion style="display: flex; width: 300px; gap: 10px">
      <AnimatePresence
        mode="popLayout"
        multiple
      >
        <Motion
          v-if="isChecked"
          :exit="{
            opacity: 0,
          }"
          style="width: 80px; height: 50px; background: red;"
        />
        <Motion
          :layout="true"
          style="width: 100%; height: 50px; background: blue;"
        />
      </AnimatePresence>
    </Motion>
  </div>
  <div>
    <input
      v-model="isChecked"
      label="toggle"
      type="checkbox"
    >
    Without AnimatePresence
    <Motion style="display: flex; width: 300px; gap: 10px">
      <Motion
        v-if="isChecked"
        :exit="{
          opacity: 0,
        }"
        style="width: 80px; height: 50px; background: red;"
      />

      <Motion
        :layout="true"
        style="width: 100%; height: 50px; background: blue;"
      />
    </Motion>
  </div>
  <!-- </client-only> -->
</template>
