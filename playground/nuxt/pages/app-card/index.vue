<script lang="ts" setup>
import { computed, ref } from 'vue'
import { AnimatePresence, Motion, MotionConfig } from 'motion-v'
import { CARDS, type Card } from './card'
import CardItem from './CardItem.vue'
import ActiveCard from './ActiveCard.vue'

const cardId = ref<Card['id'] | null>(null)
const activeCard = computed(() =>
  CARDS.find(card => card.id === cardId.value),
)

// useEventListener('keydown', (event: KeyboardEvent) => {
//   if (event.key === 'Escape') {
//     cardId.value = null
//   }
// })
</script>

<template>
  <div class="h-screen w-screen">
    <MotionConfig>
      <LayoutGroup>
        <div class="cards-wrapper">
          <CardItem
            v-for="(card, i) in CARDS"
            :key="card.id"
            :card="card"
            :data-id="`card-${cardId}`"
            @select="cardId = CARDS[i].id"
          />

          <AnimatePresence>
            <Motion
              v-if="activeCard"
              :initial="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
              :exit="{ opacity: 0 }"
              class="overlay"
            />
          </AnimatePresence>
          <AnimatePresence>
            <ActiveCard
              v-if="activeCard"
              :card="activeCard"
              @close="cardId = null"
            />
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </MotionConfig>
  </div>
</template>

<style>
.card {
  height: 370px;
  width: 320px;
  border-radius: 20px;
  overflow: hidden;
  margin: auto 0;
  position: relative;
  outline: none;
  user-select: none;
  cursor: pointer;
}

.card-inner {
  height: 430px;
  width: 360px;
  position: relative;
}

.card-inner > img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  pointer-events: none;
}

.card > img {
  height: 100%;
  width: 100%;
  position: absolute;
  inset: 0;
}

.card-active {
  width: 360px;
  position: absolute;
  top: 5%;
  height: 100%;
  margin: 0;
  background: white;
  display: flex;
  border-radius: 0;
  flex-direction: column;
}

.long-description {
  padding: 16px;
  flex: 1;
}

.long-description p {
  line-height: 1.6;
  color: #666666;
  margin-bottom: 16px;
}

.long-description b {
  color: black;
  font-weight: 600;
}

.card-heading {
  font-size: 40px;
  line-height: 0.9;
  font-weight: 800;
  max-width: 160px;
  text-align: left;
  text-transform: uppercase;
  color: white;
  margin-bottom: 4px;
}

.card-description {
  font-size: 13px;
  color: white;
  opacity: 0.9;
}

.card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.extra-info {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.2);
  padding: 12px 16px;
  backdrop-filter: blur(2px);
}

.extra-info img {
  border-radius: 8px;
}

.card-content .card-text {
  padding: 0 16px 12px;
}

.game-title {
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.game-subtitle {
  font-size: 12px;
  color: #c4c5cd;
}

.get-button {
  margin-left: auto;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.3);
  padding: 4px 16px;
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.bottom-bar {
  height: 64px;
  width: 100%;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  backdrop-filter: blur(2px);
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  background-color: rgb(0 0 0 / 0.15);
}

.bottom-bar img {
  border-radius: 8px;
}

.card-title {
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.card-subtitle {
  font-size: 12px;
  color: #b9babc;
}

.bottom-bar-content {
  display: flex;
  flex-direction: column;
}

.button {
  font-weight: 600;
  padding: 4px 16px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
  margin-left: auto;
  color: white;
}

.cards-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  height: 675px;
  width: 100%;
  height: 100%;
  margin: auto 0;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
}

.close-button {
  position: absolute;
  top: 16px;
  right: 16px;
  height: 32px;
  width: 32px;
  border-radius: 50%;
  backdrop-filter: blur(4px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}

.positioner {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.desc-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
