/**
 * One editable list of the content document (works / photos / friends /
 * commits): a writable view onto `siteContent`, drag-to-reorder wired onto the
 * grid element, and add / remove helpers. Each `Editor/Editor*.vue` list
 * component builds on this.
 */

import { useSortable } from '@vueuse/integrations/useSortable'
import { siteContent } from './useSiteContent'

type ListKey = 'works' | 'photos' | 'friends' | 'commits'

export function useEditorList<T extends { id: string }>(key: ListKey) {
  // Writable, not the read-only computed from useSiteContent: given a ref,
  // useSortable copies the array and assigns the reordered copy back through
  // `.value`, which a read-only computed drops silently (DOM moves, data
  // doesn't). Resolving through `siteContent` on every access also survives
  // the document being replaced by load / discard / save while mounted.
  const list = computed<T[]>({
    get: () => siteContent.value[key] as unknown as T[],
    set: (next) => { (siteContent.value as unknown as Record<ListKey, T[]>)[key] = next },
  })

  const grid = ref<HTMLElement | null>(null)
  useSortable(grid, list, {
    handle: '.editor-drag-handle',
    draggable: '.editor-card',
    animation: 150,
    forceFallback: true, // mouse/touch events instead of native DnD: consistent ghost, works on mobile
    ghostClass: 'editor-sortable-ghost',
  })

  function add(item: Omit<T, 'id'>) {
    list.value.push({ id: `${key}-${Date.now().toString(36)}`, ...item } as T)
  }

  function remove(index: number) {
    list.value.splice(index, 1)
  }

  return { list, grid, add, remove }
}
