<script setup lang="ts">
const props = defineProps<{
  cover?: string
}>()

const displayedCover = ref<string | undefined>(undefined)
let activeBlobUrl: string | null = null
let abortController: AbortController | null = null

async function applyCover(url: string) {
  // Cancel previous in-flight fetch
  abortController?.abort()
  abortController = new AbortController()
  const { signal } = abortController

  try {
    const res = await fetch(url, { signal })
    const blob = await res.blob()
    if (signal.aborted) return

    const blobUrl = URL.createObjectURL(blob)
    if (activeBlobUrl) URL.revokeObjectURL(activeBlobUrl)
    activeBlobUrl = blobUrl
    displayedCover.value = blobUrl
  }
  catch (e) {
    if ((e as Error).name === 'AbortError') return
    // CORS failure or network error: fall back to original URL
    displayedCover.value = url
  }
  finally {
    abortController = null
  }
}

watch(() => props.cover, (url) => {
  if (url) applyCover(url)
}, { immediate: true })

onUnmounted(() => {
  abortController?.abort()
  if (activeBlobUrl) URL.revokeObjectURL(activeBlobUrl)
})
</script>

<template>
  <div
    class="music-bg"
    :style="displayedCover ? { backgroundImage: `url(${displayedCover})` } : {}"
  />
  <div class="music-overlay" />
</template>

<style scoped>
@keyframes bg-fade-in {
  from { opacity: 0; }
}

.music-bg {
  position: fixed;
  inset: -50px;
  background-color: #1a0f2e;
  background-size: cover;
  background-position: center;
  filter: blur(60px) brightness(0.55) saturate(1.8);
  z-index: 0;
  transition: background-image 0.8s ease;
  animation: bg-fade-in 0.6s 0.2s cubic-bezier(0.1, 0.9, 0.2, 1) backwards;
}

.music-overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,.12) 0%, rgba(0,0,0,.22) 100%);
  z-index: 1;
  pointer-events: none;
  animation: bg-fade-in 0.6s 0.2s cubic-bezier(0.1, 0.9, 0.2, 1) backwards;
}
</style>
