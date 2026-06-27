<script setup lang="ts">
const props = defineProps<{
  analyser: AnalyserNode | null
  isPlaying: boolean
  visible: boolean
  cover: string
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let rafId: number | null = null
let dataArray: Uint8Array<ArrayBuffer> | null = null
let lastW = 0
let lastH = 0
let lastDpr = 0
// Smooth factor: 0 = fully idle, 1 = full audio. Lerps based on isPlaying.
let displayFactor = 0
let lastTs = 0
// Dominant color extracted from the current cover art; falls back to white on CORS failure.
let accentColor: [number, number, number] = [255, 255, 255]

watch(
  () => props.analyser,
  (a) => { dataArray = a ? new Uint8Array(new ArrayBuffer(a.frequencyBinCount)) : null },
  { immediate: true },
)

async function extractColor(url: string) {
  if (!url) { accentColor = [255, 255, 255]; return }
  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
      img.src = url
    })
    const SIZE = 50
    const cvs = document.createElement('canvas')
    cvs.width = SIZE
    cvs.height = SIZE
    const c = cvs.getContext('2d')!
    c.drawImage(img, 0, 0, SIZE, SIZE)
    const { data } = c.getImageData(0, 0, SIZE, SIZE)
    let rSum = 0, gSum = 0, bSum = 0, count = 0
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!, g = data[i + 1]!, b = data[i + 2]!
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const sat = max > 0 ? (max - min) / max : 0
      // Only include colorful, non-dark pixels
      if (sat > 0.15 && max / 255 > 0.25) {
        rSum += r; gSum += g; bSum += b; count++
      }
    }
    accentColor = count > 0
      ? [Math.round(rSum / count), Math.round(gSum / count), Math.round(bSum / count)]
      : [255, 255, 255]
  }
  catch {
    accentColor = [255, 255, 255]
  }
}

watch(() => props.cover, (url) => { extractColor(url) }, { immediate: true })

function syncSize(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): { w: number, h: number } {
  const dpr = window.devicePixelRatio || 1
  const w = canvas.clientWidth
  const h = canvas.clientHeight
  if (w !== lastW || h !== lastH || dpr !== lastDpr) {
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    lastW = w
    lastH = h
    lastDpr = dpr
  }
  return { w, h }
}

// Catmull-Rom spline through points, expressed as cubic bezier segments.
// first=true: moveTo the first point; false: lineTo the first point (continues current path).
function catmullRomPath(
  ctx: CanvasRenderingContext2D,
  pts: { x: number, y: number }[],
  first: boolean,
) {
  if (!pts.length) return
  if (first) ctx.moveTo(pts[0]!.x, pts[0]!.y)
  else ctx.lineTo(pts[0]!.x, pts[0]!.y)

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]!
    const p1 = pts[i]!
    const p2 = pts[i + 1]!
    const p3 = pts[Math.min(pts.length - 1, i + 2)]!

    ctx.bezierCurveTo(
      p1.x + (p2.x - p0.x) / 6,
      p1.y + (p2.y - p0.y) / 6,
      p2.x - (p3.x - p1.x) / 6,
      p2.y - (p3.y - p1.y) / 6,
      p2.x,
      p2.y,
    )
  }
}

// Fades only the outer 12% on each side; middle stays at 1.0 so audio content drives the shape.
function edgeFade(t: number): number {
  const EDGE = 0.12
  const e = t < EDGE ? t / EDGE : t > (1 - EDGE) ? (1 - t) / EDGE : 1
  return e * e * (3 - 2 * e)
}

