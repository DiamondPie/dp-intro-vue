<script setup lang="ts">
interface CommitDetail {
  label: string
  type: string
  defaultOpen: boolean
  items: string[]
}

interface CommitEntry {
  year: string
  month: string
  title: string
  desc: string
  courses: string[]
  badges: { label: string; color: string }[]
  details: CommitDetail[]
}

const { tm, rt, t } = useI18n()

const metVisitor = ref<{ name: string; date: Date } | null>(null)

const entries = computed<CommitEntry[]>(() => {
  const base = (tm('commits.entries') as Record<string, unknown>[]).map(e => ({
    year:    rt(e.year   as string),
    month:   rt(e.month  as string),
    title:   rt(e.title  as string),
    desc:    rt(e.desc   as string),
    courses: (e.courses as string[]).map(c => rt(c)),
    badges:  (e.badges  as { label: string; color: string }[]).map(b => ({ label: rt(b.label), color: rt(b.color) })),
    details: (e.details as Record<string, unknown>[]).map(d => ({
      label:       rt(d.label as string),
      type:        rt(d.type  as string),
      defaultOpen: d.defaultOpen as boolean,
      items:       (d.items as string[]).map(i => rt(i)),
    })),
  }))

  if (!metVisitor.value) return base

  const { name, date } = metVisitor.value
  const metEntry: CommitEntry = {
    year:    String(date.getFullYear()),
    month:   date.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
    title:   t('commits.met_entry.title', { name }),
    desc:    t('commits.met_entry.desc'),
    courses: [],
    badges:  [],
    details: [],
  }

  return [metEntry, ...base]
})

const NAME_PLACEHOLDER = '(your name)'
const visitorName = ref('')
const showEnterHint = computed(() => visitorName.value.trim().length > 0)

function submitCommitName() {
  const name = visitorName.value.trim()
  if (!name) return

  if (metVisitor.value) {
    metVisitor.value.name = name
  } else {
    metVisitor.value = { name, date: new Date() }
  }

  const body = `Hi DiamondPie,\n\nThis is ${name}, ...\n\nBest regards,\n\n${name}`
  window.location.href = `mailto:diamondpie@dpp.qzz.io?subject=Friend Request&body=${encodeURIComponent(body)}`
}
</script>

