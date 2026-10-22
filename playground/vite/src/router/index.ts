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

// The home page is the hub users keep coming back to. Remember its offset so
// returning from a demo lands where they left off, while demos open at the top.
let homeScrollY = 0

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...routes,
    {
      path: '/scroll-test',
      component: () => import('../views/scroll-test/index.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition)
      return savedPosition
    if (to.path === '/')
      return { top: homeScrollY }
    return { top: 0 }
  },
})

router.beforeEach((to, from) => {
  if (from.path === '/')
    homeScrollY = window.scrollY
})
