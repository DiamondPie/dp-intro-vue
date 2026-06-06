<template>
  <section id="works" class="relative z-10 max-w-6xl mx-auto px-6 py-20">
    <div class="animate-fadeIn">
      <h2 class="lg:text-4xl text-2xl mb-8 flex items-center gap-4 uppercase">
        <span class="font-extrabold">Works</span>
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          v-for="(work, index) in works"
          :key="work.href"
          :href="work.href"
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-2xl overflow-hidden hover:bg-[var(--content-1-hover)] transition-all duration-300 group cursor-pointer relative aspect-[4/3] flex flex-col md:col-span-1"
          :style="`animation: 0.8s ease-out ${index * 0.1}s 1 normal both running fadeInUp`"
        >
          <div class="absolute inset-0 z-0">
            <img
              :alt="work.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-all duration-[600ms] ease-in-out opacity-100"
              :src="work.image"
              loading="lazy"
            />
          </div>
          <div class="relative z-10 mt-auto">
            <div
              class="absolute -left-[2px] -right-[2px] -bottom-[2px] -top-12 z-[-1] bg-gradient-to-t from-black/80 via-black/40"
            ></div>
            <div class="p-6">
              <h3 class="text-xl font-bold mb-2">{{ work.title }}</h3>
              <p class="text-sm leading-relaxed line-clamp-2 text-white/60">{{ work.description }}</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  </section>
</template>

<script setup>
const works = [
  {
    href: 'https://blog.dpp.qzz.io',
    title: 'Personal Blog',
    description: 'A hexo blog built based on Anzhiyu Theme.',
    image: 'https://cdn.jsdelivr.net/gh/DiamondPie/storage@master/intro/works/blog.webp'
  },
  {
    href: 'https://github.com/DiamondPie/Irisbot',
    title: 'Irisbot',
    description: 'A native discord chatbot build with discord.py',
    image: 'https://cdn.jsdelivr.net/gh/DiamondPie/storage@master/intro/works/discord_bot.webp'
  },
  {
    href: 'https://github.com/DiamondPie/DetectClipOut',
    title: 'DetectClipOut',
    description:
      'An NZQA exam simulation page, which would detect if you have clipped out of the page.',
    image: 'https://cdn.jsdelivr.net/gh/DiamondPie/storage@master/intro/works/detect_clip.webp'
  },
  {
    href: 'https://year.dpp.qzz.io',
    title: 'Countdown',
    description: 'A new year (or any events) countdown frontend.',
    image: 'https://cdn.jsdelivr.net/gh/DiamondPie/storage@master/intro/works/countdown.webp'
  }
]
</script>