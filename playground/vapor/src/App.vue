<script setup vapor lang="ts">
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import {
  type ApiPath,
  type DemoEntry,
  apiLabel,
  demos,
  findDemo,
  supportedBothDemos,
  supportedComponentDemos,
  unsupportedDemos,
} from './catalog'

function readHash(): string | null {
  const raw = window.location.hash.replace(/^#\/?/, '')
  return raw || null
}

const currentId = ref<string | null>(readHash())
const DemoComp = shallowRef<unknown>(null)
const loadError = ref<string | null>(null)
/** Gallery filter: all | directive-focused | component-focused (both always shown in "all"). */
const pathFilter = ref<'all' | ApiPath>('all')

const current = computed(() => findDemo(currentId.value))

function matchesPathFilter(d: DemoEntry) {
  if (pathFilter.value === 'all')
    return true
  if (!d.api || d.api === 'both')
    return true
  return d.api === pathFilter.value
}

const filteredSupportedBoth = computed(() =>
  supportedBothDemos.filter(matchesPathFilter),
)

const filteredSupportedComponent = computed(() =>
  supportedComponentDemos.filter(matchesPathFilter),
)

const filteredUnsupported = computed(() =>
  unsupportedDemos.filter(matchesPathFilter),
)

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
            <code style="color:#d8b4fe">MotionPlugin</code> +
            <code style="color:#d8b4fe">vaporInteropPlugin</code>。
            <strong>双路径</strong>演示 v-motion 与 &lt;Motion&gt;；
            <strong>组件路径</strong>覆盖指令做不到的 context 特性（Variants / Presence / Layout / Config）；
            指令专属限制仍标为不支持（不伪造）。
          </p>
          <div class="note">
            运行：<code>pnpm play:vapor</code>
            或 <code>pnpm --filter @motion-vue/playground-vapor dev</code>
            · 需要 Vue <code>3.6.0-rc.11+</code>（本 playground 已钉死）
          </div>
        </div>

        <div class="filter-bar">
          <span class="filter-label">路径筛选</span>
          <button
            type="button"
            class="filter-btn"
            :class="{ active: pathFilter === 'all' }"
            @click="pathFilter = 'all'"
          >
            全部
          </button>
          <button
            type="button"
            class="filter-btn"
            :class="{ active: pathFilter === 'directive' }"
            @click="pathFilter = 'directive'"
          >
            v-motion
          </button>
          <button
            type="button"
            class="filter-btn"
            :class="{ active: pathFilter === 'component' }"
            @click="pathFilter = 'component'"
          >
            &lt;Motion&gt;
          </button>
        </div>

        <section class="section">
          <h2 class="section-title">
            双路径支持 Supported · {{ filteredSupportedBoth.length }}
          </h2>
          <div class="grid">
            <button
              v-for="demo in filteredSupportedBoth"
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
                <div class="badge-stack">
                  <span
                    v-if="demo.api"
                    class="badge path"
                    :class="demo.api"
                  >{{ apiLabel(demo.api) }}</span>
                  <span class="badge ok">Supported</span>
                </div>
              </div>
              <p class="summary">
                {{ demo.summary }}
              </p>
            </button>
          </div>
        </section>

        <section
          v-if="filteredSupportedComponent.length"
          class="section"
        >
          <h2 class="section-title">
            组件路径支持 · 指令不可 · {{ filteredSupportedComponent.length }}
          </h2>
          <div class="grid">
            <button
              v-for="demo in filteredSupportedComponent"
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
                <div class="badge-stack">
                  <span
                    v-if="demo.api"
                    class="badge path"
                    :class="demo.api"
                  >{{ apiLabel(demo.api) }}</span>
                  <span class="badge ok">Supported</span>
                </div>
              </div>
              <p class="summary">
                {{ demo.summary }}
              </p>
            </button>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">
            指令不支持 Unsupported · {{ filteredUnsupported.length }}
          </h2>
          <div class="grid">
            <button
              v-for="demo in filteredUnsupported"
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
                <div class="badge-stack">
                  <span
                    v-if="demo.api"
                    class="badge path"
                    :class="demo.api"
                  >{{ apiLabel(demo.api) }}</span>
                  <span class="badge no">Unsupported</span>
                </div>
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
                  <th>路径</th>
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
                      v-if="demo.api"
                      class="badge path"
                      :class="demo.api"
                    >{{ apiLabel(demo.api) }}</span>
                  </td>
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
          <span
            v-if="current.api"
            class="badge path"
            :class="current.api"
            style="margin-right: 0.5rem"
          >{{ apiLabel(current.api) }}</span>
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
          <h2>此特性在当前标注路径下不可用 / 未验证</h2>
          <p>{{ current.summary }}</p>
          <p v-if="current.detail">
            {{ current.detail }}
          </p>
          <p>
            本 playground <strong>不会</strong>伪造该能力。
            标注为 <strong>v-motion</strong> 的条目仅针对指令路径限制；
            标注 tried/broken 的组件条目表示已在 vapor+interop 下实测失败。
            可用的 context 能力见上方 <strong>组件路径支持</strong> 区。
          </p>
        </div>

        <!-- Attempted / broken demos still mount so the failure is visible -->
        <div
          v-if="current.status === 'unsupported' && current.load"
          style="margin-top: 1.25rem"
        >
          <p
            v-if="loadError"
            class="lead"
          >
            加载失败：{{ loadError }}
          </p>
          <component
            :is="DemoComp"
            v-else-if="DemoComp"
          />
        </div>
      </div>
    </main>
  </div>
</template>
