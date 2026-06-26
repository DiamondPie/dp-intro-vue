<template>
  <footer class="relative z-10 py-16 mt-20 footer-gradient">
    <div class="max-w-6xl mx-auto px-6 pb-8 text-center flex flex-col items-center">
      <div
        id="bottom-container"
        class="max-w-[62vw] flex gap-2 flex-wrap justify-center mb-4"
      >
        <a
          v-for="(link, index) in bottomLinks"
          :key="link.label"
          :href="link.href"
          :aria-label="link.label"
          v-bind="link.target ? { target: link.target, rel: 'noopener noreferrer' } : {}"
          class="rounded-full p-3 hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden block"
          :style="`animation: 0.6s ease-out ${index * 0.1}s 1 normal both running scaleIn; background-color: color-mix(in oklab, var(--text-primary), transparent 90%);`"
        >
          <div class="relative z-10 text-center flex gap-2 justify-center items-center">
            <div
              class="text-xl transition-transform duration-300"
              style="
                color: color-mix(in oklab, var(--text-primary), white 20%);
                filter: drop-shadow(0 0 20px var(--text-primary)80);
              "
            >
              <Icon v-if="link.icon" :name="link.icon" width="1em" height="1em" />
              <!-- eslint-disable-next-line vue/no-v-html -- SVGs are static hardcoded strings, not user input -->
              <span v-else v-html="link.svg" />
            </div>
            <h3
              class="text-sm hidden lg:block"
              style="color: color-mix(in oklab, var(--text-primary), white 20%)"
            >
              {{ link.label }}
            </h3>
          </div>
        </a>
      </div>
      <button
        class="flex items-center gap-2 leading-10 px-4 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105"
        style="background: var(--text-primary); color: var(--color-black)"
        @click="openMail"
      >
        {{ $t('footer.get_in_touch') }}<Icon
          name="mingcute:mail-fill"
          class="text-xl"
          width="1em"
          height="1em"
        />
      </button>
    </div>
    <div class="flex mx-6 flex-col items-center">
      <h1 class="w-[75vw] tracking-tighter text-white font-mono font-bold">
        <span class="-ml-4"><img src="/logo.svg" alt="DiamondPie" class="jelly-like" ></span>
        <i18n-t
          keypath="footer.copyright"
          tag="p"
          scope="global"
          class="mt-16 tracking-normal font-normal"
          style="color: var(--text-secondary)"
        >
          <template #llm>
            <span style="text-decoration: line-through">LLMs</span>
          </template>
        </i18n-t>
      </h1>
    </div>
  </footer>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'

function openMail() {
  if (typeof window !== 'undefined' && typeof window.openMailClient === 'function') {
    window.openMailClient()
  }
}

