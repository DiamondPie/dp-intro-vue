<template>
  <!--
    Top bar that fades in once the user scrolls past the hero (handled
    globally by the scroll plugin via #head-bar, #avatar). The mobile-menu
    open/close logic is local to this component and lives in `onMounted`.

    UnoCSS-only syntaxes converted to Tailwind:
      `!<md:opacity-100`        → `max-md:!opacity-100`
      `!<md:pointer-events-auto`→ `max-md:!pointer-events-auto`
      `transition-[opacity]`    kept (Tailwind supports arbitrary).
      `bg-$content-1`           → `bg-[var(--content-1)]`
      `of-hidden`               → `overflow-hidden`
      `w-inherit h-inherit`     → `w-[inherit] h-[inherit]`
  -->
  <div
    id="head-bar"
    class="fixed top-0 left-0 right-0 z-50 duration-300 transition-[opacity] max-md:!opacity-100 max-md:!pointer-events-auto"
    style="opacity: 0; pointer-events: none;"
  >
    <div class="absolute pointer-events-none w-full h-[140%] grid z-[-1] bg-gradient-to-b from-black/90 to-transparent">
      <span
        class="[grid-area:1/1]"
        style="mask: linear-gradient(0deg, transparent 0%, rgb(0, 0, 0) 80%); backdrop-filter: blur(4px);"
      />
    </div>

    <div class="max-w-6xl mx-auto py-4 px-6">
      <div class="flex items-center justify-between">
        <span class="font-semibold flex items-center">
          <span
            id="avatar"
            class="rounded-full bg-[var(--content-1)] overflow-hidden transition-all duration-300 w-0 h-10 opacity-0 scale-0 mr-0"
          >
            <img
              alt="DiamondPie"
              class="w-[inherit] h-[inherit] transition-opacity duration-500 ease-in-out opacity-100"
              src="https://avatars.githubusercontent.com/u/137748098?v=4&size=100"
            >
          </span>
          DiamondPie
        </span>

        <!-- ── Desktop nav (md+) ─────────────────────────────────────────── -->
        <div class="hidden md:flex items-center gap-4">
          <div class="flex gap-2 items-center bg-white/10 backdrop-blur-[4px] backdrop-brightness-[1.4] rounded-full p-1 border border-[var(--border-color-1)]">
            <div class="flex items-center gap-2">
              <button
                data-target="home"
                class="px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 mix-blend-lighten bg-white/20 text-white"
              >
                {{ $t('nav.home') }}
              </button>
              <div class="w-px h-5 bg-white/10" />
            </div>
            <div class="flex items-center gap-2">
              <button
                data-target="about"
                class="px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 mix-blend-lighten bg-transparent text-white/60 hover:text-white hover:bg-white/10"
              >
                {{ $t('nav.about') }}
              </button>
              <div class="w-px h-5 bg-white/10" />
            </div>
            <div class="flex items-center gap-2">
              <button
                data-target="pathway"
                class="px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 mix-blend-lighten bg-transparent text-white/60 hover:text-white hover:bg-white/10"
              >
                {{ $t('nav.pathway') }}
              </button>
              <div class="w-px h-5 bg-white/10" />
            </div>
            <div class="flex items-center gap-2">
              <button
                data-target="friends"
                class="px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 mix-blend-lighten bg-transparent text-white/60 hover:text-white hover:bg-white/10"
              >
                {{ $t('nav.friends') }}
              </button>
            </div>
          </div>

          <!-- "Get in Touch" — `lh-11` UnoCSS → `leading-[2.75rem]` Tailwind -->
          <button
            class="flex items-center gap-2 leading-[2.75rem] px-4 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105 bg-white text-black"
            @click="openMail"
          >
            {{ $t('hero.get_in_touch') }}
            <Icon
              name="mingcute:mail-fill"
              class="text-xl"
              width="1em"
              height="1em"
            />
          </button>
        </div>

        <!-- ── Mobile right-side controls ───────────────────────────────── -->
        <div class="flex md:hidden items-center gap-2">
          <button
            class="flex items-center gap-1.5 px-3 h-10 rounded-full font-medium text-xs transition-all duration-300 hover:scale-105"
            style="background: var(--text-primary); color: var(--color-black);"
            @click="openMail"
          >
            <span>{{ $t('hero.contact') }}</span>
            <Icon
              name="mingcute:mail-fill"
              class="text-xl"
              width="1em"
              height="1em"
            />
          </button>

          <button
            class="relative z-[11] flex items-center justify-center w-10 h-10 text-white/80 bg-white/10 backdrop-blur-[4px] backdrop-brightness-[1.4] rounded-full p-1 border border-[var(--border-color-1)]"
            aria-label="Open menu"
          >
            <div class="relative w-4 h-4">
              <span
                class="absolute left-0 w-4 h-0.5 bg-current transition-all duration-300 ease-out"
                style="top: 4px; transform: none;"
              />
              <span
                class="absolute left-0 w-4 h-0.5 bg-current transition-all duration-300 ease-out"
                style="top: auto; bottom: 4px; transform: none;"
              />
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Mobile menu sheet ───────────────────────────────────────────── -->
    <div
      id="mobile-menu"
      class="fixed inset-0 z-[10] md:hidden transition-all duration-300 ease-in-out opacity-0 pointer-events-none"
    >
      <div id="mobile-menu-cover" class="absolute inset-0 bg-black/60" />
      <nav id="mobile-nav" class="relative pt-[72px] px-6">
        <button
          data-target="home"
          class="block w-full text-left py-3 text-2xl font-medium transition-all ease-in-out text-[var(--color-magenta)]"
          style="transition-delay: 0ms; transform: translateX(-20px); opacity: 0;"
        >
          {{ $t('nav.home') }}
        </button>
        <button
          data-target="about"
          class="block w-full text-left py-3 text-2xl font-medium transition-all ease-in-out text-white/90 hover:text-white"
          style="transition-delay: 0ms; transform: translateX(-20px); opacity: 0;"
        >
          {{ $t('nav.about') }}
        </button>
        <button
          data-target="pathway"
          class="block w-full text-left py-3 text-2xl font-medium transition-all ease-in-out text-white/90 hover:text-white"
          style="transition-delay: 0ms; transform: translateX(-20px); opacity: 0;"
        >
          {{ $t('nav.pathway') }}
        </button>
        <button
          data-target="friends"
          class="block w-full text-left py-3 text-2xl font-medium transition-all ease-in-out text-white/90 hover:text-white"
          style="transition-delay: 0ms; transform: translateX(-20px); opacity: 0;"
        >
          {{ $t('nav.friends') }}
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

// `openMailClient` is registered globally by the intro plugin so the
// inline-handler call sites elsewhere keep working. The HeadBar uses
// the local helper instead of relying on `window.*`.
const openMail = () => {
  if (typeof window !== 'undefined' && typeof window.openMailClient === 'function') {
    window.openMailClient()
  } else {
    window.location.href = 'mailto:diamondpie@dpp.qzz.io'
  }
}

onMounted(() => {
  /**
   * 移动端菜单全功能逻辑
   * NOTE: kept identical to the original implementation. It depends on
   *       elements rendered by *this* component (#mobile-menu, #mobile-nav,
   *       #mobile-menu-cover, the hamburger button), so it's safe to scope
   *       the listener registration here in onMounted.
   */
  const initMobileMenu = () => {
    const menuBtn =
      document.querySelector('button[aria-label="Open menu"]') ||
      document.querySelector('button[aria-label="Close menu"]')
    const mobileMenu = document.getElementById('mobile-menu')
    const menuCover = document.getElementById('mobile-menu-cover')
    const navButtons = document.querySelectorAll('#mobile-nav button')
    const spans = menuBtn.querySelectorAll('span')

    let isOpen = false

    // 核心逻辑提取：切换菜单状态
    const toggleMenu = (forceClose = false) => {
      // 如果传入 forceClose，则强制关闭，否则取反
      isOpen = forceClose ? false : !isOpen

      if (isOpen) {
        // --- 开启状态 ---
        menuBtn.setAttribute('aria-label', 'Close menu')
        spans[0].style.cssText = 'top: 50%; transform: translateY(-50%) rotate(45deg);'
        spans[1].style.cssText = 'top: 50%; bottom: auto; transform: translateY(-50%) rotate(-45deg);'

        mobileMenu.classList.replace('opacity-0', 'opacity-100')
        mobileMenu.classList.replace('pointer-events-none', 'pointer-events-auto')
        mobileMenu.classList.add('backdrop-blur-[4px]')

        navButtons.forEach((btn, index) => {
          btn.style.transitionDelay = `${index * 50}ms`
          btn.style.transform = 'translateX(0px)'
          btn.style.opacity = '1'
        })
      } else {
        // --- 关闭状态 ---
        menuBtn.setAttribute('aria-label', 'Open menu')
        spans[0].style.cssText = 'top: 4px; transform: none;'
        spans[1].style.cssText = 'top: auto; bottom: 4px; transform: none;'

        mobileMenu.classList.replace('opacity-100', 'opacity-0')
        mobileMenu.classList.replace('pointer-events-auto', 'pointer-events-none')
        mobileMenu.classList.remove('backdrop-blur-[4px]')

        navButtons.forEach((btn) => {
          btn.style.transitionDelay = '0ms'
          btn.style.transform = 'translateX(-20px)'
          btn.style.opacity = '0'
        })
      }
    }

    // 1. 汉堡按钮点击
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation() // 阻止冒泡到遮罩层
      toggleMenu()
    })

    // 2. 点击具体导航按钮后自动关闭
    navButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        // 先跳转（如果绑定了跳转逻辑），再关闭
        toggleMenu(true)
      })
    })

    // 3. 点击菜单背景处自动关闭
    menuCover.addEventListener('click', (e) => {
      // 确保点击的是遮罩层本体，而不是菜单内的内容
      if (e.target === menuCover) {
        toggleMenu(true)
      }
    })
  }

  initMobileMenu()
})
</script>