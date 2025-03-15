import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const modules = import.meta.glob('../views/**/*.vue')

const routes: RouteRecordRaw[] = Object.keys(modules).map((path) => {
  const name = path
    .replace('../views/', '')
    .replace('.vue', '')
    .replace(/\/index$/, '')
    .replace(/\//g, '-')
    .toLowerCase()

  return {
    path: path
      .replace('../views', '')
      .replace('.vue', '')
      .replace(/\/index$/, '')
      .toLowerCase(),
    name,
    component: modules[path],
  }
})

// Add root route
routes.push({
  path: '/',
  name: 'home',
  component: () => import('../views/index.vue'),
})

// Add 404 route
routes.push({
  path: '/:pathMatch(.*)*',
  name: 'not-found',
  component: () => import('../views/[...404].vue'),
})

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
