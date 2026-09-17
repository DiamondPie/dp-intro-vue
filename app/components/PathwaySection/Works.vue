<template>
  <div class="animate-fadeIn">
    <h3 class="lg:text-xl text-lg mb-6 flex items-center gap-2 font-semibold uppercase" style="color: var(--text-secondary)">
      <Icon name="mdi:package-variant-closed" class="shrink-0 text-xl" />
      {{ $t('pathway.works_title') }}
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <a
        v-for="(work, index) in works"
        :key="work.id"
        :href="work.href"
        target="_blank"
        rel="noopener noreferrer"
        class="rounded-2xl overflow-hidden hover:bg-[var(--content-1-hover)] transition-all duration-300 group cursor-pointer relative aspect-[4/3] flex flex-col md:col-span-1"
        :style="`animation: 0.8s ease-out ${index * 0.1}s 1 normal both running fadeInUp`"
      >
        <div class="absolute inset-0 z-0">
          <img
            alt=""
            class="w-full h-full object-cover group-hover:scale-105 transition-all duration-[600ms] ease-in-out opacity-100"
            :src="work.image"
            loading="lazy"
          >
        </div>
        <div class="relative z-10 mt-auto">
          <div
            class="absolute -left-[2px] -right-[2px] -bottom-[2px] -top-12 z-[-1] bg-gradient-to-t from-black/80 via-black/40"
          />
          <div class="p-6">
            <h3 class="text-xl font-bold mb-2">{{ pick(work.title) }}</h3>
            <p class="text-sm leading-relaxed line-clamp-2 text-white/60">{{ pick(work.desc) }}</p>
          </div>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup>
const { works, pick } = useSiteContent()
</script>