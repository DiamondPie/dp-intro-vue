/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/components/**/*.{js,vue,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/plugins/**/*.{js,ts}',
    './app/app.vue',
    './app/error.vue'
  ],
  theme: {
    extend: {
      fontFamily: {
        // Match the original CSS: --font-mono: "Google Sans Code", monospace;
        // Body uses "Google Sans Flex".
        mono: ['"Google Sans Code"', 'monospace'],
        sans: ['"Google Sans Flex"', 'sans-serif']
      },
      transitionDuration: {
        DEFAULT: '300ms'
      }
    }
  },
  plugins: []
}