<template>
  <div id="root">
    <div class="relative w-screen min-h-screen">
      <BackgroundCover />
      <HeadBar />
      <HeroSection />
      <AboutSection />
      <WorksSection />
      <FriendsSection />
      <SiteFooter />
      <BackToTopButton />
    </div>
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