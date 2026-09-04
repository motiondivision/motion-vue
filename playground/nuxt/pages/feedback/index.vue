<script setup lang="ts">
import { AnimatePresence, motion } from 'motion-v'
import { onClickOutside, useEventListener } from '@vueuse/core'
import Spinner from './Spinner.vue'

/**
 * Feedback 弹层(animations.dev 官方实现的 motion-v 移植):
 * 按钮与弹层共享 layoutId="wrapper"(inline 像素圆角保证形变不失真),
 * "Feedback" 文案共享 layoutId="title";提交后按钮内文案用
 * AnimatePresence popLayout 纵向滚动切换成 spinner。
 */
type FormState = 'idle' | 'loading' | 'success'

const open = ref(false)
const formState = ref<FormState>('idle')
const feedback = ref('')
const popover = ref<HTMLElement | null>(null)
const textarea = ref<HTMLTextAreaElement | null>(null)

const timers: ReturnType<typeof setTimeout>[] = []

function openPopover() {
  open.value = true
  formState.value = 'idle'
  feedback.value = ''
  nextTick(() => textarea.value?.focus())
}

function submit() {
  formState.value = 'loading'
  timers.push(setTimeout(() => (formState.value = 'success'), 1500))
  timers.push(setTimeout(() => (open.value = false), 3300))
}

onClickOutside(popover, () => (open.value = false))

useEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape')
    open.value = false
  if (
    (e.ctrlKey || e.metaKey)
    && e.key === 'Enter'
    && open.value
    && formState.value === 'idle'
    && feedback.value
  ) {
    submit()
  }
})

onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <div class="feedback-page">
    <div class="feedback-wrapper">
      <motion.button
        layout-id="wrapper"
        class="feedback-button"
        :style="{ borderRadius: '8px' }"
        @click="openPopover"
      >
        <motion.span layout-id="title">
          Feedback
        </motion.span>
      </motion.button>
    </div>
    <AnimatePresence>
      <motion.div
        v-if="open"
        ref="popover"
        layout-id="wrapper"
        class="feedback-popover"
        :style="{ borderRadius: '12px' }"
      >
        <motion.span
          aria-hidden
          class="placeholder"
          layout-id="title"
          :data-success="formState === 'success' ? 'true' : 'false'"
          :data-feedback="feedback ? 'true' : 'false'"
        >
          Feedback
        </motion.span>

        <div
          v-if="formState === 'success'"
          key="success"
          class="success-wrapper"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M27.6 16C27.6 17.5234 27.3 19.0318 26.717 20.4392C26.1341 21.8465 25.2796 23.1253 24.2025 24.2025C23.1253 25.2796 21.8465 26.1341 20.4392 26.717C19.0318 27.3 17.5234 27.6 16 27.6C14.4767 27.6 12.9683 27.3 11.5609 26.717C10.1535 26.1341 8.87475 25.2796 7.79759 24.2025C6.72043 23.1253 5.86598 21.8465 5.28302 20.4392C4.70007 19.0318 4.40002 17.5234 4.40002 16C4.40002 12.9235 5.62216 9.97301 7.79759 7.79759C9.97301 5.62216 12.9235 4.40002 16 4.40002C19.0765 4.40002 22.027 5.62216 24.2025 7.79759C26.3779 9.97301 27.6 12.9235 27.6 16Z"
              fill="#2090FF"
              fill-opacity="0.16"
            />
            <path
              d="M12.1334 16.9667L15.0334 19.8667L19.8667 13.1M27.6 16C27.6 17.5234 27.3 19.0318 26.717 20.4392C26.1341 21.8465 25.2796 23.1253 24.2025 24.2025C23.1253 25.2796 21.8465 26.1341 20.4392 26.717C19.0318 27.3 17.5234 27.6 16 27.6C14.4767 27.6 12.9683 27.3 11.5609 26.717C10.1535 26.1341 8.87475 25.2796 7.79759 24.2025C6.72043 23.1253 5.86598 21.8465 5.28302 20.4392C4.70007 19.0318 4.40002 17.5234 4.40002 16C4.40002 12.9235 5.62216 9.97301 7.79759 7.79759C9.97301 5.62216 12.9235 4.40002 16 4.40002C19.0765 4.40002 22.027 5.62216 24.2025 7.79759C26.3779 9.97301 27.6 12.9235 27.6 16Z"
              stroke="#2090FF"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <h3>Feedback received!</h3>
          <p>Thanks for helping me improve Sonner.</p>
        </div>

        <form
          v-else
          key="form"
          class="feedback-form"
          @submit.prevent="feedback && submit()"
        >
          <textarea
            ref="textarea"
            v-model="feedback"
            placeholder="Feedback"
            class="textarea"
            required
          />
          <div class="feedback-footer">
            <svg
              class="dotted-line"
              viewBox="0 0 352 2"
              preserveAspectRatio="none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0 1H352"
                stroke="#E6E7E8"
                stroke-dasharray="4 4"
              />
            </svg>
            <div class="half-circle-left">
              <svg
                width="6"
                height="12"
                viewBox="0 0 6 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 2C0.656613 2 1.30679 2.10346 1.91341 2.30448C2.52005 2.5055 3.07124 2.80014 3.53554 3.17157C3.99982 3.54301 4.36812 3.98396 4.6194 4.46927C4.87067 4.95457 5 5.47471 5 6C5 6.52529 4.87067 7.04543 4.6194 7.53073C4.36812 8.01604 3.99982 8.45699 3.53554 8.82843C3.07124 9.19986 2.52005 9.4945 1.91341 9.69552C1.30679 9.89654 0.656613 10 0 10V6V2Z"
                  fill="#F5F6F7"
                />
                <path
                  d="M1 12V10C2.06087 10 3.07828 9.57857 3.82843 8.82843C4.57857 8.07828 5 7.06087 5 6C5 4.93913 4.57857 3.92172 3.82843 3.17157C3.07828 2.42143 2.06087 2 1 2V0"
                  stroke="#E6E7E8"
                  stroke-width="1"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="half-circle-right">
              <svg
                width="6"
                height="12"
                viewBox="0 0 6 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0 2C0.656613 2 1.30679 2.10346 1.91341 2.30448C2.52005 2.5055 3.07124 2.80014 3.53554 3.17157C3.99982 3.54301 4.36812 3.98396 4.6194 4.46927C4.87067 4.95457 5 5.47471 5 6C5 6.52529 4.87067 7.04543 4.6194 7.53073C4.36812 8.01604 3.99982 8.45699 3.53554 8.82843C3.07124 9.19986 2.52005 9.4945 1.91341 9.69552C1.30679 9.89654 0.656613 10 0 10V6V2Z"
                  fill="#F5F6F7"
                />
                <path
                  d="M1 12V10C2.06087 10 3.07828 9.57857 3.82843 8.82843C4.57857 8.07828 5 7.06087 5 6C5 4.93913 4.57857 3.92172 3.82843 3.17157C3.07828 2.42143 2.06087 2 1 2V0"
                  stroke="#E6E7E8"
                  stroke-width="1"
                  stroke-linejoin="round"
                />
              </svg>
            </div>

            <button
              type="submit"
              class="submit-button"
            >
              <AnimatePresence
                mode="popLayout"
                :initial="false"
              >
                <motion.span
                  :key="formState"
                  :transition="{ type: 'spring', duration: 0.3, bounce: 0 }"
                  :initial="{ opacity: 0, y: -25 }"
                  :animate="{ opacity: 1, y: 0 }"
                  :exit="{ opacity: 0, y: 25 }"
                >
                  <Spinner
                    v-if="formState === 'loading'"
                    :size="14"
                    color="rgba(255, 255, 255, 0.65)"
                  />
                  <span v-else>Send feedback</span>
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<style scoped>
/* animations.dev Feedback 弹层样式——原样移植 */
.feedback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.feedback-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 340px;
}

