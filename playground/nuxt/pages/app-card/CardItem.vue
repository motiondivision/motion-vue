<script lang="ts" setup>
import { Motion } from 'motion-v'
import type { Card } from './card'

const { card } = defineProps<{ card: Card }>()
const emit = defineEmits(['select'])
</script>

<template>
  <Motion
    v-if="card"
    :data-id="card.id ? '1' : '2'"
    :layout-id="`card-${card.id}`"
    class="card"
    :while-tap="{ scale: 0.98 }"
    :initial="{ opacity: 1 }"
    :style="{ borderRadius: '20px' }"
    :crossfade="false"
    @click="emit('select')"
  >
    <Motion
      :layout-id="`image-${card.id}`"
      :src="card.image"
      alt="image"
      :style="{ borderRadius: '20px' }"
      as="img"
    />
    <Motion
      aria-hidden
      tabindex="-1"
      :layout-id="`close-button-${card.id}`"
      class="close-button"
      :style="{ opacity: 0 }"
      as="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="2"
        height="20"
        width="20"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M6 18 18 6M6 6l12 12"
        />
      </svg>
    </Motion>
    <Motion
      :layout-id="`card-content-${card.id}`"
      class="card-content"
      data-id="card-long-description-111"
    >
      <div class="card-text">
        <Motion
          :layout-id="`card-heading-${card.id}`"
          class="card-heading"
          as="h2"
        >
          Game of the day
        </Motion>
      </div>
      <Motion
        :layout-id="`card-extra-info-${card.id}`"
        class="extra-info"
        :style="{
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
        }"
      >
        <Motion
          :src="card.logo"
          width="40"
          height="40"
          alt="play"
          :layout-id="`card-game-image-${card.id}`"
          class="rounded-lg"
          as="img"
        />
        <div class="desc-wrapper">
          <Motion
            :layout-id="`card-game-title-${card.id}`"
            class="game-title"
            as="span"
          >
            {{ card.title }}
          </Motion>
          <Motion
            :layout-id="`card-game-subtitle-${card.id}`"
            class="game-subtitle"
            as="span"
          >
            {{ card.description }}
          </Motion>
        </div>
        <Motion
          :layout-id="`card-button-${card.id}`"
          class="get-button"
          as="button"
        >
          Get
        </Motion>
      </Motion>
    </Motion>

    <Motion
      :layout-id="`card-long-description-${card.id}`"
      class="long-description"
      :style="{ position: 'absolute', top: '100%', opacity: 0 }"
    >
      <p>
        <b>Are you ready?</b> {{ card.longDescription }}
      </p>
      <p>
        <b>The never ending adventure</b>
        In this game set in a fairy tale world, players embark on a quest
        through mystical lands filled with enchanting forests and towering
        mountains.
      </p>
    </Motion>
  </Motion>
</template>
