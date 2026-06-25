// Pre-load pixel data into the module cache before PixelCanvas mounts.
import '~/data/pixelData.js'

import { onMounted, onUnmounted } from 'vue'

export function useIntroEffects() {
  let scrollRafTicking = false
  let scrollListener = null
  let sectionObserver = null

  const { locale, setLocale } = useI18n()

  // ── Console status badge ───────────────────────────────────────────────────
  const logStatus = (message, { isError = false } = {}) => {
    const rootStyles = getComputedStyle(document.documentElement)
    const accentColor = isError
      ? '#ef4444'
      : (rootStyles.getPropertyValue('--accent-tertiary').trim() || '#a78bfa')

    const getRgba = (hex) => {
      const cleanHex = hex.replace('#', '')
      const r = parseInt(cleanHex.substring(0, 2), 16)
      const g = parseInt(cleanHex.substring(2, 4), 16)
      const b = parseInt(cleanHex.substring(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, 0.15)`
    }

    const rightBg = getRgba(accentColor)

    console.log(
      `%cdp.Intro %c ${message} `,
      `color: white; font-weight: bold; border-radius: 3px 0 0 3px; padding: 2px 4px 1px 10px; background: ${accentColor}`,
      `color: white; border-radius: 0 3px 3px 0; padding: 2px 10px 1px 4px; background: ${rightBg}`,
      ''
    )
  }

  /**
   * 使用多行字符串并在控制台打印渐变色
   * @param {string} charString - 多行字符串
   * @param {string} startColor - 起始颜色 (rgb)
   * @param {string} endColor - 结束颜色 (rgb)
   */
  function printGradientString(charString, startColor, endColor) {
    const parseRGB = (str) => str.match(/\d+/g).map(Number)
    const s = parseRGB(startColor)
    const e = parseRGB(endColor)

    const lines = charString.split('\n')
    let fullOutput = ''

    lines.forEach((line) => {
      if (line.length === 0) return

      const chars = [...line]
      const rowLength = chars.length

      chars.forEach((char, index) => {
        const ratio = rowLength > 1 ? index / (rowLength - 1) : 0

        const r = Math.round(s[0] + (e[0] - s[0]) * ratio)
        const g = Math.round(s[1] + (e[1] - s[1]) * ratio)
        const b = Math.round(s[2] + (e[2] - s[2]) * ratio)

        fullOutput += `\x1b[38;2;${r};${g};${b}m${char}`
      })

      fullOutput += '\x1b[0m\n'
    })

    console.log(fullOutput)
  }

  const art = String.raw`


██████╗ ██╗ █████╗ ███╗   ███╗ ██████╗ ███╗   ██╗██████╗ ██████╗ ██╗███████╗
██╔══██╗██║██╔══██╗████╗ ████║██╔═══██╗████╗  ██║██╔══██╗██╔══██╗██║██╔════╝
██║  ██║██║███████║██╔████╔██║██║   ██║██╔██╗ ██║██║  ██║██████╔╝██║█████╗
██║  ██║██║██╔══██║██║╚██╔╝██║██║   ██║██║╚██╗██║██║  ██║██╔═══╝ ██║██╔══╝
██████╔╝██║██║  ██║██║ ╚═╝ ██║╚██████╔╝██║ ╚████║██████╔╝██║     ██║███████╗
╚═════╝ ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═════╝ ╚═╝     ╚═╝╚══════╝

© 2026 DiamondPie. Crafted with passion, code and Claude Opus 4.8.

`

  // ── Hover tint on the social pill containers ───────────────────────────────
  const initBtnContainerHover = () => {
    const container = document.getElementById('btn-container')
    const bottomContainer = document.getElementById('bottom-container')
    if (!container || !bottomContainer) return

    const btnLinks = container.querySelectorAll('a')

    btnLinks.forEach((link) => {
      const originalStyle = link.style.backgroundColor

      if (originalStyle) {
        link.addEventListener('mouseenter', () => {
          link.style.backgroundColor = originalStyle.replace('10%', '20%')
        })

        link.addEventListener('mouseleave', () => {
          link.style.backgroundColor = originalStyle
        })
      }
    })

    const bottomLinks = bottomContainer.querySelectorAll('a')

    bottomLinks.forEach((link) => {
      const originalStyle = link.style.backgroundColor

      if (originalStyle) {
        link.addEventListener('mouseenter', () => {
          link.style.backgroundColor = originalStyle.replace('90%', '80%')
        })

        link.addEventListener('mouseleave', () => {
          link.style.backgroundColor = originalStyle
        })
      }
    })
  }

  /**
   * 处理页面滚动交互逻辑
   */
  const handleScrollEffects = () => {
    const cover = document.getElementById('cover')
    const headBar = document.getElementById('head-bar')
    const avatar = document.getElementById('avatar')
    const topBtn = document.getElementById('top-btn')
    const sideText = document.getElementById('side-text')
    const arrowDown = document.getElementById('arrow-down')

    const scrollTop = window.scrollY || document.documentElement.scrollTop

    let coverOpacity
    // --- 1. 处理 #cover 的 Opacity (370px - 870px) ---
    if (cover) {
      if (scrollTop < 370) {
        coverOpacity = 0
      } else if (scrollTop >= 370 && scrollTop <= 870) {
        const progress = (scrollTop - 370) / (870 - 370)
        const easedProgress = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2

        coverOpacity = easedProgress * 0.75
      } else {
        coverOpacity = 0.85
      }

      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const distanceToBottom = documentHeight - (scrollTop + windowHeight)

      if (distanceToBottom <= 400) {
        if (distanceToBottom <= 100) {
          coverOpacity = 0
        } else {
          const progress = (distanceToBottom - 100) / (400 - 100)
          coverOpacity *= progress
        }
      }

      cover.style.opacity = coverOpacity.toFixed(3)
    }

    // --- 2. 处理 #head-bar 和 #avatar (590px) ---
    if (headBar && avatar) {
      if (scrollTop > 590) {
        headBar.style.opacity = '1'
        headBar.style.pointerEvents = 'auto'
        avatar.classList.replace('w-0', 'w-10')
        avatar.classList.replace('opacity-0', 'opacity-100')
        avatar.classList.replace('scale-0', 'scale-100')
        avatar.classList.replace('mr-0', 'mr-2')
      } else {
        headBar.style.opacity = '0'
        headBar.style.pointerEvents = 'none'
        avatar.classList.replace('w-10', 'w-0')
        avatar.classList.replace('opacity-100', 'opacity-0')
        avatar.classList.replace('scale-100', 'scale-0')
        avatar.classList.replace('mr-2', 'mr-0')
      }
    }

    // --- 3. 处理 #top-btn (300px) ---
    if (topBtn) {
      if (scrollTop > 300) {
        topBtn.classList.replace('opacity-0', 'opacity-100')
        topBtn.classList.replace('translate-y-10', 'translate-y-0')
        topBtn.classList.remove('pointer-events-none')
      } else {
        topBtn.classList.replace('opacity-100', 'opacity-0')
        topBtn.classList.replace('translate-y-0', 'translate-y-10')
        topBtn.classList.add('pointer-events-none')
      }
    }

    if (sideText) {
      if (scrollTop > 0) {
        sideText.style.opacity = 0
      } else {
        sideText.style.opacity = 0.2
      }
    }

    if (arrowDown) {
      if (scrollTop > 0) {
        arrowDown.classList.remove('opacity-60')
        arrowDown.classList.add('opacity-0', 'pointer-events-none')
      } else {
        arrowDown.classList.remove('opacity-0', 'pointer-events-none')
        arrowDown.classList.add('opacity-60')
      }
    }
  }

  const initScrollSpy = () => {
    // --- 1. 定义两套样式常量 ---
    // 电脑端样式 (Desktop)
    const desktopActive = ['bg-white/20', 'text-white']
    const desktopInactive = ['bg-transparent', 'text-white/60', 'hover:text-white', 'hover:bg-white/10']

    // 手机端样式 (Mobile Nav)
    const mobileActive = ['text-[var(--color-cyan)]']
    const mobileInactive = ['text-white/90', 'hover:text-white']

    const navButtons = document.querySelectorAll('button[data-target]')

    const sections = Array.from(navButtons).map((btn) =>
      document.getElementById(btn.getAttribute('data-target'))
    ).filter((el) => el !== null)

    // --- 2. 核心切换逻辑 ---
    const setActiveButton = (id) => {
      navButtons.forEach((btn) => {
        const isTarget = btn.getAttribute('data-target') === id
        const isMobileBtn = btn.closest('#mobile-nav') !== null

        const activeClasses = isMobileBtn ? mobileActive : desktopActive
        const inactiveClasses = isMobileBtn ? mobileInactive : desktopInactive

        if (isTarget) {
          btn.classList.add(...activeClasses)
          btn.classList.remove(...inactiveClasses)
        } else {
          btn.classList.remove(...activeClasses)
          btn.classList.add(...inactiveClasses)
        }
      })
    }

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    }

    sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveButton(entry.target.id)
        }
      })
    }, observerOptions)

    sections.forEach((section) => sectionObserver.observe(section))

    navButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target')
        const targetEl = document.getElementById(targetId)
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' })
        }
      })
    })

    const topBtn = document.getElementById('top-btn')
    if (topBtn) {
      topBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }

    const arrowDown = document.getElementById('arrow-down')
    if (arrowDown) {
      arrowDown.addEventListener('click', () => {
        document.getElementById('about').scrollIntoView()
      })
    }
  }

  onMounted(() => {
    const startTime = performance.now()

    // ── Expose `openMailClient` globally for inline onclick handlers ──
    window.openMailClient = function openMailClient() {
      const email = 'diamondpie@dpp.qzz.io'
      window.location.href = `mailto:${email}`
    }
    window.lazyLoadOptions = {
      threshold: 400,
      cancel_on_exit: false
    }

    logStatus('Initializing...')
    printGradientString(art, 'rgb(192, 106, 217)', 'rgb(54, 38, 173)')

    // ── Wire RAF-throttled scroll listener ──
    scrollListener = () => {
      if (!scrollRafTicking) {
        window.requestAnimationFrame(() => {
          handleScrollEffects()
          scrollRafTicking = false
        })
        scrollRafTicking = true
      }
    }
    window.addEventListener('scroll', scrollListener)

    try {
      initBtnContainerHover()
      handleScrollEffects()
      initScrollSpy()
      logStatus(`Loaded successfully! Cost ${(performance.now() - startTime).toFixed(1)}ms`)
    } catch (err) {
      logStatus(`Error: ${err.message}`, { isError: true })
      console.error(err.stack)
    }

    const savedLocale = document.cookie.match(/i18n_redirected=([^;]+)/)?.[1]
    if (savedLocale && savedLocale !== locale.value) {
      setLocale(savedLocale)
    }
  })

  onUnmounted(() => {
    if (scrollListener) {
      window.removeEventListener('scroll', scrollListener)
      scrollListener = null
    }
    if (sectionObserver) {
      sectionObserver.disconnect()
      sectionObserver = null
    }
  })
}
