<script setup lang="ts">
const props = defineProps<{
  analyser: AnalyserNode | null
  isPlaying: boolean
  visible: boolean
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

watch(
  () => props.analyser,
  (a) => { dataArray = a ? new Uint8Array(new ArrayBuffer(a.frequencyBinCount)) : null },
  { immediate: true },
)

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
  const maxH = h * 0.42
  const N = 80

  // --- Audio amplitude (read every frame; naturally decays via smoothingTimeConstant when paused) ---
  const audioAmp = new Array<number>(N).fill(0)
  if (props.analyser && dataArray) {
    props.analyser.getByteFrequencyData(dataArray)
    const usable = Math.floor(dataArray.length * 0.65)
    for (let i = 0; i < N; i++) {
      const bin = Math.floor(Math.pow(i / (N - 1), 1.4) * usable)
      let sum = 0
      for (let j = -2; j <= 2; j++)
        sum += dataArray[Math.min(Math.max(bin + j, 0), dataArray.length - 1)]!
      audioAmp[i] = (sum / 5) / 255
    }
  }

  // --- Idle sine ripple (always computed, blended in when not playing) ---
  const t = ts / 4000
  const idleAmp = new Array<number>(N)
  for (let i = 0; i < N; i++)
    idleAmp[i] = (Math.sin((i / (N - 1)) * Math.PI * 4 + t * Math.PI * 2) * 0.5 + 0.5) * 0.045

  // --- Blend: audio ↔ idle driven by displayFactor ---
  const amp = new Array<number>(N)
  for (let i = 0; i < N; i++)
    amp[i] = audioAmp[i]! * displayFactor + idleAmp[i]! * (1 - displayFactor)

  // Sine-envelope taper so both edges always meet at the centre line
  for (let i = 0; i < N; i++)
    amp[i]! *= Math.sin((i / (N - 1)) * Math.PI)

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

  // --- Filled shape (upper L→R, lower R→L, closed) ---
  ctx.beginPath()
  catmullRomPath(ctx, upper, true)
  catmullRomPath(ctx, lowerRev, false)
  ctx.closePath()

  const grad = ctx.createLinearGradient(0, centerY - maxH, 0, centerY + maxH)
  grad.addColorStop(0, 'rgba(255,255,255,0.06)')
  grad.addColorStop(0.5, 'rgba(255,255,255,0.14)')
  grad.addColorStop(1, 'rgba(255,255,255,0.06)')
  ctx.fillStyle = grad
  ctx.fill()

  // --- Upper curve stroke ---
  ctx.beginPath()
  catmullRomPath(ctx, upper, true)
  ctx.strokeStyle = 'rgba(255,255,255,0.50)'
  ctx.lineWidth = 1.5
  ctx.lineJoin = 'round'
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
