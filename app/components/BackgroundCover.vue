<template>
  <!--
    Fixed full-screen tinted backdrop. Its `opacity` is animated by the
    global `intro.client.js` plugin (#cover branch of `handleScrollEffects`)
    based on scroll progress. The starting opacity is 0 to match the
    original stylesheet declaration `opacity:0`.
  -->
  <div
    id="cover"
    class="fixed w-full inset-0 pointer-events-none z-0"
    :style="coverStyle"
  />
</template>

<script setup>
// Heavy `radial-gradient` styling kept verbatim from the original
// inline `style` attribute so the visual output matches pixel-for-pixel.
const coverStyle = {
  backgroundColor: 'rgb(0,0,0)',
  backgroundImage:
    'radial-gradient(125% 125% at 50% 100%, rgb(0,0,0) 20%, oklch(0.73 0.14 321.34/0.4) 100%)',
  opacity: 0,
  willChange: 'opacity',
  transform: 'translateZ(0px)',
  transition: 'opacity 0.1s linear'
}
</script>