const bottomLinks = [
  {
    label: 'Email',
    href: 'mailto:diamondpie@dpp.qzz.io',
    target: null,
    icon: 'simple-icons:gmail'
  },
  {
    label: 'GitHub',
    href: 'https://github.com/DiamondPie',
    target: '_blank',
    icon: 'simple-icons:github'
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/diamond.3.14/',
    target: '_blank',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M7.03.084c-1.277.06-2.149.264-2.91.563a5.9 5.9 0 0 0-2.124 1.388a5.9 5.9 0 0 0-1.38 2.127C.321 4.926.12 5.8.064 7.076s-.069 1.688-.063 4.947s.021 3.667.083 4.947c.061 1.277.264 2.149.563 2.911c.308.789.72 1.457 1.388 2.123a5.9 5.9 0 0 0 2.129 1.38c.763.295 1.636.496 2.913.552c1.278.056 1.689.069 4.947.063s3.668-.021 4.947-.082c1.28-.06 2.147-.265 2.91-.563a5.9 5.9 0 0 0 2.123-1.388a5.9 5.9 0 0 0 1.38-2.129c.295-.763.496-1.636.551-2.912c.056-1.28.07-1.69.063-4.948c-.006-3.258-.02-3.667-.081-4.947c-.06-1.28-.264-2.148-.564-2.911a5.9 5.9 0 0 0-1.387-2.123a5.9 5.9 0 0 0-2.128-1.38c-.764-.294-1.636-.496-2.914-.55C15.647.009 15.236-.006 11.977 0S8.31.021 7.03.084m.14 21.693c-1.17-.05-1.805-.245-2.228-.408a3.7 3.7 0 0 1-1.382-.895a3.7 3.7 0 0 1-.9-1.378c-.165-.423-.363-1.058-.417-2.228c-.06-1.264-.072-1.644-.08-4.848c-.006-3.204.006-3.583.061-4.848c.05-1.169.246-1.805.408-2.228c.216-.561.477-.96.895-1.382a3.7 3.7 0 0 1 1.379-.9c.423-.165 1.057-.361 2.227-.417c1.265-.06 1.644-.072 4.848-.08c3.203-.006 3.583.006 4.85.062c1.168.05 1.804.244 2.227.408c.56.216.96.475 1.382.895s.681.817.9 1.378c.165.422.362 1.056.417 2.227c.06 1.265.074 1.645.08 4.848c.005 3.203-.006 3.583-.061 4.848c-.051 1.17-.245 1.805-.408 2.23c-.216.56-.477.96-.896 1.38a3.7 3.7 0 0 1-1.378.9c-.422.165-1.058.362-2.226.418c-1.266.06-1.645.072-4.85.079s-3.582-.006-4.848-.06m9.783-16.192a1.44 1.44 0 1 0 1.437-1.442a1.44 1.44 0 0 0-1.437 1.442M5.839 12.012a6.161 6.161 0 1 0 12.323-.024a6.162 6.162 0 0 0-12.323.024M8 12.008A4 4 0 1 1 12.008 16A4 4 0 0 1 8 12.008"/></svg>'
  },
  {
    label: 'Discord',
    href: 'https://discord.com/users/1125178615122907295',
    target: '_blank',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M20.317 4.37a19.8 19.8 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.3 18.3 0 0 0-5.487 0a13 13 0 0 0-.617-1.25a.08.08 0 0 0-.079-.037A19.7 19.7 0 0 0 3.677 4.37a.1.1 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.08.08 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.08.08 0 0 0 .084-.028a14 14 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13 13 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10 10 0 0 0 .372-.292a.07.07 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.07.07 0 0 1 .078.01q.181.149.373.292a.077.077 0 0 1-.006.127a12.3 12.3 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.08.08 0 0 0 .084.028a19.8 19.8 0 0 0 6.002-3.03a.08.08 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.06.06 0 0 0-.031-.03M8.02 15.33c-1.182 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418m7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418"/></svg>'
  },
  {
    label: 'Blog',
    href: 'https://blog.dpp.qzz.io',
    target: '_blank',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12.02 0L1.596 6.02l-.02 12L11.978 24l10.426-6.02l.02-12zm4.828 17.14l-.96.558l-.969-.574V12.99H9.081v4.15l-.96.558l-.969-.574V6.854l.964-.552l.965.563v4.145h5.838V6.86l.965-.552l.964.563z"/></svg>'
  },
  {
    label: 'Telegram',
    href: 'https://t.me/DiamondPie',
    target: '_blank',
    icon: 'simple-icons:telegram'
  },
  {
    label: 'Steam',
    href: 'https://steamcommunity.com/id/diamondpie114/',
    target: '_blank',
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658a3.4 3.4 0 0 1 1.912-.59q.094.001.188.006l2.861-4.142V8.91a4.53 4.53 0 0 1 4.524-4.524c2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911l.004.159a3.39 3.39 0 0 1-3.39 3.396a3.41 3.41 0 0 1-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0M7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25a2.551 2.551 0 0 0 3.337-3.324a2.547 2.547 0 0 0-3.255-1.413l1.523.63a1.878 1.878 0 0 1-1.445 3.467zm11.415-9.303a3.02 3.02 0 0 0-3.015-3.015a3.015 3.015 0 1 0 3.015 3.015m-5.273-.005a2.264 2.264 0 1 1 4.531 0a2.267 2.267 0 0 1-2.266 2.265a2.264 2.264 0 0 1-2.265-2.265"/></svg>'
  },
  {
    label: 'Bilibili',
    href: 'https://space.bilibili.com/3546380782013073',
    target: '_blank',
    icon: 'simple-icons:bilibili'
  }
]

let mousedownHandler = null
let mousemoveHandler = null
let mouseupHandler = null
let touchstartHandler = null
let touchmoveHandler = null
let touchendHandler = null
let rafIdGlobal = null

