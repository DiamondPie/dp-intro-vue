/**
 * Site content (works / photos / friends / commits) pulled from Cloudflare KV
 * at build time by `scripts/fetch-content.mjs` and baked into the prerendered
 * page via a static import. Nothing here touches the network at runtime.
 *
 * Bilingual fields are stored as `{ en, zh }`; `pick()` resolves one for the
 * active locale and stays reactive to language switches.
 */
import content from '~/content/content.json'

export function useSiteContent() {
  const { locale } = useI18n()

  /** Resolve an `{ en, zh }` field for the current locale, falling back to `en`. */
  const pick = (field) => {
    if (field == null) return ''
    if (typeof field === 'string') return field
    return field[locale.value] ?? field.en ?? ''
  }

  return {
    works: content.works,
    photos: content.photos,
    friends: content.friends,
    commits: content.commits,
    revision: content.revision,
    pick,
  }
}
