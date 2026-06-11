// Pre-load pixel data into the module cache before PixelCanvas mounts.
import '~/data/pixelData.js'

// ────────────────────────────────────────────────────────────────────────────
// Cross-cutting client-side behaviour for the intro page.
//
// What lives here (and *why* it's not inside a single component):
//
//   1. ASCII-art gradient banner printed to the developer console on load.
//   2. `initBtnContainerHover`  – the social-button hover tint logic
//      that touches buttons rendered in BOTH the hero (#btn-container)
//      AND the footer (#bottom-container).
//   3. `handleScrollEffects`    – the global scroll listener that drives
//      #cover, #head-bar, #avatar, #top-btn, #side-text, #arrow-down.
//   4. `initScrollSpy`          – ties the nav buttons in the head bar
//      (both desktop and mobile flavours) to the section anchors
//      (#home / #about / #works / #friends), and wires #top-btn’s click.
//
// All initializers are registered against `app:mounted` rather than
// `DOMContentLoaded`. By the time a Nuxt plugin runs, the document
// has usually already fired `DOMContentLoaded`, so we instead wait for
// Vue to finish mounting the component tree — which is when the IDs
// referenced below are guaranteed to exist in the DOM.
//
// The script is faithful to the original — naming, comments and ordering
// are preserved so the diff is auditable line-for-line.
// ────────────────────────────────────────────────────────────────────────────

export default defineNuxtPlugin((nuxtApp) => {
  // ── Expose `openMailClient` globally, since it's referenced from
  //    inline `onclick="openMailClient()"` handlers across the markup. ──
  if (typeof window !== 'undefined') {
    window.openMailClient = function openMailClient() {
      const email = 'diamondpie@dpp.qzz.io'
      window.location.href = `mailto:${email}`
    }
    // The original bundle also re-declared the lazyload options object on
    // window; keeping it for parity even though we no longer ship the
    // vanilla-lazyload library (see HeroSection / WorksSection / ... where
    // the native `loading="lazy"` attribute is used instead).
    window.lazyLoadOptions = {
      threshold: 400,
      cancel_on_exit: false
    }
  }

  const logPluginStatus = (message, { isError = false } = {}) => {
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

  const pluginStartTime = performance.now()

  logPluginStatus('Client plugin initializing...')

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

    // 1. 将字符串按行切分
    const lines = charString.split('\n')
    let fullOutput = ''

    lines.forEach((line) => {
      // 过滤掉可能存在的空行（比如字符串开头结尾的换行）
      if (line.length === 0) return

      const chars = [...line] // 能够正确处理特殊字符或 Emoji
      const rowLength = chars.length

      chars.forEach((char, index) => {
        // 2. 计算当前字符在该行中的渐变比例
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

  printGradientString(art, 'rgb(192, 106, 217)', 'rgb(54, 38, 173)')

  // ── Hover tint on the social pill containers ───────────────────────────
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
    // 获取 DOM 元素
    const cover = document.getElementById('cover')
    const headBar = document.getElementById('head-bar')
    const avatar = document.getElementById('avatar')
    const topBtn = document.getElementById('top-btn')
    const sideText = document.getElementById('side-text')
    const arrowDown = document.getElementById('arrow-down')

    // 获取当前滚动高度
    const scrollTop = window.scrollY || document.documentElement.scrollTop

    let coverOpacity
    // --- 1. 处理 #cover 的 Opacity (370px - 870px) ---
    if (cover) {
      if (scrollTop < 370) {
        coverOpacity = 0
      } else if (scrollTop >= 370 && scrollTop <= 870) {
        // 计算线性插值 (0 到 0.75)
        // 进度 = (当前值 - 最小值) / (最大值 - 最小值)
        const progress = (scrollTop - 370) / (870 - 370)
        // 应用 ease-in-out 缓动函数（可选，此处手动模拟简单平滑）
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
          // 线性插值：500 → 350 对应 opacity → 0
          const progress = (distanceToBottom - 100) / (400 - 100)
          coverOpacity *= progress // 👈 在原有基础上渐隐（更自然）
        }
      }

      cover.style.opacity = coverOpacity.toFixed(3)
    }

    // --- 2. 处理 #head-bar 和 #avatar (590px) ---
    if (headBar && avatar) {
      if (scrollTop > 590) {
        // HeadBar 状态
        headBar.style.opacity = '1'
        headBar.style.pointerEvents = 'auto'
        // Avatar 类名切换
        avatar.classList.replace('w-0', 'w-10')
        avatar.classList.replace('opacity-0', 'opacity-100')
        avatar.classList.replace('scale-0', 'scale-100')
        avatar.classList.replace('mr-0', 'mr-2')
      } else {
        // 恢复初始状态
        headBar.style.opacity = '0'
        headBar.style.pointerEvents = 'none'
        // Avatar 恢复类名
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
    arrowDown.addEventListener('click', function () {
      document.getElementById('about').scrollIntoView()
    })
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

    // --- 2. 修改核心切换逻辑 ---
    const setActiveButton = (id) => {
      navButtons.forEach((btn) => {
        const isTarget = btn.getAttribute('data-target') === id
        // 判断当前按钮是否在手机端菜单内 (#mobile-nav)
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

    // Intersection Observer 配置保持不变
    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -60% 0px',
      threshold: 0
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveButton(entry.target.id)
        }
      })
    }, observerOptions)

    sections.forEach((section) => observer.observe(section))

    // 点击跳转逻辑 (保持不变)
    navButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target')
        const targetEl = document.getElementById(targetId)
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' })
        }
      })
    })

    // 获取返回顶部按钮元素
    const topBtn = document.getElementById('top-btn')

    if (topBtn) {
      topBtn.addEventListener('click', () => {
        // 使用平滑滚动回到顶部
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      })
    }
  }

  // ── Wire scroll listener once (always safe; the handler itself is null-safe) ──
  // 使用 requestAnimationFrame 优化滚动性能
  let ticking = false
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScrollEffects()
        ticking = false
      })
      ticking = true
    }
  })

  // ── Run all DOM-dependent initializers after Vue has mounted the tree. ──
  nuxtApp.hook('app:mounted', () => {
    try {
      initBtnContainerHover()
      handleScrollEffects()
      initScrollSpy()
      logPluginStatus(`Loaded successfully! Cost ${(performance.now() - pluginStartTime).toFixed(1)}ms`)
    } catch (err) {
      logPluginStatus(`Error: ${err.message}`, { isError: true })
      console.error(err.stack)
    }
  })
})