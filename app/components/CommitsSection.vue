<script setup lang="ts">
import Badge from './CommitsSection/Badge.vue';

</script>

<template>
  <section id="commits" class="relative z-10 max-w-6xl mx-auto px-6 py-20">
    <div class="animate-fadeIn">
      <h2 class="lg:text-4xl text-2xl mb-8 flex items-center gap-4 uppercase">
        <span class="font-extrabold">COMMITS</span>
      </h2>
      <p class="commit-tagline font-mono text-sm mb-8"><span class="syn-cmd">git</span><span class="syn-sub"> commit</span><span class="syn-flag"> -m</span><span class="syn-str"> "feat: Made something meaningful"</span></p>

      <div class="flex flex-col items-start w-full">

        <!-- ── Entry: 2026 ──────────────────────────────────────────────── -->
        <div class="relative flex w-full justify-end gap-2">
          <div class="sticky top-[4.75rem] hidden w-36 flex-col items-end gap-2 self-start pb-4 md:flex">
            <span class="timeline-badge">2026</span>
            <div class="text-right text-sm font-medium" style="color: var(--text-secondary)">February 2026</div>
          </div>

          <div class="flex flex-col items-center">
            <div class="sticky top-[4.75rem] flex size-6 items-center justify-center">
              <span class="timeline-dot-outer flex size-[1.125rem] shrink-0 items-center justify-center rounded-full">
                <span class="timeline-dot-inner size-3 rounded-full" />
              </span>
            </div>
            <span class="timeline-line -mt-2.5 w-px flex-1" />
          </div>

          <div class="flex flex-1 flex-col gap-4 pb-11 pl-3 md:pl-6 lg:pl-9">
            <div class="flex flex-col gap-2 md:hidden">
              <span class="timeline-badge self-start">2026</span>
              <div class="font-medium">February 2026</div>
            </div>

            <div class="space-y-4">
              <div class="space-y-3">
                <h3 class="text-xl font-semibold">Started University · Computer Science</h3>
                <p class="text-sm" style="color: var(--text-secondary)">Began my Bachelor of Science at the University of Auckland, diving headfirst into algorithms, discrete maths, and a semester's worth of caffeine.</p>
              </div>

              <ul class="ml-2 list-inside list-disc space-y-3 text-sm" style="color: var(--text-secondary)">
                <li>COMPSCI 110 — Introduction to Computer Science</li>
                <li>MATHS 120 — Linear Algebra</li>
                <li>PHYSICS 140 — Digital Fundamentals</li>
              </ul>
              <Badge color="#d0539b">UOACS</Badge> <Badge color="#afdece">SESA</Badge> <Badge color="#43ccaf">Linux User Group</Badge> <Badge color="#9479ed">DEVS</Badge>

              <div class="-mt-2 space-y-0">
                <CommitsSectionDetails label="Milestones" type="new" :default-open="true">
                  <ul class="list-inside list-disc space-y-3 pb-4 pl-2 pt-1 text-sm" style="color: var(--text-secondary)">
                    <li>First semester GPA achieved.</li>
                    <li>Completed first solo programming assignment in Python.</li>
                    <li>Made friends with people who also think semicolons matter.</li>
                  </ul>
                </CommitsSectionDetails>

                <CommitsSectionDetails label="Side Projects" type="update">
                  <ul class="list-inside list-disc space-y-3 pb-4 pl-2 pt-1 text-sm" style="color: var(--text-secondary)">
                    <li>Built a Minecraft plugin to automate in-game quiz and prices.</li>
                    <li>Started this portfolio site with Vue + Nuxt 4.</li>
                  </ul>
                </CommitsSectionDetails>
              </div>
            </div>
          </div>
        </div>

        <!-- ── Entry: 2023 ──────────────────────────────────────────────────── -->
        <div class="relative flex w-full justify-end gap-2">
          <div class="sticky top-[4.75rem] hidden w-36 flex-col items-end gap-2 self-start pb-4 md:flex">
            <span class="timeline-badge">2023</span>
            <div class="text-right text-sm font-medium" style="color: var(--text-secondary)">September 2023</div>
          </div>

          <div class="flex flex-col items-center">
            <div class="sticky top-[4.75rem] flex size-6 items-center justify-center">
              <span class="timeline-dot-outer flex size-[1.125rem] shrink-0 items-center justify-center rounded-full">
                <span class="timeline-dot-inner size-3 rounded-full" />
              </span>
            </div>
            <span class="timeline-line -mt-2.5 w-px flex-1" />
          </div>

          <div class="flex flex-1 flex-col gap-4 pb-11 pl-3 md:pl-6 lg:pl-9">
            <div class="flex flex-col gap-2 md:hidden">
              <span class="timeline-badge self-start">2023</span>
              <div class="font-medium">September 2023</div>
            </div>

            <div class="space-y-4">
              <div class="space-y-3">
                <h3 class="text-xl font-semibold">High School · Playing and Catching Dues with Friends</h3>
                <p class="text-sm" style="color: var(--text-secondary)">Started the habit of staying up all night writing code. Learnt Python, JavaScript, a bit of Java, and Git. Tried to build some small automation and web tools.</p>
              </div>

              <div class="-mt-2 space-y-0">
                <CommitsSectionDetails label="Toy Projects" type="new" :default-open="true">
                  <ul class="list-inside list-disc space-y-3 pb-4 pl-2 pt-1 text-sm" style="color: var(--text-secondary)">
                    <li>A QQ chatbot based on CQHttp and finally got banned.</li>
                    <li>A Discord bot for entertainment.</li>
                    <li>Personal website v1 with pure HTML/CSS.</li>
                  </ul>
                </CommitsSectionDetails>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
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

</style>
