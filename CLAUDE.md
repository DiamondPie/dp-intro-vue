# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Production build
pnpm generate     # Static site generation
pnpm preview      # Preview production build
pnpm postinstall  # Run after installing deps (nuxt prepare)
pnpm lint         # Lint with ESLint
pnpm lint:fix     # Auto-fix lint errors
```

Package manager is **pnpm** (v11). Always use `pnpm`, never `npm` or `yarn`.

## Architecture

This is a **Nuxt 4** single-page portfolio site. All application code lives under `app/` (Nuxt 4 convention). The site is deployed on **Cloudflare Pages** (`nitro.preset: 'cloudflare-pages'`).

### Page structure

There are two routes:

- **`app/pages/index.vue`** — the main portfolio page. Renders a full-page vertical scroll layout with sections stacked in order: `HeroSection → AboutSection → WorksSection → CommitsSection → FriendsSection → SiteFooter`. Also includes `BackgroundCover`, `HeadBar`, and `BackToTopButton`. `NavDock` exists but is currently commented out.
- **`app/pages/music.vue`** — a standalone music player page at `/music`, backed by a server API (`server/api/music.ts` reads `server/assets/music.json`). Uses `useFetch('/api/music')` at runtime (`routeRules: { '/music': { ssr: true } }`), so this route is not purely static.

### Component tree

```
app/components/
├── AboutSection.vue
│   └── AboutSection/PhotoGrid.vue
│       └── PhotoGrid/TextScatterCard.vue
├── CommitsSection.vue
│   ├── CommitsSection/Badge.vue
│   ├── CommitsSection/Code.vue
│   └── CommitsSection/Details.vue
├── FriendsSection.vue
│   └── FriendsSection/FriendInvite.vue
├── HeroSection.vue
│   ├── HeroSection/PixelCanvas.vue
│   └── HeroSection/CommandLine.vue
├── Music/
│   ├── MusicAudioVisualizer.vue
│   ├── MusicBackground.vue
│   ├── MusicControlBar.vue
│   ├── MusicDrawerTab.vue
│   ├── MusicPlayerPanel.vue
│   └── MusicTrackList.vue
├── Transition/
│   ├── DXTransition.vue          ← orchestrator
│   ├── DXTransitionBg.vue
│   ├── DXTransitionHold.vue
│   ├── DXTransitionSide.vue
│   ├── DXTransitionSlide.vue
│   └── DXTransitionSlideLong.vue
├── Utils/
│   └── InlineTerminalInput.vue   ← reusable v-model input styled to blend into terminal-style text
├── BackgroundCover.vue
├── BackToTopButton.vue
├── HeadBar.vue
├── NavDock.vue
├── SiteFooter.vue
└── WorksSection.vue
```

### Cross-cutting scroll logic (`app/composables/useIntroEffects.js`)

This is the most architecturally important file. It was previously a client-only plugin (`app/plugins/intro.client.js`) and has been rewritten as a composable. It is called from `index.vue` via `useIntroEffects()` in `<script setup>`, with all DOM access guarded inside `onMounted`.

It owns all DOM-driven behavior that spans multiple components:

- **Scroll effects** — drives opacity/transform on `#cover`, `#head-bar`, `#avatar`, `#top-btn`, `#side-text`, `#arrow-down` by reading `window.scrollY` thresholds. RAF-throttled.
- **Scroll spy** — `IntersectionObserver` on section anchors (`#home`, `#about`, `#works`, `#friends`) that toggles active styles on `button[data-target]` elements in both the desktop nav and `#mobile-nav`.
- **Button hover tints** — reads `background-color` from inline `style` attributes on `<a>` tags inside `#btn-container` (hero) and `#bottom-container` (footer), then adjusts the alpha on hover.
- **Console branding** — prints a styled ASCII art banner and status badge on page load.
- **Pixel data pre-load** — imports `~/data/pixelData.js` at the top of the module so it is in the module cache before `PixelCanvas` mounts.

> **Rule**: Do not move scroll/nav logic into individual components. It's in the composable because it touches elements rendered by both `HeroSection` and `SiteFooter`.

### CommitsSection (`app/components/CommitsSection.vue`)

A vertical timeline of educational/career milestones. Content is fully i18n-driven — all entries come from `tm('commits.entries')` in the locale files (`i18n/locales/en.json`, `zh.json`). Sub-components: `Badge` (colored pill tags), `Details` (collapsible disclosure items), `Code` (inline code formatting).

The tagline above the timeline (`git commit -m "build: met <input>"`) is interactive: the input is `Utils/InlineTerminalInput.vue`, styled to blend into the surrounding text (see Styling conventions below). Pressing Enter opens a `mailto:` link to the site owner and, on the first submission, prepends a synthetic "met {name}" entry to the top of `entries` — its `{ name, date }` is held in a `metVisitor` ref, and its title/desc are resolved from `commits.met_entry.title` / `.desc` reactively inside the `entries` computed (not cached as plain strings), so they stay correct if the language is switched afterwards. The flag switches from `-m` to `--amend -m` once `metVisitor` is set. Submitting again with a different name mutates `metVisitor.name` in place — updating the existing entry's text — rather than adding another timeline row.

### Text scatter card (`app/components/AboutSection/PhotoGrid/TextScatterCard.vue`)

