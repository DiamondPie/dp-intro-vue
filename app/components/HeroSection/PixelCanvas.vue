<template>
  <!--
    The pixel-canvas: a monospaced grid that renders an ASCII portrait
    by default and swaps to a QR-code on hover of #show-qrcode (which
    lives in the SocialButtons section, not here).

    `text-size-adjust` properties are kept inline because the CSS
    counterparts in Tailwind don't (yet) cover them. The animated
    transition between portrait and QR is driven via direct DOM
    manipulation in `onMounted`, identical to the original logic.

    UnoCSS conversions:
      `text-[4.5px]` → kept (Tailwind arbitrary).
      `lh-[6px]`     → `leading-[6px]`
      `text-[6px]`   → kept
      `lh-[8px]`     → `leading-[8px]`
      `text-[9px]`   → kept
      `lh-[12px]`    → `leading-[12px]`
      `tracking-0`   → `tracking-normal`
  -->
  <div
    id="pixel-canvas"
    translate="no"
    class="font-mono opacity-0 transition-all transition-ease-in-out text-[4.5px] leading-[6px] sm:text-[6px] sm:leading-[8px] lg:text-[9px] lg:leading-[12px] tracking-normal notranslate"
    style="text-size-adjust: none; -webkit-text-size-adjust: none; opacity: 1; transition: filter 1s ease-out, opacity 0.3s ease; filter: grayscale(1);"
  />
</template>

<script setup>
import { onMounted } from 'vue'
import { sampleDots, qrcodeData } from '~/data/pixelData.js'

