/**
 * Schema validation for the site content object stored in KV (`content:v1`).
 *
 * Plain ESM so it can run both in `scripts/fetch-content.mjs` (plain node at
 * build time) and inside Nitro handlers (Phase B). Deliberately dependency-free.
 *
 * Returns a list of human-readable problems; an empty list means valid.
 */

export const CONTENT_SCHEMA_VERSION = 1
export const CONTENT_KV_KEY = 'content:v1'

const LIST_FIELDS = ['works', 'photos', 'friends', 'commits']
const DETAIL_TYPES = ['new', 'update']

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

/** `{ en, zh }` with both sides present as strings (empty string allowed). */
function isI18nText(value) {
  return isPlainObject(value) && typeof value.en === 'string' && typeof value.zh === 'string'
}

function checkI18n(problems, path, value) {
  if (!isI18nText(value)) problems.push(`${path} must be { en: string, zh: string }`)
}

function checkString(problems, path, value) {
  if (!isNonEmptyString(value)) problems.push(`${path} must be a non-empty string`)
}

function checkArray(problems, path, value) {
  if (!Array.isArray(value)) {
    problems.push(`${path} must be an array`)
    return false
  }
  return true
}

function checkUniqueIds(problems, path, list) {
  const seen = new Set()
  list.forEach((item, i) => {
    if (!isPlainObject(item)) return
    checkString(problems, `${path}[${i}].id`, item.id)
    if (seen.has(item.id)) problems.push(`${path}[${i}].id "${item.id}" is duplicated`)
    seen.add(item.id)
  })
}

function validateWork(problems, path, work) {
  checkString(problems, `${path}.href`, work.href)
  checkString(problems, `${path}.image`, work.image)
  checkI18n(problems, `${path}.title`, work.title)
  checkI18n(problems, `${path}.desc`, work.desc)
}

function validatePhoto(problems, path, photo) {
  checkString(problems, `${path}.src`, photo.src)
  checkI18n(problems, `${path}.caption`, photo.caption)
}

function validateFriend(problems, path, friend) {
  checkString(problems, `${path}.href`, friend.href)
  checkString(problems, `${path}.avatar`, friend.avatar)
  checkString(problems, `${path}.name`, friend.name)
  checkI18n(problems, `${path}.desc`, friend.desc)
}

function validateCommit(problems, path, commit) {
  checkString(problems, `${path}.year`, commit.year)
  checkI18n(problems, `${path}.month`, commit.month)
  checkI18n(problems, `${path}.title`, commit.title)
  checkI18n(problems, `${path}.desc`, commit.desc)

  if (checkArray(problems, `${path}.courses`, commit.courses)) {
    commit.courses.forEach((c, i) => checkI18n(problems, `${path}.courses[${i}]`, c))
  }

  if (checkArray(problems, `${path}.badges`, commit.badges)) {
    commit.badges.forEach((b, i) => {
      if (!isPlainObject(b)) return problems.push(`${path}.badges[${i}] must be an object`)
      checkString(problems, `${path}.badges[${i}].label`, b.label)
      checkString(problems, `${path}.badges[${i}].color`, b.color)
    })
  }

  if (checkArray(problems, `${path}.details`, commit.details)) {
    commit.details.forEach((d, i) => {
      const dp = `${path}.details[${i}]`
      if (!isPlainObject(d)) return problems.push(`${dp} must be an object`)
      checkI18n(problems, `${dp}.label`, d.label)
      if (!DETAIL_TYPES.includes(d.type)) problems.push(`${dp}.type must be one of ${DETAIL_TYPES.join(' | ')}`)
      if (typeof d.defaultOpen !== 'boolean') problems.push(`${dp}.defaultOpen must be a boolean`)
      if (checkArray(problems, `${dp}.items`, d.items)) {
        d.items.forEach((item, j) => checkI18n(problems, `${dp}.items[${j}]`, item))
      }
    })
  }
}

const ITEM_VALIDATORS = {
  works: validateWork,
  photos: validatePhoto,
  friends: validateFriend,
  commits: validateCommit,
}

/**
 * @param {unknown} content
 * @returns {string[]} problems — empty when the object is valid
 */
export function validateContent(content) {
  const problems = []

  if (!isPlainObject(content)) return ['content must be an object']

  if (content.version !== CONTENT_SCHEMA_VERSION) {
    problems.push(`version must be ${CONTENT_SCHEMA_VERSION} (got ${JSON.stringify(content.version)})`)
  }
  if (!Number.isInteger(content.revision) || content.revision < 0) {
    problems.push('revision must be a non-negative integer')
  }

  for (const field of LIST_FIELDS) {
    if (!checkArray(problems, field, content[field])) continue
    checkUniqueIds(problems, field, content[field])
    content[field].forEach((item, i) => {
      if (!isPlainObject(item)) return problems.push(`${field}[${i}] must be an object`)
      ITEM_VALIDATORS[field](problems, `${field}[${i}]`, item)
    })
  }

  return problems
}
