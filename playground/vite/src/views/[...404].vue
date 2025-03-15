<template>
  <div class="container mx-auto max-w-4xl px-6 py-12">
    <div class="flex flex-col items-center gap-8">
      <h1 class="text-6xl font-bold text-center text-gray-900 dark:text-white">
        404
      </h1>
      <p class="text-xl text-center text-gray-600 dark:text-gray-400">
        Page not found
      </p>
      <router-link
        to="/"
        class="btn btn-primary"
      >
        Go Home
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.container {
  text-align: center;
  padding: 2rem;
}

.home-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  color: #646cff;
  text-decoration: none;
  border: 1px solid currentColor;
  border-radius: 4px;
  transition: all 0.2s;
}

.home-link:hover {
  background: #646cff;
  color: white;
}
</style>
