<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
// import { Circle } from 'rc-progress'
import NumberFlow from '@number-flow/vue'

const initialValues = [
  {
    title: 'The Majestic Mountains',
    link: '#the-majestic-mountains',
    description: [
      'Towering peaks reach towards the sky, their snow-capped summits kissing the clouds. The rugged terrain of mountains offers a breathtaking display of nature\'s raw power and beauty.',
      'Hikers and adventurers are drawn to these formidable landscapes, seeking the thrill of conquest and the serenity of high-altitude vistas.',
    ],
  },
  {
    title: 'Lush Forests',
    link: '#lush-forests',
    description: [
      'Verdant canopies stretch as far as the eye can see, a sea of green teeming with life. Forests are the lungs of our planet, purifying the air and providing habitats for countless species.',
      'From the misty redwood groves of California to the tropical rainforests of the Amazon, these wooded realms hold secrets and wonders yet to be fully explored.',
      'The gentle rustle of leaves and the soft crunch of forest floor beneath one\'s feet create a symphony of tranquility.',
    ],
  },
  {
    title: 'Serene Lakes',
    link: '#serene-lakes',
    description: [
      'Mirror-like surfaces reflect the sky and surrounding landscape, creating a double world of beauty. Lakes serve as oases of calm in nature, their still waters hiding complex ecosystems beneath.',
    ],
  },
  {
    title: 'Winding Rivers',
    link: '#winding-rivers',
    description: [
      'Lifeblood of the land, rivers carve their paths through diverse terrains, shaping the world around them. From gentle streams to roaring rapids, these flowing waterways are essential to both wildlife and human civilizations.',
      'The constant motion of rivers reminds us of the ever-changing nature of our world and the importance of going with the flow.',
    ],
  },
  {
    title: 'Vast Deserts',
    link: '#vast-deserts',
    description: [
      'Seemingly barren landscapes that hide surprising biodiversity and resilience. Deserts teach us about adaptation and the tenacity of life in extreme conditions.',
      'The shifting sands and stark beauty of these arid regions have inspired artists, writers, and explorers for centuries.',
      'From the towering dunes of the Sahara to the alien landscapes of the Atacama, deserts offer a unique perspective on the diversity of our planet.',
    ],
  },
  {
    title: 'Coastal Wonders',
    link: '#coastal-wonders',
    description: [
      'Where land meets sea, a dynamic interplay of elements creates some of nature\'s most stunning vistas. Rugged cliffs, sandy beaches, and hidden coves showcase the relentless power and beauty of the ocean.',
      'Coastal ecosystems are among the most productive on Earth, supporting a rich variety of marine and terrestrial life.',
    ],
  },
  {
    title: 'Polar Regions',
    link: '#polar-regions',
    description: [
      'The Arctic and Antarctic, Earth\'s icy extremes, are lands of stark beauty and harsh conditions. Vast ice sheets, towering glaciers, and endless expanses of snow create otherworldly landscapes.',
      'Despite the challenging environment, these regions are home to unique and hardy species, from polar bears in the north to penguins in the south.',
    ],
  },
  {
    title: 'Tropical Islands',
    link: '#tropical-islands',
    description: [
      'Scattered across vast oceans, tropical islands are nature\'s paradise. Palm-fringed beaches, crystal-clear waters, and lush interiors create idyllic scenes that captivate the imagination.',
      'These isolated ecosystems often harbor unique species found nowhere else on Earth, making them hotspots of biodiversity and natural wonder.',
    ],
  },
  {
    title: 'Volcanic Landscapes',
    link: '#volcanic-landscapes',
    description: [
      'Forged by the Earth\'s fiery core, volcanic landscapes offer a glimpse into the planet\'s raw power. From smoldering craters to hardened lava fields, these formations are a testament to the Earth\'s dynamic nature.',
      'Despite their destructive force, volcanic soils often support rich ecosystems, demonstrating life\'s remarkable adaptability.',
    ],
  },
  {
    title: 'Ancient Forests',
    link: '#ancient-forests',
    description: [
      'Standing for centuries or even millennia, ancient forests are living museums of Earth\'s history. Towering redwoods, sprawling rainforests, and misty cloud forests harbor countless species and complex ecosystems.',
      'These forests play a crucial role in maintaining global climate and biodiversity, serving as the lungs of our planet.',
    ],
  },
  {
    title: 'Canyons and Gorges',
    link: '#canyons-and-gorges',
    description: [
      'Carved by the patient work of water over millions of years, canyons and gorges reveal the Earth\'s geological history in dramatic fashion. Their layered walls tell stories of ancient seas, shifting continents, and changing climates.',
      'From the Grand Canyon to the fjords of Norway, these formations offer breathtaking vistas and unique habitats for specialized flora and fauna.',
    ],
  },
  {
    title: 'Wetlands and Marshes',
    link: '#wetlands-and-marshes',
    description: [
      'Often overlooked, wetlands are among the most productive ecosystems on Earth. These water-saturated landscapes act as nature\'s filters, purifying water and providing crucial habitats for countless species of plants and animals.',
      'From the Everglades to the Pantanal, wetlands play a vital role in flood control, carbon sequestration, and maintaining biodiversity.',
    ],
  },
  {
    title: 'Alpine Meadows',
    link: '#alpine-meadows',
    description: [
      'Nestled high in mountain ranges, alpine meadows burst with life during brief summer seasons. These fragile ecosystems host a stunning array of wildflowers and specialized plants adapted to harsh conditions.',
      'Alpine regions are particularly sensitive to climate change, making them important indicators of global environmental shifts.',
    ],
  },
]

