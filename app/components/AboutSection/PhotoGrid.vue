<template>
  <div class="!mt-8 columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
    <a
      v-for="photo in photos"
      :key="photo.src"
      :href="photo.src"
      target="_blank"
      rel="noopener noreferrer"
      class="relative block group overflow-hidden rounded-2xl break-inside-avoid cursor-zoom-in"
    >
      <img
        alt=""
        class="w-full h-[60%] object-cover duration-[600ms] group-hover:scale-105 ease-in-out opacity-100"
        :src="photo.src"
        loading="lazy"
      >
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"
      >
        <p class="text-white/90 text-sm font-medium">{{ photo.caption }}</p>
      </div>
    </a>

    <TextScatterCard :photo="scatterPhoto" />
  </div>
</template>

<script setup>
import TextScatterCard from './PhotoGrid/TextScatterCard.vue'

const scatterPhoto = {
  src: 'https://cdn.jsdelivr.net/gh/diamondpie/storage@master/intro/mita_miside.webp',
  alt: 'Mita - MiSide',
  caption: 'Mita - MiSide'
}

const photos = [
  {
    src: 'https://cdn.jsdelivr.net/gh/diamondpie/storage@master/intro/waihiki.webp',
    alt: 'Waihiki Island',
    caption: 'Waihiki Island'
  },
  {
    src: 'https://cdn.jsdelivr.net/gh/diamondpie/storage@master/intro/friends.webp',
    alt: 'Me and my friends!',
    caption: 'Me and my friends!'
  },
  {
    src: 'https://cdn.jsdelivr.net/gh/diamondpie/storage@master/intro/logo.webp',
    alt: 'Personal logo',
    caption: 'Personal logo'
  },
  {
    src: 'https://cdn.jsdelivr.net/gh/diamondpie/storage@master/intro/yutori_natsu.webp',
    alt: 'Yutori Natsu',
    caption: 'Yutori Natsu🥰🥰'
  },
  {
    src: 'https://cdn.jsdelivr.net/gh/diamondpie/storage@master/intro/beware_of_snakes.webp',
    alt: 'Beware of Snakes',
    caption: 'Beware of Snakes😱'
  },
  {
    src: 'https://cdn.jsdelivr.net/gh/diamondpie/storage@master/intro/rick_and_morty.webp',
    alt: 'Rick and Morty',
    caption: 'Rick and Morty'
  },
  {
    src: 'https://cdn.jsdelivr.net/gh/diamondpie/storage@master/intro/tower.webp',
    alt: 'A Sci-fi signal tower!',
    caption: 'A Sci-fi signal tower!'
  },
  {
    src: 'https://cdn.jsdelivr.net/gh/diamondpie/storage@master/intro/coromandel.webp',
    alt: 'Coromandel',
    caption: 'Coromandel'
  }
]
</script>