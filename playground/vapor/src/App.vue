<script setup vapor lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { type DemoEntry, demos, findDemo, supportedDemos, unsupportedDemos } from './catalog'

function readHash(): string | null {
  const raw = window.location.hash.replace(/^#\/?/, '')
  return raw || null
}

const currentId = ref<string | null>(readHash())
const DemoComp = shallowRef<unknown>(null)
const loadError = ref<string | null>(null)

const current = computed(() => findDemo(currentId.value))

async function loadDemo(entry: DemoEntry | undefined) {
  DemoComp.value = null
  loadError.value = null
  if (!entry?.load)
    return
  try {
    const mod = await entry.load()
    DemoComp.value = mod.default
  }
  catch (err) {
    loadError.value = err instanceof Error ? err.message : String(err)
  }
}

function goHome() {
  currentId.value = null
  window.location.hash = ''
}

function openDemo(entry: DemoEntry) {
  currentId.value = entry.id
  window.location.hash = `#/${entry.id}`
}

watch(currentId, (id) => {
  loadDemo(findDemo(id))
}, { immediate: true })

onMounted(() => {
  window.addEventListener('hashchange', () => {
    currentId.value = readHash()
  })
})
</script>

<template>
  <div class="shell">
    <div class="glow" />

    <header class="header">
      <div class="header-inner">
        <button
          type="button"
          class="header-link"
          style="margin-left: 0; display: flex; align-items: center; gap: 0.75rem"
          @click="goHome"
        >
          <img
            src="/logo.png"
            class="logo"
            alt="Motion for Vue"
          >
          <span class="brand">Motion for Vue</span>
        </button>
        <span class="pill">Vapor Playground</span>
        <button
          v-if="current"
          type="button"
          class="header-link"
          @click="goHome"
        >
          ← 返回目录
        </button>
        <a
          v-else
          class="header-link"
          href="https://motion.dev"
          target="_blank"
          rel="noopener"
        >
          motion.dev ↗
        </a>
      </div>
    </header>

    <main class="page">
      <!-- Gallery -->
      <template v-if="!current">
        <div class="hero">
          <h1>Vapor 特性目录</h1>
          <p>
            基于 Vue 3.6 <code style="color:#d8b4fe">createVaporApp</code> +
            <code style="color:#d8b4fe">MotionPlugin</code>。
            下列示例标明目前 vapor 下<strong>支持</strong>与<strong>不支持</strong>的能力（不伪造不可用特性）。
          </p>
          <div class="note">
            运行：<code>pnpm play:vapor</code>
            或 <code>pnpm --filter @motion-vue/playground-vapor dev</code>
            · 需要 Vue <code>3.6.0-rc.11+</code>（本 playground 已钉死）
          </div>
        </div>

        <section class="section">
          <h2 class="section-title">
            支持 Supported · {{ supportedDemos.length }}
          </h2>
          <div class="grid">
            <button
              v-for="demo in supportedDemos"
              :key="demo.id"
              type="button"
              class="card"
              @click="openDemo(demo)"
            >
              <div class="card-top">
                <div>
                  <h3>{{ demo.title }}</h3>
                  <p class="en">
                    {{ demo.titleEn }}
                  </p>
                </div>
                <span class="badge ok">Supported</span>
              </div>
              <p class="summary">
                {{ demo.summary }}
              </p>
            </button>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">
            不支持 Unsupported · {{ unsupportedDemos.length }}
          </h2>
          <div class="grid">
            <button
              v-for="demo in unsupportedDemos"
              :key="demo.id"
              type="button"
              class="card"
              @click="openDemo(demo)"
            >
              <div class="card-top">
                <div>
                  <h3>{{ demo.title }}</h3>
                  <p class="en">
                    {{ demo.titleEn }}
                  </p>
                </div>
                <span class="badge no">Unsupported</span>
              </div>
              <p class="summary">
                {{ demo.summary }}
              </p>
            </button>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">
            特性矩阵 Feature matrix
          </h2>
          <div class="matrix">
            <table>
              <thead>
                <tr>
                  <th>特性</th>
                  <th>状态</th>
                  <th>说明</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="demo in demos"
                  :key="demo.id"
                >
                  <td>{{ demo.title }}</td>
                  <td>
                    <span
                      class="badge"
                      :class="demo.status === 'supported' ? 'ok' : 'no'"
                    >
                      {{ demo.status === 'supported' ? 'Supported' : 'Unsupported' }}
                    </span>
                  </td>
                  <td>{{ demo.summary }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>

      <!-- Demo / stub -->
      <div
        v-else
        class="demo-page"
      >
        <h1>{{ current.title }}</h1>
        <p class="lead">
          <span
            class="badge"
            :class="current.status === 'supported' ? 'ok' : 'no'"
            style="margin-right: 0.5rem"
          >
            {{ current.status === 'supported' ? 'Supported' : 'Unsupported' }}
          </span>
          {{ current.summary }}
        </p>

        <template v-if="current.status === 'supported'">
          <p
            v-if="loadError"
            class="stub"
          >
            加载失败：{{ loadError }}
          </p>
          <component
            :is="DemoComp"
            v-else-if="DemoComp"
          />
          <p
            v-else
            class="lead"
          >
            加载中…
          </p>
        </template>

        <div
          v-else
          class="stub"
        >
          <h2>此特性在 vapor 指令路径下不可用</h2>
          <p>{{ current.summary }}</p>
          <p v-if="current.detail">
            {{ current.detail }}
          </p>
          <p>
            本 playground <strong>不会</strong>伪造该能力。请使用现有
            <code>playground/vite</code>（vdom）验证完整行为，或改用
            <code>&lt;Motion&gt;</code> + context（部分场景仍需 vdom）。
          </p>
        </div>
      </div>
    </main>
  </div>
</template>