const open = ref(false)
const selected = ref('')
const isScrolling = ref(false)
const scrollTimeoutRef = ref<NodeJS.Timeout | null>(null)
const scrollPercentage = ref(0)

function updatePageScroll() {
  scrollPercentage.value = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
}

function handleScroll() {
  isScrolling.value = true

  if (scrollTimeoutRef.value) {
    clearTimeout(scrollTimeoutRef.value)
  }

  scrollTimeoutRef.value = setTimeout(() => {
    isScrolling.value = false
  }, 150)

  updatePageScroll()
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  updatePageScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (scrollTimeoutRef.value) {
    clearTimeout(scrollTimeoutRef.value)
  }
})

watch(isScrolling, (newVal) => {
  if (!newVal) {
    console.log('Scrolling has stopped')
  }
})
const transition = { duration: 0.7, type: 'spring', bounce: 0.25 }
</script>

<template>
  <div>
    <AnimatePresence>
      <Motion
        v-if="open"
        class="fixed inset-0 z-30 bg-white/30 backdrop-blur-lg"
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1 }"
        :leave="{ opacity: 0 }"
        :transition="transition"
      />
    </AnimatePresence>

    <div class="fixed left-1/2 top-12 z-40 -translate-x-1/2">
      <Motion
        class="bg-natural-900 relative bg-black  cursor-pointer overflow-hidden text-white"
        :style="{ borderRadius: '22px' }"
        layout
        :initial="{
          height: '44px',
          width: '240px',
        }"
        :animate="{
          height: open ? 'auto' : '44px',
          width: open ? '320px' : '260px',
          transition: {
            duration: 0.7,
            type: 'spring',
            bounce: open ? 0.25 : 0.15,
          },
        }"
        :transition="transition"
      >
        <header
          class="flex h-11 cursor-pointer items-center gap-2 px-4"
          @click="open = !open"
        >
          <div class="h-7 w-7">
            <!-- <Circle
              :percent="scrollPercentage * 100"
              :stroke-width="10"
              stroke-color="#fff"
            /> -->
          </div>
          <h1 class="grow font-bold">
            Nature's Beauty
          </h1>
          <NumberFlow
            :value="scrollPercentage"
            :format="{ style: 'percent' }"
            locales="en-US"
          />
        </header>

        <div class="mt-2 flex flex-col gap-2 px-4 pb-4">
          <NuxtLink
            v-for="item in initialValues"
            :key="item.link"
            :to="item.link"
            class="text-natural-400 hover:text-natural-200 whitespace-nowrap text-sm"
            @click="() => {
              open = false
              selected = item.link
            }"
          >
            {{ item.title }}
          </NuxtLink>
        </div>
      </Motion>
    </div>

    <div>
      <Motion
        v-for="item in initialValues"
        :id="item.link.slice(1)"
        :key="item.link"
        class="mb-12 scroll-mt-48"
        :animate="{
          opacity: !isScrolling && selected === item.link ? [0.5, 0.6, 0.8, 1, 0.8, 0.6, 0.5, 1] : 1,
          transition: {
            duration: 0.5,
            delay: 0.2,
          },
        }"
      >
        <h1 class="mb-4 text-2xl font-bold">
          {{ item.title }}
        </h1>
        <p
          v-for="(description, index) in item.description"
          :key="index"
          class="mb-4"
        >
          {{ description }}
        </p>
      </Motion>
    </div>
  </div>
</template>
