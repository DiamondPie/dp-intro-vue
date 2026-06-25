<template>
  <div id="root">
    <main class="relative w-screen min-h-screen">
      <BackgroundCover />
      <HeadBar />
      <HeroSection />
      <div class="relative z-10 flex items-center justify-center gap-4 px-8 py-14 animate-fadeIn" style="animation-delay: 1.35s">
        <div class="w-12 h-px" style="background: var(--text-secondary); opacity: 0.35" />
        <p class="text-sm text-center" style="color: var(--text-secondary); opacity: 0.55">
          {{ $t('hero.interlude') }}
        </p>
        <div class="w-12 h-px" style="background: var(--text-secondary); opacity: 0.35" />
      </div>
      <AboutSection />
      <WorksSection />
      <FriendsSection />
      <SiteFooter />
      <BackToTopButton />
      <!-- <NavDock /> -->
    </main>
  </div>
</template>

<script setup>
import BackgroundCover from '~/components/BackgroundCover.vue'
import HeadBar from '~/components/HeadBar.vue'
import HeroSection from '~/components/HeroSection.vue'
import AboutSection from '~/components/AboutSection.vue'
import WorksSection from '~/components/WorksSection.vue'
import FriendsSection from '~/components/FriendsSection.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import BackToTopButton from '~/components/BackToTopButton.vue'
import _NavDock from '~/components/NavDock.vue'
import { useIntroEffects } from '~/composables/useIntroEffects.js'

useIntroEffects()

useHead({
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Weirdo DiamondPie',
        'url': 'https://dpp.qzz.io'
      })
    }
  ]
})

useSeoMeta({
  ogSiteName: 'Weirdo DiamondPie'
})
</script>