<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
const routes = router.getRoutes()
  .filter(route => !route.path.includes('*') && route.path !== '/')
  .sort((a, b) => a.path.localeCompare(b.path))
</script>

<template>
  <div class="container mx-auto max-w-4xl px-6 py-12">
    <h1 class="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
      Motion Vue Examples
    </h1>
    <nav class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <router-link
        v-for="route in routes"
        :key="route.path"
        :to="route.path"
        class="card hover:shadow-lg transition-shadow duration-200
               flex items-center justify-center p-6 text-lg font-medium
               text-primary-500 hover:text-primary-600
               border border-primary-100 dark:border-primary-800"
      >
        {{ route.name }}
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

nav {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.nav-link {
  display: block;
  padding: 1rem;
  text-decoration: none;
  color: #646cff;
  background: rgba(100, 108, 255, 0.08);
  border-radius: 8px;
  transition: all 0.2s;
  text-align: center;
  border: 1px solid rgba(100, 108, 255, 0.2);
}

.nav-link:hover {
  background: rgba(100, 108, 255, 0.15);
  border-color: #646cff;
}
</style>