onMounted(() => {
  const el = document.querySelector('.jelly-like')
  if (!el) return

  // ── 弹簧参数，可调 ──────────────────────────────────────
  const STIFFNESS = 0.12 // 弹簧刚度，越大回弹越快
  const DAMPING = 0.12 // 阻尼，越小抖动次数越多（建议 0.4~0.7）
  const MASS = 1 // 质量，越大越"重"、回弹越慢
  // ────────────────────────────────────────────────────────

  let isDragging = false
  let startX = 0,
    startY = 0

  // 当前位置（跟手时直接设置，松手后由弹簧驱动）
  let posX = 0,
    posY = 0
  // 弹簧速度
  let velX = 0,
    velY = 0

  let rafId = null

  function springStep() {
    // 弹簧力指向原点
    const forceX = -STIFFNESS * posX
    const forceY = -STIFFNESS * posY

    // 加速度 = 力 / 质量
    const ax = forceX / MASS
    const ay = forceY / MASS

    // 速度叠加加速度，再施加阻尼（阻尼只衰减速度，不吞掉位移）
    velX = (velX + ax) * (1 - DAMPING)
    velY = (velY + ay) * (1 - DAMPING)

    // 位置叠加速度
    posX += velX
    posY += velY

    el.style.transform = `translate(${posX}px, ${posY}px)`

    const energy = Math.abs(velX) + Math.abs(velY) + Math.abs(posX) + Math.abs(posY)
    if (energy > 0.15) {
      rafId = requestAnimationFrame(springStep)
      rafIdGlobal = rafId
    } else {
      posX = 0
      posY = 0
      el.style.transform = 'translate(0px, 0px)'
    }
  }

  // ── Mouse ────────────────────────────────────────────────
  mousedownHandler = (e) => {
    e.preventDefault()
    isDragging = true
    el.classList.add('dragging')
    cancelAnimationFrame(rafId)
    velX = 0
    velY = 0
    startX = e.clientX - posX
    startY = e.clientY - posY
  }
  el.addEventListener('mousedown', mousedownHandler)

  mousemoveHandler = (e) => {
    if (!isDragging) return
    posX = e.clientX - startX
    posY = e.clientY - startY
    el.style.transform = `translate(${posX}px, ${posY}px)`
  }
  document.addEventListener('mousemove', mousemoveHandler)

  mouseupHandler = (e) => {
    if (!isDragging) return
    isDragging = false
    el.classList.remove('dragging')

    // 松手瞬间给一点初速度（让回弹更有冲劲）
    velX = (e.clientX - (startX + posX)) * 0.1
    velY = (e.clientY - (startY + posY)) * 0.1

    rafId = requestAnimationFrame(springStep)
    rafIdGlobal = rafId
  }
  document.addEventListener('mouseup', mouseupHandler)

  // ── Touch ────────────────────────────────────────────────
  touchstartHandler = (e) => {
    const t = e.touches[0]
    isDragging = true
    cancelAnimationFrame(rafId)
    velX = 0
    velY = 0
    startX = t.clientX - posX
    startY = t.clientY - posY
  }
  el.addEventListener('touchstart', touchstartHandler, { passive: true })

  touchmoveHandler = (e) => {
    if (!isDragging) return
    const t = e.touches[0]
    posX = t.clientX - startX
    posY = t.clientY - startY
    el.style.transform = `translate(${posX}px, ${posY}px)`
  }
  document.addEventListener('touchmove', touchmoveHandler, { passive: true })

  touchendHandler = () => {
    if (!isDragging) return
    isDragging = false
    rafId = requestAnimationFrame(springStep)
    rafIdGlobal = rafId
  }
  document.addEventListener('touchend', touchendHandler)
})

onBeforeUnmount(() => {
  const el = document.querySelector('.jelly-like')
  if (el && mousedownHandler) el.removeEventListener('mousedown', mousedownHandler)
  if (el && touchstartHandler) el.removeEventListener('touchstart', touchstartHandler)
  if (mousemoveHandler) document.removeEventListener('mousemove', mousemoveHandler)
  if (mouseupHandler) document.removeEventListener('mouseup', mouseupHandler)
  if (touchmoveHandler) document.removeEventListener('touchmove', touchmoveHandler)
  if (touchendHandler) document.removeEventListener('touchend', touchendHandler)
  if (rafIdGlobal !== null) cancelAnimationFrame(rafIdGlobal)
})
</script>

<style scoped>
.jelly-like {
  display: inline-block;
  cursor: pointer;
  user-select: none;
  will-change: transform;
}

.jelly-like.dragging {
  cursor: pointer;
}

.footer-gradient {
  background: 
    radial-gradient(120% 80% at 30% 100%, rgba(255, 20, 147, 0.15), transparent 50%),
    radial-gradient(100% 60% at 70% 90%, rgba(0, 255, 255, 0.12), transparent 60%),
    radial-gradient(90% 70% at 50% 80%, rgba(138, 43, 226, 0.18), transparent 65%),
    radial-gradient(110% 50% at 20% 110%, rgba(255, 215, 0, 0.08), transparent 40%),
    rgba(0, 0, 0, 0.7);
}
</style>