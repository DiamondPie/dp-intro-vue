<script setup lang="ts">
defineProps<{
  cover?: string
}>()
</script>

<template>
  <div
    class="music-bg"
    :style="cover ? { backgroundImage: `url(${cover})` } : {}"
  />
  <div class="music-overlay" />
</template>

<style scoped>
/* Complex filter chain + conic transitions can't be expressed in Tailwind */
.music-bg {
  position: fixed;
  inset: -50px;
  background-size: cover;
  background-position: center;
  filter: blur(60px) brightness(0.55) saturate(1.8);
  z-index: 0;
  transition: background-image 0.8s ease;
}

.music-overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,.12) 0%, rgba(0,0,0,.22) 100%);
  z-index: 1;
  pointer-events: none;
}
</style>
