<template>
  <section id="pathway" class="relative z-10 max-w-6xl mx-auto px-6 py-20">
    <div class="animate-fadeIn">
      <h2 class="lg:text-4xl text-2xl mb-10 flex items-center gap-4 uppercase">
        <span class="font-extrabold">{{ $t('pathway.title') }}</span>
      </h2>

      <PathwaySectionTimeline />

      <div class="pathway-divider my-12" />

      <PathwaySectionWorks />
    </div>
  </section>
</template>

<style scoped>
/* ── Separator between the commit timeline and the works grid ─────────────── */
.pathway-divider {
  height: 1px;
  background: linear-gradient(
    to right,
    var(--border-color-1),
    color-mix(in oklab, var(--border-color-1), transparent 100%)
  );
}
</style>