.feedback-button {
  height: 36px;
  padding: 0 14px;
  background: #ffffff;
  border: 1px solid #e6e7e8;
  font-size: 14.5px;
  color: #222222;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  cursor: pointer;
}

/* layoutId 投影需要 transform 生效——非替换 inline 元素上 transform 无效 */
.feedback-button > span {
  display: inline-block;
}

.feedback-popover {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 352px;
  height: fit-content;
  background: #f5f6f7;
  border: 1px solid #e6e7e8;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 4px;
}

.placeholder {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1;
  font-size: 14px;
  color: #636563;
  pointer-events: none;
  transition: opacity 0.2s;
}

.placeholder[data-success='true'],
.placeholder[data-feedback='true'] {
  opacity: 0;
}

.feedback-form {
  display: flex;
  flex-direction: column;
}

.textarea {
  width: 100%;
  height: 108px;
  resize: none;
  outline: none;
  background: #ffffff;
  border: 1px solid #e6e7e8;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  padding: 12px;
  font-size: 14px;
  font-family: inherit;
  color: #222222;
}
.textarea::placeholder {
  opacity: 0;
}

.feedback-footer {
  position: relative;
  height: 48px;
  background: #ffffff;
  border: 1px solid #e6e7e8;
  border-top: none;
  border-radius: 0 0 8px 8px;
  display: flex;
  align-items: center;
  padding: 0 6px;
}

.dotted-line {
  position: absolute;
  top: -1px;
  left: 1px;
  width: calc(100% - 2px);
  height: 2px;
}

.half-circle-left {
  position: absolute;
  left: -1px;
  top: -6px;
}

.half-circle-right {
  position: absolute;
  right: -1px;
  top: -6px;
  transform: scaleX(-1);
}

.submit-button {
  margin-left: auto;
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 9999px;
  background: #0f0f10;
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  cursor: pointer;
}

.submit-button span {
  display: inline-block;
}

.success-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 36px 16px 28px;
}

.success-wrapper h3 {
  font-size: 15px;
  font-weight: 600;
  color: #171717;
  margin: 12px 0 0;
}

.success-wrapper p {
  font-size: 13.5px;
  color: #636563;
  margin: 4px 0 0;
}
</style>
