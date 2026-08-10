<template>
  <header
    id="home"
    class="relative min-h-screen flex items-center justify-center px-6 overflow-hidden"
  >
    <div
      id="side-text"
      class="fixed left-3 xl:left-6 top-1/2 -translate-y-1/2 -translate-x-1/2 origin-center rotate-90 text-xl font-bold tracking-widest z-10 whitespace-nowrap duration-300"
      style="opacity: 0.2"
    >
      WHO THE HELL IS DIAMONDPIE
    </div>

    <div class="relative z-10 max-w-6xl mx-auto py-[4.5rem] transition-opacity duration-300">
      <div class="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16">
        <div class="flex-shrink-0">
          <PixelCanvas />
        </div>

        <div class="flex-1 text-center lg:text-left max-w-2xl px-4 lg:px-0">
          <CommandLine />

          <div
            id="btn-container"
            ref="btnContainerRef"
            class="mb-6 flex flex-wrap gap-2 justify-center lg:justify-start"
          >
            <!-- Locale toggle -->
            <button
              class="social-pill rounded-full p-3 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden block"
              style="--btn-color: rgb(233, 160, 255); animation: 0.6s ease-out 0.6s 1 normal both running scaleIn;"
              :aria-label="locale === 'en' ? 'Switch to Chinese' : 'Switch to English'"
              @click.prevent="toggleLocale"
            >
              <div class="relative z-10 flex justify-center items-center">
                <div
                  class="text-xl transition-transform duration-300"
                  style="color: color-mix(in oklab, rgb(233, 160, 255) 80%, white); filter: drop-shadow(rgba(233, 160, 255, 0.5) 0px 0px 20px);"
                >
                  <ClientOnly>
                    <template #fallback>
                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48" aria-hidden="true">
                        <rect width="36" height="36" x="6" y="6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" rx="3" />
                      </svg>
                    </template>
                    <svg
                      v-if="locale === 'en'"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      role="img"
                      width="1em"
                      height="1em"
                      viewBox="0 0 48 48"
                    >
                      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4">
                        <rect width="36" height="36" x="6" y="6" stroke-linejoin="round" rx="3" />
                        <path stroke-linejoin="round" d="M14 18h20v10H14z" />
                        <path d="M24 14v21" />
                      </g>
                    </svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                      role="img"
                      width="1em"
                      height="1em"
                      viewBox="0 0 48 48"
                    >
                      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4">
                        <rect width="36" height="36" x="6" y="6" rx="3" />
                        <path d="M13 31V17h8m-8 7h7.5M13 31h7.5m5.5 0V19m0 12v-6.5a4.5 4.5 0 0 1 4.5-4.5v0a4.5 4.5 0 0 1 4.5 4.5V31" />
                      </g>
                    </svg>
                  </ClientOnly>
                </div>
              </div>
            </button>
            <div v-if="shouldBreakAfter(0)" class="basis-full h-0" aria-hidden="true" />

            <!-- Music -->
            <NuxtLink
              to="/music"
              class="social-pill rounded-full p-3 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden block"
              style="--btn-color: rgb(6, 182, 212); animation: 0.6s ease-out 0.7s 1 normal both running scaleIn;"
              aria-label="Music"
            >
              <div class="relative z-10 flex justify-center items-center">
                <div
                  class="text-xl transition-transform duration-300"
                  style="color: color-mix(in oklab, rgb(6, 182, 212) 80%, white); filter: drop-shadow(rgba(6, 182, 212, 0.5) 0px 0px 20px);"
                >
                  <Icon name="mingcute:headphone-fill" width="1em" height="1em" />
                </div>
              </div>
            </NuxtLink>
            <div v-if="shouldBreakAfter(1)" class="basis-full h-0" aria-hidden="true" />

            <!-- Social links -->
            <template v-for="(link, i) in socialLinks" :key="link.icon">
              <HeroSectionSocialPill v-bind="link" />
              <div v-if="shouldBreakAfter(i + 2)" class="basis-full h-0" aria-hidden="true" />
            </template>
          </div>

          <div
            class="flex gap-2 lg:gap-4 justify-center lg:justify-start flex-wrap animate-fadeInUp"
            style="animation-delay: 0.85s"
          >
            <button data-target="about" class="home group !text-sm lg:!text-base">
              {{ $t('nav.about') }}<span class="inline-block align-middle ml-2 group-hover:translate-x-2 transition-transform">
                <Icon name="mingcute:arrow-right-fill" class="text-lg lg:text-xl -mt-1" width="1em" height="1em" />
              </span>
            </button>

            <button data-target="pathway" class="home group !text-sm lg:!text-base">
              {{ $t('nav.pathway') }}<span class="inline-block align-middle ml-2 group-hover:translate-x-2 transition-transform">
                <Icon name="mingcute:arrow-right-fill" class="text-lg lg:text-xl -mt-1" width="1em" height="1em" />
              </span>
            </button>

            <button data-target="friends" class="home group !text-sm lg:!text-base">
              {{ $t('nav.friends') }}<span class="inline-block align-middle ml-2 group-hover:translate-x-2 transition-transform">
                <Icon name="mingcute:arrow-right-fill" class="text-lg lg:text-xl -mt-1" width="1em" height="1em" />
              </span>
            </button>

            <button
              class="home group !text-sm lg:!text-base"
              style="background: var(--text-primary); color: var(--color-black)"
              @click="openMail"
            >
              {{ $t('hero.get_in_touch') }}<span class="inline-block align-middle ml-2 group-hover:scale-125 transition-transform">
                <Icon name="mingcute:mail-fill" class="text-lg lg:text-xl -mt-1" width="1em" height="1em" />
              </span>
            </button>
          </div>
        </div>
      </div>

      <div
        id="arrow-down"
        class="max-lg:opacity-0 max-lg:pointer-events-none fixed bottom-8 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-300 opacity-60"
      >
        <svg
          class="w-8 h-8 opacity-50 hover:opacity-100 transition-opacity cursor-pointer animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </div>
    </div>

    <TransitionDXTransition :loading="dxTransitionLoading" />
  </header>
