/**
 * Site content (works / photos / friends / commits) pulled from Cloudflare KV
 * at build time by `scripts/fetch-content.mjs` and baked into the prerendered
 * page via a static import. Nothing here touches the network at runtime.
 *
 * The document sits in a module-level ref (not `useState`) so it never gets
 * serialised into the Nuxt payload — the prerendered HTML already carries it.
 * The in-page editor (`useEditor`) swaps in the live KV document and edits it
 * in place; the site itself only ever reads.
 *
 * Bilingual fields are stored as `{ en, zh }`; `pick()` resolves one for the
 * active locale and stays reactive to language switches.
 */
import bakedContent from '~/content/content.json'

/** Deep-cloned so editor mutations never touch the imported module object. */
export const siteContent = ref(structuredClone(bakedContent))

export function useSiteContent() {
  const { locale } = useI18n()

  /** Resolve an `{ en, zh }` field for the current locale, falling back to `en`. */
  const pick = (field) => {
    if (field == null) return ''
    if (typeof field === 'string') return field
    return field[locale.value] ?? field.en ?? ''
  }

  return {
    works: computed(() => siteContent.value.works),
    photos: computed(() => siteContent.value.photos),
    friends: computed(() => siteContent.value.friends),
    commits: computed(() => siteContent.value.commits),
    revision: computed(() => siteContent.value.revision),
    pick,
  }
}