A special `PhotoGrid` tile that, on hover, plays an i18n-driven line-by-line text animation (`about.scatter_text` in the locale files) built with GSAP: characters split via `SplitText` enter, hold, then scatter and fall off using `Physics2DPlugin`, with a 3D flip revealing a back face if a character tumbles past 90°. GSAP, `SplitText`, `Physics2DPlugin`, and the two `TextScatterMedium`/`TextScatterBold` fonts (`public/fonts/text-scatter/`) are lazy-loaded on first hover, not at page load. Hover-leave cancels the in-flight animation and tweens out the overlay. All animation timing/physics constants live in the `CONFIG` object at the top of the script — tune there rather than inline.

### Music page (`app/pages/music.vue`)

`server/api/music.ts` turns each `server/assets/music.json` entry into a track by slugifying its `name` and building `{cdnUrl}/{slug}/{slug}.{ext}` URLs for the audio, `.webp` cover, and `.lrc` lyrics.

**Audio format** — tracks are `.mp3` unless the entry sets `"format": "flac"`:

```json
{ "name": "Komorebi", "artist": "M-TAKU" },
{ "name": "Some Lossless Track", "artist": "Someone", "format": "flac" }
```

The value is case-insensitive; anything other than `flac` falls back to `mp3`. The resolved format is returned to the client on `track.format`.

**LRC format** — parsed by `parseLrc()` in `music.vue`, with two extensions over plain LRC:

- **Translations**: a second line at the *same timestamp* prefixed with `[tr]` attaches as `translation` to that lyric (`[00:12.34][tr]你的名字`).
- **Japanese ruby (furigana)**: `{base|reading}` groups become `<ruby>base<rt>reading</rt></ruby>`. Write per-character readings as adjacent groups — `{漢|かん}{字|じ}`, not `{漢字|かんじ}` — when you want each kana over its own kanji. A literal `{`, `}`, or `|` is backslash-escaped. Ruby works in both the main line and its `[tr]` line.

```
[00:12.34]{君|きみ}の{名|な}は
[00:12.34][tr]你的名字
```

`parseRuby()` returns `segments` **only** when a line actually carries a reading, so unannotated lines stay a single text node; `line.text` is always the plain, reading-free string. Malformed markup (unclosed brace, empty reading) degrades to literal text rather than throwing. Annotated lines get a `.has-ruby` class in `MusicPlayerPanel.vue` that widens `line-height` so the reading doesn't collide with the line above.

### DX Transition system (`app/components/Transition/`)

A maimai DX-inspired full-screen page transition. `DXTransition.vue` is the orchestrator — it takes a `:loading` boolean prop and manages a minimum-display-time guard so the animation always completes before dismissing. Sub-components (`DXTransitionBg`, `DXTransitionSide`, `DXTransitionSlide`, `DXTransitionSlideLong`, `DXTransitionHold`) are pure presentational and get their colors from CSS custom properties set on `.dx-transition`.

### Styling conventions

- **Tailwind** for layout and utility classes. Config at `tailwind.config.js` — content paths point into `app/`. Plugins: `@tailwindcss/forms`, `@tailwindcss/typography`.
- **CSS custom properties** (in `app/assets/css/main.css`) for all design tokens: colors (`--accent-primary`, `--text-secondary`, `--border-color-1`, `--content-1`, etc.), spacing, radii, shadows, and transitions. Always prefer these variables over hardcoded values.
- **Fonts**: `Google Sans Flex` (body/sans) and `Google Sans Code` (mono), loaded from Google Fonts. Referenced as `font-sans` / `font-mono` in Tailwind.
- Named animation classes (`.animate-fadeIn`, `.animate-fadeInUp`, `.animate-blink`) and keyframes are defined globally in `main.css`.
- The `button.home` and `.link-tag` classes are global reusable styles defined in `main.css`.
- `.inline-terminal-input` and `.inline-enter-hint` (also in `main.css`) are the shared base styles for terminal-blended `<input>`s and their `↵` hints — used by both `HeroSection/CommandLine.vue` (`#cmd-input` / `#cmd-enter-hint`) and `Utils/InlineTerminalInput.vue` (used in `CommitsSection.vue`). Each consumer layers its own color/animation on top in scoped styles.

### Icons (`@nuxt/icon`)

Uses `@nuxt/icon` with SVG mode and client bundle scanning. Icon sets available: `mdi`, `mingcute`, `simple-icons` (via `@iconify-json/*` dev deps). Use the `<Icon name="mdi:..." />` component syntax.

### i18n

Uses `@nuxtjs/i18n` with `strategy: 'no_prefix'`. Locale files live in `i18n/locales/en.json` and `zh.json`. Language defaults to `en`; browser language detection is disabled (`detectBrowserLanguage: false`). Language is switched via a cookie (`i18n_redirected`). Use `useI18n()` composable and the `$t()` helper inside templates. For complex structured translations (arrays/objects), use `tm()` + `rt()`.

### Kill-switch

`nuxt.config.ts` injects an inline script into `<head>` that checks `sessionStorage.getItem("killed") === "1"`. If set, it synchronously fetches `public/404.html` and replaces the entire document before any paint. This is intentional — do not remove it.

### Pixel canvas (`app/components/HeroSection/PixelCanvas.vue`)

Renders a pixel-art portrait and QR code from data in `app/data/pixelData.js`. The `useIntroEffects` composable pre-loads this module at the top level so it's in cache before the component mounts.

## Key library docs

- Nuxt 4: https://nuxt.com/docs
- @nuxtjs/i18n: https://i18n.nuxtjs.org
- @nuxtjs/tailwindcss: https://tailwindcss.nuxtjs.org
- @nuxtjs/sitemap: https://nuxtseo.com/sitemap
- @nuxt/icon: https://icon.nuxt.com
- GSAP: https://gsap.com/docs

@CLAUDE.local.md
