<script setup lang="ts">
interface Track {
  name: string
  artist: string
  url: string
  cover: string
  lrc: string
}

const props = defineProps<{
  tracks: Track[]
  currentIndex: number
  isOpen: boolean
}>()

const emit = defineEmits<{
  select: [index: number]
}>()

const listEl = ref<HTMLElement | null>(null)

watch(() => props.currentIndex, () => {
  setTimeout(() => {
    const list = listEl.value
    if (!list) return
    const active = list.querySelector<HTMLElement>('.is-active')
    if (!active) return
    list.scrollTo({ top: active.offsetTop - list.offsetTop, behavior: 'smooth' })
  }, 200)
}, { flush: 'post' })
</script>

<template>
  <div ref="listEl" class="track-list" :class="{ 'is-open': isOpen }">
    <p v-if="!tracks.length" class="px-6 py-8 text-[0.9rem] text-white/30">
      No tracks loaded
    </p>
    <button
      v-for="(track, i) in tracks"
      :key="i"
      class="track-item"
      :class="{ 'is-active': i === currentIndex }"
      @click="emit('select', i)"
    >
      <span class="track-num">{{ i + 1 }}</span>
      <span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{{ track.name }}</span>
      <span class="track-artist">{{ track.artist }}</span>
    </button>
  </div>
</template>

<style scoped>
.track-list {
  width: 55%;
  overflow-y: auto;
  padding: 0.5rem 1.25rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,.15) transparent;
}

.track-list::-webkit-scrollbar { width: 4px; }
.track-list::-webkit-scrollbar-track { background: transparent; }
.track-list::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,.15);
  border-radius: 2px;
}

.track-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: .45rem 1.5rem;
  gap: 1rem;
  text-align: left;
  background: none;
  border: none;
  color: rgba(255,255,255,.65);
  cursor: pointer;
  font-family: inherit;
  font-size: .9rem;
  border-radius: 8px;
  transition: background .2s ease-in-out, color .2s ease-in-out,
              padding .2s ease-in-out, font-size .2s ease-in-out;
}

.track-item:hover {
  background: rgba(255,255,255,.06);
  color: #fff;
}

.track-item.is-active {
  background: rgba(255,255,255,.14);
  color: #fff;
  font-weight: 600;
  padding: .7rem 1.5rem;
  font-size: .96rem;
}

.track-num {
  width: 1.75rem;
  text-align: right;
  color: rgba(255,255,255,.35);
  flex-shrink: 0;
  font-size: .8rem;
  font-variant-numeric: tabular-nums;
}

.track-item.is-active .track-num {
  color: rgba(255,255,255,.65);
  font-size: .86rem;
}

.track-artist {
  color: rgba(255,255,255,.45);
  font-size: .82rem;
  flex-shrink: 0;
  max-width: 35%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track-item.is-active .track-artist {
  color: rgba(255,255,255,.65);
  font-size: .88rem;
}

@media (max-width: 640px) {
  .track-list {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 82%;
    max-width: 300px;
    z-index: 10;
    background: rgba(15,15,15,.92);
    backdrop-filter: blur(24px);
    padding: 1rem .5rem 5rem;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    border: none;
  }

  .track-list.is-open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0,0,0,.55);
  }

  .track-artist { display: none; }

  .track-item { padding: .45rem .75rem .45rem .25rem; }
  .track-item.is-active { padding: .7rem .75rem .7rem .25rem; }
}
</style>
