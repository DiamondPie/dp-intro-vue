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
            class="mb-6 flex gap-2 flex-wrap justify-center lg:justify-start"
          >
            <button
              class="rounded-full p-3 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden block"
              style="
                animation: 0.6s ease-out 0.6s 1 normal both running scaleIn;
                background-color: color-mix(in oklab, rgb(233, 160, 255) 10%, transparent);
              "
              :aria-label="locale === 'en' ? 'Switch to Chinese' : 'Switch to English'"
              @click.prevent="toggleLocale"
            >
              <div class="relative z-10 text-center flex gap-2 justify-center items-center">
                <div
                  class="text-xl transition-transform duration-300"
                  style="
                    color: color-mix(in oklab, rgb(233, 160, 255) 80%, white);
                    filter: drop-shadow(rgba(233, 160, 255, 0.5) 0px 0px 20px);
                  "
                >
                  <ClientOnly>
                    <template #fallback>
                      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48" aria-hidden="true">
                        <rect width="36" height="36" x="6" y="6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" rx="3" />
                      </svg>
                    </template>
                    <!-- English icon — shown when current locale is en -->
                    <svg
                      v-if="locale === 'en'"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      aria-hidden="true"
                      role="img"
                      class="iconify iconify--simple-icons"
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
                    <!-- Chinese icon — shown when current locale is zh -->
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      aria-hidden="true"
                      role="img"
                      class="iconify iconify--simple-icons"
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

            <NuxtLink
              to="/music"
              class="rounded-full p-3 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden block"
              style="animation: 0.6s ease-out 0.7s 1 normal both running scaleIn; background-color: color-mix(in oklab, rgb(6, 182, 212) 10%, transparent);"
              aria-label="Music"
            >
              <div class="relative z-10 text-center flex gap-2 justify-center items-center">
                <div
                  class="text-xl transition-transform duration-300"
                  style="color: color-mix(in oklab, rgb(6, 182, 212) 80%, white); filter: drop-shadow(rgba(6, 182, 212, 0.5) 0px 0px 20px);"
                >
                  <Icon name="mingcute:headphone-fill" width="1em" height="1em" />
                </div>
              </div>
            </NuxtLink>

            <div
              v-for="link in socialLinks"
              :key="link.icon"
              class="relative"
            >
              <!-- WeChat copied tooltip -->
              <div
                v-if="link.id === 'show-qrcode'"
                class="absolute pointer-events-none"
                style="bottom: calc(100% + 6px); left: 0; right: 0; display: flex; justify-content: center;"
              >
                <Transition name="dock-tip">
                  <div v-if="wechatCopied" class="flex flex-col items-center select-none">
                    <div
                      class="px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap"
                      style="background: rgba(255, 255, 255, 0.95); color: #111;"
                    >
                      {{ $t('hero.wechat_copied') }}
                    </div>
                    <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid rgba(255, 255, 255, 0.95);" />
                  </div>
                </Transition>
              </div>

              <component
                :is="link.href ? 'a' : 'button'"
                :id="link.id"
                :href="link.href"
                :target="link.external ? '_blank' : undefined"
                :rel="link.external ? 'noopener noreferrer' : undefined"
                :aria-label="link.ariaLabel"
                class="rounded-full p-3 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden block"
                :style="`animation: 0.6s ease-out ${link.delay} 1 normal both running scaleIn; background-color: color-mix(in oklab, ${link.color} 10%, transparent);`"
                @click="link.id === 'show-qrcode' ? copyWechatId() : undefined"
              >
                <div class="relative z-10 text-center flex gap-2 justify-center items-center">
                  <div
                    class="text-xl transition-transform duration-300"
                    :style="`color: color-mix(in oklab, ${link.color} 80%, white); filter: drop-shadow(${link.shadow} 0px 0px 20px);`"
                  >
                    <Icon :name="link.icon" width="1em" height="1em" />
                  </div>
                </div>
              </component>
            </div>

          </div>

          <div
            class="flex gap-2 lg:gap-4 justify-center lg:justify-start flex-wrap animate-fadeInUp"
            style="animation-delay: 0.85s"
          >
            <button data-target="about" class="home group !text-sm lg:!text-base">
              {{ $t('nav.about') }}<span
                class="inline-block align-middle ml-2 group-hover:translate-x-2 transition-transform"
              >
                <Icon
                  name="mingcute:arrow-right-fill"
                  class="text-lg lg:text-xl -mt-1"
                  width="1em"
                  height="1em"
                />
              </span>
            </button>

            <button data-target="commits" class="home group !text-sm lg:!text-base">
              {{ $t('nav.commits') }}<span
                class="inline-block align-middle ml-2 group-hover:translate-x-2 transition-transform"
              >
                <Icon
                  name="mingcute:arrow-right-fill"
                  class="text-lg lg:text-xl -mt-1"
                  width="1em"
                  height="1em"
                />
              </span>
            </button>

            <button data-target="works" class="home group !text-sm lg:!text-base">
              {{ $t('nav.works') }}<span
                class="inline-block align-middle ml-2 group-hover:translate-x-2 transition-transform"
              >
                <Icon
                  name="mingcute:arrow-right-fill"
                  class="text-lg lg:text-xl -mt-1"
                  width="1em"
                  height="1em"
                />
              </span>
            </button>

            <button
              class="home group !text-sm lg:!text-base"
              style="background: var(--text-primary); color: var(--color-black)"
              @click="openMail"
            >
              {{ $t('hero.get_in_touch') }}<span
                class="inline-block align-middle ml-2 group-hover:scale-125 transition-transform"
              >
                <Icon
                  name="mingcute:mail-fill"
                  class="text-lg lg:text-xl -mt-1"
                  width="1em"
                  height="1em"
                />
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
  },
  {
    id: 'show-qrcode',
    icon: 'simple-icons:wechat',
    color: 'rgb(78, 175, 79)',
    shadow: 'rgba(78, 175, 79, 0.5)',
    delay: '1.2s',
    ariaLabel: 'WeChat QR Code',
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

const wechatCopied = ref(false)

async function copyWechatId() {
  if (typeof navigator === 'undefined' || !navigator.clipboard) return
  await navigator.clipboard.writeText('trydiamondpie')
  wechatCopied.value = true
  setTimeout(() => { wechatCopied.value = false }, 2000)
}

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
</script>

<style scoped>
.dock-tip-enter-active {
  transition: opacity 0.3s ease, transform 0.45s cubic-bezier(0.34, 2.2, 0.64, 1);
}

.dock-tip-leave-active {
  transition: opacity 0.1s ease-in, transform 0.1s ease-in;
}

.dock-tip-enter-from,
.dock-tip-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.6);
}

.dock-tip-enter-to,
.dock-tip-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>