<template>
  <div class="animate-fadeIn">
    <h3 class="lg:text-xl text-lg mb-6 flex items-center gap-2 font-semibold uppercase" style="color: var(--text-secondary)">
      <Icon name="mdi:source-commit" class="shrink-0 text-xl" />
      {{ $t('pathway.commits_title') }}
    </h3>
    <p class="commit-tagline font-mono text-sm mb-8">
      <span class="syn-cmd">&gt; git</span>
      <span class="syn-sub"> commit</span>
      <span class="syn-flag">&nbsp;{{ metVisitor ? '--amend -m' : '-m' }}</span>
      <span class="syn-str"> "build: met </span>
      <UtilsInlineTerminalInput
        v-model="visitorName"
        class="commit-name-input syn-str font-mono text-sm"
        :placeholder="NAME_PLACEHOLDER"
        aria-label="Your name"
        @enter="submitCommitName"
      />
      <span class="syn-str">"</span>
      <Transition name="commit-enter-hint">
        <span v-if="showEnterHint" class="commit-enter-hint inline-enter-hint">↵</span>
      </Transition>
    </p>

    <div class="flex flex-col items-start w-full">

      <div
        v-for="(entry, index) in entries"
        :key="`${entry.year}-${entry.month}-${index}`"
        class="relative flex w-full justify-end gap-2"
      >
        <!-- Left column (desktop) -->
        <div class="sticky top-[4.75rem] hidden w-36 flex-col items-end gap-2 self-start pb-4 md:flex">
          <span class="timeline-badge">{{ entry.year }}</span>
          <div class="text-right text-sm font-medium" style="color: var(--text-secondary)">{{ entry.month }}</div>
        </div>

        <!-- Timeline dot + line -->
        <div class="flex flex-col items-center">
          <div class="sticky top-[4.75rem] flex size-6 items-center justify-center">
            <span class="timeline-dot-outer flex size-[1.125rem] shrink-0 items-center justify-center rounded-full">
              <span class="timeline-dot-inner size-3 rounded-full" />
            </span>
          </div>
          <span class="timeline-line -mt-2.5 w-px flex-1" />
        </div>

        <!-- Content -->
        <div class="flex flex-1 flex-col gap-4 pb-11 pl-3 md:pl-6 lg:pl-9">
          <!-- Mobile year/month -->
          <div class="flex flex-col gap-2 md:hidden">
            <span class="timeline-badge self-start">{{ entry.year }}</span>
            <div class="font-medium">{{ entry.month }}</div>
          </div>

          <div class="space-y-4">
            <div class="space-y-3">
              <h3 class="flex items-center gap-2 text-xl font-semibold">
                <Icon name="mdi:tag-outline" class="shrink-0 text-lg" />
                {{ entry.title }}
              </h3>
              <p class="text-sm" style="color: var(--text-secondary)">{{ entry.desc }}</p>
            </div>

            <ul v-if="entry.courses?.length" class="ml-2 list-inside list-disc space-y-3 text-sm" style="color: var(--text-secondary)">
              <li v-for="course in entry.courses" :key="String(course)">{{ course }}</li>
            </ul>

            <div v-if="entry.badges?.length">
              <PathwaySectionBadge
                v-for="badge in entry.badges"
                :key="String(badge.label)"
                :color="String(badge.color)"
                class="mr-1"
              >{{ badge.label }}</PathwaySectionBadge>
            </div>

            <div v-if="entry.details?.length" class="-mt-2 space-y-0">
              <PathwaySectionDetails
                v-for="detail in entry.details"
                :key="String(detail.label)"
                :label="String(detail.label)"
                :type="String(detail.type)"
                :default-open="Boolean(detail.defaultOpen)"
              >
                <ul class="list-inside list-disc space-y-3 pb-4 pl-2 pt-1 text-sm" style="color: var(--text-secondary)">
                  <li v-for="item in detail.items" :key="String(item)">{{ item }}</li>
                </ul>
              </PathwaySectionDetails>
            </div>
          </div>
        </div>
      </div>

  </div>
</div>
</template>

<style scoped>
/* ── Version / label badge (left column & mobile) ──────────────────────────── */
.timeline-badge {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  height: 1.5rem;
  padding: 0 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  background: color-mix(in oklab, var(--accent-primary), transparent 85%);
  color: var(--accent-primary);
  white-space: nowrap;
}

/* ── Timeline dot ──────────────────────────────────────────────────────────── */
.timeline-dot-outer {
  background: color-mix(in oklab, var(--accent-primary), transparent 80%);
}

.timeline-dot-inner {
  background: var(--accent-primary);
}

/* ── Vertical connector line ───────────────────────────────────────────────── */
.timeline-line {
  border-left: 1px solid var(--border-color-1);
}

/* ── Git commit tagline ────────────────────────────────────────────────────── */
.commit-tagline {
  width: fit-content;
  padding: 0.375rem 0.875rem;
  background: var(--content-1);
  border: 1px solid var(--border-color-1);
  border-radius: 0.5rem;
  line-height: 1.5;
  margin-top: 0;
}

.syn-cmd  { color: var(--text-secondary); }
.syn-sub  { color: var(--accent-secondary); }
.syn-flag { color: var(--accent-tertiary); }
.syn-str  { color: var(--accent-primary); }

/* ── Commit-name input (base look shared via .inline-terminal-input) ──────── */
.commit-name-input {
  line-height: inherit;
  vertical-align: baseline;
}

.commit-name-input::placeholder {
  color: color-mix(in oklab, var(--accent-primary), transparent 45%);
}

/* ── Enter hint ↵ (layout shared via .inline-enter-hint) ──────────────────── */
.commit-enter-hint {
  color: var(--accent-primary);
  opacity: 0.7;
}

.commit-enter-hint-enter-active {
  transition: opacity 0.4s ease;
}

.commit-enter-hint-leave-active {
  transition: opacity 0.2s ease;
}

.commit-enter-hint-enter-from,
.commit-enter-hint-leave-to {
  opacity: 0;
}

</style>