onMounted(() => {
  /**
   * 高性能点阵渲染函数
   * @param {HTMLElement} container - 目标容器
   * @param {Array} rawDots - 原始数组数据 [["█", "rgb", n], ["█", "rgb"], ...]
   * @param {number} speed - 每批次之间的延迟时间（毫秒）
   * @param {number} batchSize - 每一轮渲染多少个点（增加此值可大幅提速）
   */
  function renderAndAnimateDotMatrix(container, rawDots, speed = 10, batchSize = 5) {
    container.innerHTML = ''
    const allDotElements = []

    // 1. 数据转换与 DOM 构建 (适配你的混合格式)
    rawDots.forEach((row) => {
      const rowSpan = document.createElement('span')
      row.forEach(([color, count]) => {
        for (let i = 0; i < count; i++) {
          const dotSpan = document.createElement('span')
          dotSpan.style.color = color
          dotSpan.style.visibility = 'hidden'
          dotSpan.innerText = '█'

          rowSpan.appendChild(dotSpan)
          allDotElements.push(dotSpan)
        }
      })
      container.appendChild(rowSpan)
      container.appendChild(document.createElement('br'))
    })

    // 2. 批量显示动画逻辑
    let currentIndex = 0
    const totalDots = allDotElements.length

    function showNextBatch() {
      if (currentIndex < totalDots) {
        // 一次性循环渲染 batchSize 个点
        for (let i = 0; i < batchSize && currentIndex < totalDots; i++) {
          allDotElements[currentIndex].style.visibility = 'visible'
          currentIndex++
        }

        // 只有在还有剩余点时才继续定时器
        setTimeout(showNextBatch, speed)
      } else {
        // 3. 全部完成后修改滤镜
        container.style.filter = 'grayscale(0.25)'
      }
    }

    // 启动动画
    showNextBatch()
  }

  /**
   * 二维码点阵渲染函数（随机像素出现动画）
   *
   * 数据格式：每行是一个数组，每个元素为 [color_or_dash, count]
   *   - color_or_dash: "rgb(r,g,b)" 表示有色方块，"-" 表示空格
   *   - count: 该段重复的字符数（两个相邻 █ 视作一个像素点单位，按 count 拆分为独立像素）
   *
   * @param {HTMLElement} container  - 目标容器元素
   * @param {Array}       qrcodeData - 三维数组数据，格式见上
   * @param {number}      speed      - 每批次之间的延迟（毫秒），默认 20
   * @param {number}      batchSize  - 每批次随机出现的像素数，默认 8
   */
  function renderQRCode(container, qrcodeData, speed = 20, batchSize = 8) {
    container.innerHTML = ''

    // ── 1. 解析数据，构建每一行的像素描述列表 ─────────────────────────────
    // 像素描述：{ rowEl, spans: [spanEl, ...], color }
    // 同一 color+count 段里，每个字符都独立成一个 span（便于按像素随机显示）
    // 空格段直接渲染为不可见占位 span，不参与随机动画

    const allPixels = [] // 所有有色像素的 span 元素（用于随机打乱）

    qrcodeData.forEach((rowData) => {
      const rowSpan = document.createElement('span')
      rowSpan.style.display = 'block'
      rowSpan.style.whiteSpace = 'pre'     // 保留空格宽度

      rowData.forEach(([colorOrDash, count]) => {
        const isSpace = colorOrDash === '-'

        if (isSpace) {
          // 空格：直接显示，不参与动画
          const spaceSpan = document.createElement('span')
          spaceSpan.textContent = '█'.repeat(count)
          spaceSpan.style.color = 'transparent' // 透明占位
          rowSpan.appendChild(spaceSpan)
        } else {
          // 有色像素：每个字符独立 span，初始隐藏
          for (let i = 0; i < count; i++) {
            const pixelSpan = document.createElement('span')
            pixelSpan.textContent = '█'
            pixelSpan.style.color = colorOrDash
            pixelSpan.style.visibility = 'hidden'
            rowSpan.appendChild(pixelSpan)
            allPixels.push(pixelSpan)
          }
        }
      })

      container.appendChild(rowSpan)
    })

    // ── 2. Fisher-Yates 随机打乱像素顺序 ──────────────────────────────────
    for (let i = allPixels.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPixels[i], allPixels[j]] = [allPixels[j], allPixels[i]]
    }

    // ── 3. 批量随机显示动画 ────────────────────────────────────────────────
    let currentIndex = 0
    const totalPixels = allPixels.length

    function showNextBatch() {
      if (currentIndex >= totalPixels) {
        return
      }

      const end = Math.min(currentIndex + batchSize, totalPixels)
      for (let i = currentIndex; i < end; i++) {
        allPixels[i].style.visibility = 'visible'
      }
      currentIndex = end

      setTimeout(showNextBatch, speed)
    }

    showNextBatch()
  }

  /**
   * #show-qrcode 悬浮交互
   *
   * 依赖：
   *   - renderQRCode()               —— 随机像素二维码函数
   *   - sampleDots                   —— 原字符画数据
   *   - qrcode                       —— 二维码数据（来自 qrcode.js）
   *   - #pixel-canvas                —— 唯一渲染容器
   *   - #show-qrcode                 —— 触发悬浮的 <a> 元素
   */
  const initHoverSwap = () => {
    const canvas = document.getElementById('pixel-canvas')
    const trigger = document.getElementById('show-qrcode')

    if (!canvas || !trigger) return

    // ── 状态机 ───────────────────────────────────────────────────────────
    // 'portrait' : 当前显示原字符画
    // 'qrcode'   : 当前显示二维码
    // 'busy'     : 正在过渡中（忽略事件）
    let state = 'portrait'
    let pendingIntent = null // 'portrait' | 'qrcode' | null

    // ── 工具：等待 CSS transition 结束 ───────────────────────────────────
    function waitTransition(el) {
      return new Promise((resolve) => {
        function onEnd(e) {
          if (e.target !== el) return
          el.removeEventListener('transitionend', onEnd)
          resolve()
        }
        el.addEventListener('transitionend', onEnd)
      })
    }

    // ── 渐显：opacity 0 → 1 ──────────────────────────────────────────────
    function fadeIn(el) {
      el.style.opacity = '0'
      void el.offsetHeight   // 强制回流，确保从 0 开始过渡
      el.style.opacity = '1'
      return waitTransition(el)
    }

    // ── 渐隐：opacity 1 → 0 ──────────────────────────────────────────────
    function fadeOut(el) {
      el.style.opacity = '1'
      void el.offsetHeight
      el.style.opacity = '0'
      return waitTransition(el)
    }

    // ── 将原字符画一次性渲染到容器（整体渐显，无逐行动画）────────────────
    function renderPortraitStatic() {
      canvas.innerHTML = ''
      sampleDots.forEach((row) => {
        const rowSpan = document.createElement('span')
        row.forEach(([color, count]) => {
          const s = document.createElement('span')
          s.style.color = color
          s.textContent = '█'.repeat(count)
          rowSpan.appendChild(s)
        })
        canvas.appendChild(rowSpan)
        canvas.appendChild(document.createElement('br'))
      })
    }

    async function showQRCode() {
      if (state === 'busy') { pendingIntent = 'qrcode'; return }
      if (state === 'qrcode') return
      state = 'busy'
      pendingIntent = null

      await fadeOut(canvas)
      canvas.innerHTML = ''
      renderQRCode(canvas, qrcodeData, 12, 32)
      await fadeIn(canvas)

      state = 'qrcode'
      if (pendingIntent === 'portrait') showPortrait()
      pendingIntent = null
    }

    async function showPortrait() {
      if (state === 'busy') { pendingIntent = 'portrait'; return }
      if (state === 'portrait') return
      state = 'busy'
      pendingIntent = null

      await fadeOut(canvas)
      renderPortraitStatic()
      await fadeIn(canvas)

      state = 'portrait'
      if (pendingIntent === 'qrcode') showQRCode()
      pendingIntent = null
    }

    // ── 事件绑定 ──────────────────────────────────────────────────────────
    trigger.addEventListener('mouseenter', showQRCode)
    trigger.addEventListener('mouseleave', showPortrait)
  }

  // ── Boot: render the portrait, then wire the hover-swap. ────────────────
  const targetDiv = document.getElementById('pixel-canvas')
  if (targetDiv) {
    renderAndAnimateDotMatrix(targetDiv, sampleDots, 5, 20)
  }
  initHoverSwap()
})
</script>