function frame(ts: number) {
  rafId = requestAnimationFrame(frame)

  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const { w, h } = syncSize(canvas, ctx)
  if (w === 0 || h === 0) return

  // Advance displayFactor: lerp toward target over ~500ms (speed=6/s)
  const dt = lastTs > 0 ? Math.min((ts - lastTs) / 1000, 0.1) : 0.016
  lastTs = ts
  const target = props.isPlaying ? 1 : 0
  displayFactor += (target - displayFactor) * Math.min(6 * dt, 1)

  const centerY = h / 2
  const maxH = h * 0.42 * Math.min(1, w / 1280)
  const N = 80

  // Read FFT data once per frame
  if (props.analyser && dataArray) {
    props.analyser.getByteFrequencyData(dataArray)
  }
  const usable = dataArray ? Math.floor(dataArray.length * 0.65) : 0

  // --- Audio amplitude ---
  const audioAmp = new Array<number>(N).fill(0)
  if (dataArray && usable > 0) {
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1)
      const bin = Math.floor(Math.pow(t, 1.4) * usable)
      let sum = 0
      for (let j = -2; j <= 2; j++)
        sum += dataArray[Math.min(Math.max(bin + j, 0), dataArray.length - 1)]!
      const raw = (sum / 5) / 255
      // Progressive high-freq boost: 1.0 at t=0.3 → 2.2 at t=1.0
      const boost = t > 0.3 ? 1.0 + 1.2 * ((t - 0.3) / 0.7) : 1.0
      audioAmp[i] = Math.min(raw * boost, 1)
    }
  }

  // --- Idle sine ripple (always computed, blended in when not playing) ---
  const tIdle = ts / 4000
  const idleAmp = new Array<number>(N)
  for (let i = 0; i < N; i++)
    idleAmp[i] = (Math.sin((i / (N - 1)) * Math.PI * 4 + tIdle * Math.PI * 2) * 0.5 + 0.5) * 0.045

  // --- Blend: audio ↔ idle driven by displayFactor ---
  const amp = new Array<number>(N)
  for (let i = 0; i < N; i++)
    amp[i] = audioAmp[i]! * displayFactor + idleAmp[i]! * (1 - displayFactor)

  // Edge fade — only outer 12% on each side tapers; audio content shapes the middle freely
  for (let i = 0; i < N; i++)
    amp[i]! *= edgeFade(i / (N - 1))

  // Build upper and lower curve points
  const upper: { x: number, y: number }[] = []
  const lower: { x: number, y: number }[] = []
  for (let i = 0; i < N; i++) {
    const x = (i / (N - 1)) * w
    const dy = amp[i]! * maxH
    upper.push({ x, y: centerY - dy })
    lower.push({ x, y: centerY + dy })
  }
  const lowerRev = [...lower].reverse()

  ctx.clearRect(0, 0, w, h)

  const [r, g, b] = accentColor

  // --- Filled shape ---
  ctx.beginPath()
  catmullRomPath(ctx, upper, true)
  catmullRomPath(ctx, lowerRev, false)
  ctx.closePath()

  const fillGrad = ctx.createLinearGradient(0, centerY - maxH, 0, centerY + maxH)
  fillGrad.addColorStop(0, `rgba(${r},${g},${b},0.05)`)
  fillGrad.addColorStop(0.5, 'rgba(255,255,255,0.13)')
  fillGrad.addColorStop(1, `rgba(${r},${g},${b},0.05)`)
  ctx.fillStyle = fillGrad
  ctx.fill()

  // Horizontal accent-to-white gradient for strokes
  const strokeGrad = ctx.createLinearGradient(0, 0, w, 0)
  strokeGrad.addColorStop(0, `rgba(${r},${g},${b},0)`)
  strokeGrad.addColorStop(0.15, `rgba(${r},${g},${b},0.45)`)
  strokeGrad.addColorStop(0.5, 'rgba(255,255,255,0.55)')
  strokeGrad.addColorStop(0.85, `rgba(${r},${g},${b},0.45)`)
  strokeGrad.addColorStop(1, `rgba(${r},${g},${b},0)`)
  ctx.strokeStyle = strokeGrad
  ctx.lineWidth = 1.5
  ctx.lineJoin = 'round'

  // --- Upper curve stroke ---
  ctx.beginPath()
  catmullRomPath(ctx, upper, true)
  ctx.stroke()

  // --- Lower curve stroke ---
  ctx.beginPath()
  catmullRomPath(ctx, lower, true)
  ctx.stroke()
}

onMounted(() => { rafId = requestAnimationFrame(frame) })
onBeforeUnmount(() => { if (rafId !== null) cancelAnimationFrame(rafId) })
</script>

<template>
  <canvas
    ref="canvasRef"
    class="music-viz"
    :class="{ 'music-viz--hidden': !visible }"
    aria-hidden="true"
  />
</template>

<style scoped>
.music-viz {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  opacity: 0.35;
  transition: opacity 0.5s ease;
}

.music-viz--hidden {
  opacity: 0;
}
</style>
