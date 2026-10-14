// jsDelivr's /gh/ endpoint pulls straight from GitHub, so anything served from
// the DiamondPie account breaks whenever GitHub stops serving it. The
// carbonradian/storage mirror keeps the same paths, so only the repo is swapped.
const PRIMARY = /^https:\/\/cdn\.jsdelivr\.net\/gh\/diamondpie\/storage@/i
const FALLBACK = 'https://cdn.jsdelivr.net/gh/carbonradian/storage@'

function swapToFallback(img) {
  const src = img.getAttribute('src')
  if (!src || !PRIMARY.test(src)) return

  const fallback = src.replace(PRIMARY, FALLBACK)
  // Photos link to their own full-size image, so keep the link in step
  const link = img.closest('a')
  if (link?.getAttribute('href') === src) link.setAttribute('href', fallback)
  img.src = fallback
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive('cdn-fallback', {
    mounted(el) {
      el.addEventListener('error', () => swapToFallback(el))
      // An SSR-rendered image can fail before hydration, when no listener was attached yet
      if (el.complete && el.naturalWidth === 0) swapToFallback(el)
    }
  })
})
