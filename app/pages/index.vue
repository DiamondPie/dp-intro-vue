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
      <PathwaySection />
      <FriendsSection />
      <SiteFooter />
      <BackToTopButton />
    </main>
  </div>
</template>

<script setup>
import BackgroundCover from '~/components/BackgroundCover.vue'
import HeadBar from '~/components/HeadBar.vue'
import HeroSection from '~/components/HeroSection.vue'
import AboutSection from '~/components/AboutSection.vue'
import PathwaySection from '~/components/PathwaySection.vue'
import FriendsSection from '~/components/FriendsSection.vue'
import SiteFooter from '~/components/SiteFooter.vue'
import BackToTopButton from '~/components/BackToTopButton.vue'
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