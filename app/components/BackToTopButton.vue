<template>
  <!--
    "Back to top" button.
    Visibility (opacity / translate-y / pointer-events) is toggled by
    the global scroll handler in `intro.client.js`; the click handler
    that scrolls to the top is also wired there (initScrollSpy).

    NOTE: `bg-$text-primary` was a UnoCSS shorthand in the original
    markup → translated to `bg-[var(--text-primary)]` for Tailwind.
  -->
  <button
    id="top-btn"
    aria-label="Back to top"
    class="bg-[var(--text-primary)] fixed bottom-8 right-4 p-3 rounded-full transition-all duration-300 z-40 group shadow-lg hover:scale-105 opacity-0 translate-y-10 pointer-events-none"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      aria-hidden="true"
      role="img"
      class="iconify iconify--mdi text-2xl text-black group-hover:-translate-y-0.5 group-active:translate-y-0.5 transition-all duration-300"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M13 20h-2V8l-5.5 5.5l-1.42-1.42L12 4.16l7.92 7.92l-1.42 1.42L13 8z"
      />
    </svg>
  </button>
</template>