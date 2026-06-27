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
    <!-- TEST NAV BUTTON: remove after testing -->
    <NuxtLink
      to="/music"
      class="fixed bottom-6 right-6 z-50 px-4 py-2 text-sm font-mono rounded-full border"
      style="background: var(--content-2); border-color: var(--border-color-2); color: var(--text-primary)"
    >Test → /music</NuxtLink>
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

definePageMeta({
  pageTransition: { name: 'page-home', mode: 'out-in' }
})

useIntroEffects()

useHead({
  script: [
    {
      innerHTML: `if(sessionStorage.getItem("killed")==="1"){sessionStorage.removeItem("killed");document.documentElement.style.visibility="hidden";var x=new XMLHttpRequest();x.open("GET","/404.html",false);x.send();var p=new DOMParser().parseFromString(x.responseText,"text/html");p.documentElement.style.visibility="visible";document.documentElement.style.visibility="visible";document.replaceChild(document.importNode(p.documentElement,true),document.documentElement);}`,
      tagPosition: 'head',
      type: 'text/javascript'
    },
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