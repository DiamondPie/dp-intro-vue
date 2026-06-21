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
            <a
              class="rounded-full p-3 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden block"
              style="
                animation: 0.6s ease-out 0.6s 1 normal both running scaleIn;
                background-color: color-mix(rgb(233, 160, 255) 10%, transparent);
              "
              @click.prevent="toggleLocale"
            >
              <div class="relative z-10 text-center flex gap-2 justify-center items-center">
                <div
                  class="text-xl transition-transform duration-300"
                  style="
                    color: color-mix(rgb(233, 160, 255) 80%, white);
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
            </a>

            <a
              href="mailto:diamondpie@dpp.qzz.io"
              class="rounded-full p-3 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden block"
              style="
                animation: 0.6s ease-out 0.7s 1 normal both running scaleIn;
                background-color: color-mix(rgb(234, 67, 53) 10%, transparent);
              "
            >
              <div class="relative z-10 text-center flex gap-2 justify-center items-center">
                <div
                  class="text-xl transition-transform duration-300"
                  style="
                    color: color-mix(rgb(234, 67, 53) 80%, white);
                    filter: drop-shadow(rgba(234, 67, 53, 0.5) 0px 0px 20px);
                  "
                >
                  <Icon
                    name="simple-icons:gmail"
                    width="1em"
                    height="1em"
                  />
                </div>
              </div>
            </a>

            <a
              href="https://github.com/DiamondPie"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-full p-3 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden block"
              style="
                animation: 0.6s ease-out 0.8s 1 normal both running scaleIn;
                background-color: color-mix(rgb(255, 255, 255) 10%, transparent);
              "
            >
              <div class="relative z-10 text-center flex gap-2 justify-center items-center">
                <div
                  class="text-xl transition-transform duration-300"
                  style="
                    color: color-mix(rgb(255, 255, 255) 80%, white);
                    filter: drop-shadow(rgba(255, 255, 255, 0.5) 0px 0px 20px);
                  "
                >
                  <Icon
                    name="simple-icons:github"
                    width="1em"
                    height="1em"
                  />
                </div>
              </div>
            </a>

            <a
              href="https://www.instagram.com/diamond.3.14/"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-full p-3 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden block"
              style="
                animation: 0.6s ease-out 0.9s 1 normal both running scaleIn;
                background-color: color-mix(rgb(246, 30, 157) 10%, transparent);
              "
            >
              <div class="relative z-10 text-center flex gap-2 justify-center items-center">
                <div
                  class="text-xl transition-transform duration-300"
                  style="
                    color: color-mix(rgb(246, 30, 157) 80%, white);
                    filter: drop-shadow(rgba(246, 30, 157, 0.5) 0px 0px 20px);
                  "
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M7.03.084c-1.277.06-2.149.264-2.91.563a5.9 5.9 0 0 0-2.124 1.388a5.9 5.9 0 0 0-1.38 2.127C.321 4.926.12 5.8.064 7.076s-.069 1.688-.063 4.947s.021 3.667.083 4.947c.061 1.277.264 2.149.563 2.911c.308.789.72 1.457 1.388 2.123a5.9 5.9 0 0 0 2.129 1.38c.763.295 1.636.496 2.913.552c1.278.056 1.689.069 4.947.063s3.668-.021 4.947-.082c1.28-.06 2.147-.265 2.91-.563a5.9 5.9 0 0 0 2.123-1.388a5.9 5.9 0 0 0 1.38-2.129c.295-.763.496-1.636.551-2.912c.056-1.28.07-1.69.063-4.948c-.006-3.258-.02-3.667-.081-4.947c-.06-1.28-.264-2.148-.564-2.911a5.9 5.9 0 0 0-1.387-2.123a5.9 5.9 0 0 0-2.128-1.38c-.764-.294-1.636-.496-2.914-.55C15.647.009 15.236-.006 11.977 0S8.31.021 7.03.084m.14 21.693c-1.17-.05-1.805-.245-2.228-.408a3.7 3.7 0 0 1-1.382-.895a3.7 3.7 0 0 1-.9-1.378c-.165-.423-.363-1.058-.417-2.228c-.06-1.264-.072-1.644-.08-4.848c-.006-3.204.006-3.583.061-4.848c.05-1.169.246-1.805.408-2.228c.216-.561.477-.96.895-1.382a3.7 3.7 0 0 1 1.379-.9c.423-.165 1.057-.361 2.227-.417c1.265-.06 1.644-.072 4.848-.08c3.203-.006 3.583.006 4.85.062c1.168.05 1.804.244 2.227.408c.56.216.96.475 1.382.895s.681.817.9 1.378c.165.422.362 1.056.417 2.227c.06 1.265.074 1.645.08 4.848c.005 3.203-.006 3.583-.061 4.848c-.051 1.17-.245 1.805-.408 2.23c-.216.56-.477.96-.896 1.38a3.7 3.7 0 0 1-1.378.9c-.422.165-1.058.362-2.226.418c-1.266.06-1.645.072-4.85.079s-3.582-.006-4.848-.06m9.783-16.192a1.44 1.44 0 1 0 1.437-1.442a1.44 1.44 0 0 0-1.437 1.442M5.839 12.012a6.161 6.161 0 1 0 12.323-.024a6.162 6.162 0 0 0-12.323.024M8 12.008A4 4 0 1 1 12.008 16A4 4 0 0 1 8 12.008"
                    />
                  </svg>
                </div>
              </div>
            </a>

            <a
              href="https://discord.com/users/1125178615122907295"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-full p-3 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden block"
              style="
                animation: 0.6s ease-out 1s 1 normal both running scaleIn;
                background-color: color-mix(rgb(68, 120, 241) 10%, transparent);
              "
            >
              <div class="relative z-10 text-center flex gap-2 justify-center items-center">
                <div
                  class="text-xl transition-transform duration-300"
                  style="
                    color: color-mix(rgb(68, 120, 241) 80%, white);
                    filter: drop-shadow(rgba(68, 120, 241, 0.5) 0px 0px 20px);
                  "
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.3 18.3 0 0 0-5.487 0a13 13 0 0 0-.617-1.25a.08.08 0 0 0-.079-.037A19.7 19.7 0 0 0 3.677 4.37a.1.1 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.08.08 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.08.08 0 0 0 .084-.028a14 14 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13 13 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10 10 0 0 0 .372-.292a.07.07 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.07.07 0 0 1 .078.01q.181.149.373.292a.077.077 0 0 1-.006.127a12.3 12.3 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.08.08 0 0 0 .084.028a19.8 19.8 0 0 0 6.002-3.03a.08.08 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03M8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418m7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418"
                    />
                  </svg>
                </div>
              </div>
            </a>

            <a
              id="show-qrcode"
              class="rounded-full p-3 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden block"
              style="
                animation: 0.6s ease-out 1.1s 1 normal both running scaleIn;
                background-color: color-mix(rgb(78, 175, 79) 10%, transparent);
              "
            >
              <div class="relative z-10 text-center flex gap-2 justify-center items-center">
                <div
                  class="text-xl transition-transform duration-300"
                  style="
                    color: color-mix(rgb(78, 175, 79) 80%, white);
                    filter: drop-shadow(rgba(78, 175, 79, 0.5) 0px 0px 20px);
                  "
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213c0 .163.13.295.29.295a.33.33 0 0 0 .167-.054l1.903-1.114a.86.86 0 0 1 .717-.098a10.2 10.2 0 0 0 2.837.403c.276 0 .543-.027.811-.05c-.857-2.578.157-4.972 1.932-6.446c1.703-1.415 3.882-1.98 5.853-1.838c-.576-3.583-4.196-6.348-8.596-6.348M5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178a1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18m5.34 2.867c-1.797-.052-3.746.512-5.28 1.786c-1.72 1.428-2.687 3.72-1.78 6.22c.942 2.453 3.666 4.229 6.884 4.229c.826 0 1.622-.12 2.361-.336a.72.72 0 0 1 .598.082l1.584.926a.3.3 0 0 0 .14.047c.134 0 .24-.111.24-.247c0-.06-.023-.12-.038-.177l-.327-1.233a.6.6 0 0 1-.023-.156a.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.27-.027-.407-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983a.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983a.976.976 0 0 1-.969-.983c0-.542.434-.982.969-.982"
                    />
                  </svg>
                </div>
              </div>
            </a>

            <a
              href="https://t.me/DiamondPie"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-full p-3 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden block"
              style="
                animation: 0.6s ease-out 1.2s 1 normal both running scaleIn;
                background-color: color-mix(rgb(38, 165, 228) 10%, transparent);
              "
            >
              <div class="relative z-10 text-center flex gap-2 justify-center items-center">
                <div
                  class="text-xl transition-transform duration-300"
                  style="
                    color: color-mix(rgb(38, 165, 228) 80%, white);
                    filter: drop-shadow(rgba(38, 165, 228, 0.5) 0px 0px 20px);
                  "
                >
                  <Icon
                    name="simple-icons:telegram"
                    width="1em"
                    height="1em"
                  />
                </div>
              </div>
            </a>

            <a
              href="https://steamcommunity.com/id/diamondpie114/"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-full p-3 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden block"
              style="
                animation: 0.6s ease-out 1.3s 1 normal both running scaleIn;
                background-color: color-mix(rgb(19, 107, 157) 10%, transparent);
              "
            >
              <div class="relative z-10 text-center flex gap-2 justify-center items-center">
                <div
                  class="text-xl transition-transform duration-300"
                  style="
                    color: color-mix(rgb(19, 107, 157) 80%, white);
                    filter: drop-shadow(rgba(19, 107, 157, 0.5) 0px 0px 20px);
                  "
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658a3.4 3.4 0 0 1 1.912-.59q.094.001.188.006l2.861-4.142V8.91a4.53 4.53 0 0 1 4.524-4.524c2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911l.004.159a3.39 3.39 0 0 1-3.39 3.396a3.41 3.41 0 0 1-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0M7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25a2.551 2.551 0 0 0 3.337-3.324a2.547 2.547 0 0 0-3.255-1.413l1.523.63a1.878 1.878 0 0 1-1.445 3.467zm11.415-9.303a3.02 3.02 0 0 0-3.015-3.015a3.015 3.015 0 1 0 3.015 3.015m-5.273-.005a2.264 2.264 0 1 1 4.531 0a2.267 2.267 0 0 1-2.266 2.265a2.264 2.264 0 0 1-2.265-2.265"
                    />
                  </svg>
                </div>
              </div>
            </a>

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

            <button data-target="friends" class="home group !text-sm lg:!text-base">
              {{ $t('nav.friends') }}<span
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