</template>

<script setup>
import PixelCanvas from './HeroSection/PixelCanvas.vue'
import CommandLine from './HeroSection/CommandLine.vue'
import TransitionDXTransition from './Transition/DXTransition.vue'

const { locale, setLocale } = useI18n()

const socialLinks = [
  {
    href: 'mailto:diamondpie@dpp.qzz.io',
    icon: 'simple-icons:gmail',
    color: 'rgb(234, 67, 53)',
    shadow: 'rgba(234, 67, 53, 0.5)',
    delay: '0.8s',
    ariaLabel: 'Email',
  },
  {
    href: 'https://github.com/DiamondPie',
    icon: 'simple-icons:github',
    color: 'rgb(255, 255, 255)',
    shadow: 'rgba(255, 255, 255, 0.5)',
    delay: '0.9s',
    external: true,
    ariaLabel: 'GitHub',
  },
  {
    href: 'https://www.instagram.com/diamond.3.14/',
    icon: 'simple-icons:instagram',
    color: 'rgb(246, 30, 157)',
    shadow: 'rgba(246, 30, 157, 0.5)',
    delay: '1s',
    external: true,
    ariaLabel: 'Instagram',
  },
  {
    href: 'https://discord.com/users/1125178615122907295',
    icon: 'simple-icons:discord',
    color: 'rgb(68, 120, 241)',
    shadow: 'rgba(68, 120, 241, 0.5)',
    delay: '1.1s',
    external: true,
    ariaLabel: 'Discord',
    hoverAction: 'hero.discord_hover',
    copyUsername: 'trydiamondpie',
  },
  {
    id: 'show-qrcode',
    icon: 'simple-icons:wechat',
    color: 'rgb(78, 175, 79)',
    shadow: 'rgba(78, 175, 79, 0.5)',
    delay: '1.2s',
    ariaLabel: 'WeChat',
    hoverAction: 'hero.wechat_hover',
    copyUsername: 'trydiamondpie',
    copiedKey: 'hero.wechat_copied',
  },
  {
    href: 'https://t.me/DiamondPie',
    icon: 'simple-icons:telegram',
    color: 'rgb(38, 165, 228)',
    shadow: 'rgba(38, 165, 228, 0.5)',
    delay: '1.3s',
    external: true,
    ariaLabel: 'Telegram',
  },
  {
    href: 'https://steamcommunity.com/id/trydiamondpie/',
    icon: 'simple-icons:steam',
    color: 'rgb(19, 107, 157)',
    shadow: 'rgba(19, 107, 157, 0.5)',
    delay: '1.4s',
    external: true,
    ariaLabel: 'Steam',
  },
]

const dxTransitionLoading = ref(false)

function toggleLocale() {
  if (dxTransitionLoading.value) return
  const next = locale.value === 'zh' ? 'en' : 'zh'
  dxTransitionLoading.value = true
  setTimeout(() => {
    document.cookie = `i18n_redirected=${next};path=/;max-age=31536000;SameSite=Lax`
    setLocale(next)
  }, 400)
  setTimeout(() => { dxTransitionLoading.value = false }, 1200)
}

function openMail() {
  if (typeof window !== 'undefined' && typeof window.openMailClient === 'function') {
    window.openMailClient()
  }
}

// Balance #btn-container wrapping so a broken row splits into equal halves
// (or top row +1) instead of dumping most buttons on row one and a few on row two.
// A forced `basis-full` break element is injected at the balanced split point so
// flexbox's per-line justify-content still centers each row independently
// (unlike CSS grid, where a short last row hugs one side).
const btnContainerRef = ref(null)
const btnBreakColumns = ref(null)
const totalButtons = computed(() => 2 + socialLinks.length)
let btnResizeObserver = null
let btnRecalcRaf = null

function recalcBtnLayout() {
  const el = btnContainerRef.value
  const firstItem = el?.children[0]
  if (!firstItem) return

  const total = totalButtons.value
  const itemWidth = firstItem.getBoundingClientRect().width
  const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0
  const containerWidth = el.clientWidth
  if (!itemWidth || !containerWidth) return

  const maxPerRow = Math.max(1, Math.floor((containerWidth + gap) / (itemWidth + gap)))

  if (maxPerRow >= total) {
    btnBreakColumns.value = null
    return
  }

  const rows = Math.ceil(total / maxPerRow)
  btnBreakColumns.value = Math.ceil(total / rows)
}

function shouldBreakAfter(index) {
  const cols = btnBreakColumns.value
  if (!cols) return false
  const position = index + 1
  return position % cols === 0 && position < totalButtons.value
}

function scheduleBtnRecalc() {
  if (btnRecalcRaf) cancelAnimationFrame(btnRecalcRaf)
  btnRecalcRaf = requestAnimationFrame(recalcBtnLayout)
}

onMounted(() => {
  nextTick(() => {
    recalcBtnLayout()
    if (btnContainerRef.value && typeof ResizeObserver !== 'undefined') {
      btnResizeObserver = new ResizeObserver(scheduleBtnRecalc)
      btnResizeObserver.observe(btnContainerRef.value)
    }
  })
})

onBeforeUnmount(() => {
  if (btnResizeObserver) btnResizeObserver.disconnect()
  if (btnRecalcRaf) cancelAnimationFrame(btnRecalcRaf)
})
</script>
