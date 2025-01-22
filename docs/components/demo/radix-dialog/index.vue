<script setup lang="ts">
import { DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle, DialogTrigger } from 'radix-vue'
import { AnimatePresence, Motion, motion } from 'motion-v'
</script>

<template>
  <DialogRoot>
    <DialogTrigger>
      <UiButton>Open</UiButton>
    </DialogTrigger>
    <DialogPortal>
      <AnimatePresence multiple>
        <DialogOverlay
          as-child
          class="bg-black/50 fixed inset-0 z-[1000]"
        >
          <motion.div
            :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }"
            :exit="{ opacity: 0 }"
            :transition="{ duration: 0.3, ease: 'easeInOut' }"
          />
        </DialogOverlay>
        <DialogContent
          as-child
          class="w-full max-w-md rounded-xl bg-white p-6 backdrop-blur-2xl     z-[1001] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Motion
            :initial="{ opacity: 0, scale: 0.95, x: '-50%', y: '-50%' }"
            :animate="{ opacity: 1, scale: 1 }"
            :exit="{ opacity: 0, scale: 0.95 }"
            :transition="{ duration: 0.3, ease: 'easeInOut' }"
          >
            <DialogTitle
              as="h3"
              class="text-lg font-medium leading-6 text-gray-900"
            >
              Payment successful
            </DialogTitle>
            <DialogDescription
              as="div"
              class="mt-2"
            >
              <p class="text-sm text-gray-500">
                Your payment has been successfully submitted. We’ve sent you
                an email with all of the details of your order.
              </p>
            </DialogDescription>
            <DialogTrigger as-child>
              <UiButton class="mt-4">
                Got it, thanks!
              </UiButton>
            </DialogTrigger>
          </Motion>
        </DialogContent>
      </AnimatePresence>
    </DialogPortal>
  </DialogRoot>
</template>
