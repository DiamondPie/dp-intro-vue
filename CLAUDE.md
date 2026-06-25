# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Production build
pnpm generate     # Static site generation
pnpm preview      # Preview production build
pnpm postinstall  # Run after installing deps (nuxt prepare)
```

Package manager is **pnpm** (v11). Always use `pnpm`, never `npm` or `yarn`.

## Architecture

This is a **Nuxt 4** single-page portfolio site. All application code lives under `app/` (Nuxt 4 convention). This site uses **SSG**.

### Page structure

There are two routes:

- **`app/pages/index.vue`** — the main portfolio page. Renders a full-page vertical scroll layout with sections stacked in order: `HeroSection → AboutSection → WorksSection → FriendsSection → SiteFooter`. Also includes `BackgroundCover`, `HeadBar`, and `BackToTopButton`. `NavDock` exists but is currently commented out.
- **`app/pages/music.vue`** — a standalone music player page at `/music`, backed by a server API (`server/api/music.ts` reads `server/assets/music.json`). Uses `useFetch('/api/music')` at runtime, so this route is not purely static.

### Cross-cutting scroll logic (`app/composables/useIntroEffects.js`)

This is the most architecturally important file. It was previously a client-only plugin (`app/plugins/intro.client.js`) and has been rewritten as a composable. It is called from `index.vue` via `useIntroEffects()` in `<script setup>`, with all DOM access guarded inside `onMounted`.

It owns all DOM-driven behavior that spans multiple components:

- **Scroll effects** — drives opacity/transform on `#cover`, `#head-bar`, `#avatar`, `#top-btn`, `#side-text`, `#arrow-down` by reading `window.scrollY` thresholds. RAF-throttled.
- **Scroll spy** — `IntersectionObserver` on section anchors (`#home`, `#about`, `#works`, `#friends`) that toggles active styles on `button[data-target]` elements in both the desktop nav and `#mobile-nav`.
- **Button hover tints** — reads `background-color` from inline `style` attributes on `<a>` tags inside `#btn-container` (hero) and `#bottom-container` (footer), then adjusts the alpha on hover.
- **Console branding** — prints a styled ASCII art banner and status badge on page load.
- **Pixel data pre-load** — imports `~/data/pixelData.js` at the top of the module so it is in the module cache before `PixelCanvas` mounts.

> **Rule**: Do not move scroll/nav logic into individual components. It's in the composable because it touches elements rendered by both `HeroSection` and `SiteFooter`.

### DX Transition system (`app/components/Transition/`)

A maimai DX-inspired full-screen page transition. `DXTransition.vue` is the orchestrator — it takes a `:loading` boolean prop and manages a minimum-display-time guard so the animation always completes before dismissing. Sub-components (`DXTransitionBg`, `DXTransitionSide`, `DXTransitionSlide`, `DXTransitionSlideLong`, `DXTransitionHold`) are pure presentational and get their colors from CSS custom properties set on `.dx-transition`.

### Styling conventions

- **Tailwind** for layout and utility classes. Config at `tailwind.config.js` — content paths point into `app/`.
- **CSS custom properties** (in `app/assets/css/main.css`) for all design tokens: colors (`--accent-primary`, `--text-secondary`, etc.), spacing, radii, shadows, and transitions. Always prefer these variables over hardcoded values.
- **Fonts**: `Google Sans Flex` (body/sans) and `Google Sans Code` (mono), loaded from Google Fonts. Referenced as `font-sans` / `font-mono` in Tailwind.
- Named animation classes (`.animate-fadeIn`, `.animate-fadeInUp`, `.animate-blink`) and keyframes are defined globally in `main.css`.
- The `button.home` and `.link-tag` classes are global reusable styles defined in `main.css`.

### i18n

Uses `@nuxtjs/i18n` with `strategy: 'no_prefix'`. Locale files live in `i18n/locales/en.json` and `zh.json`. Language is detected from a cookie (`i18n_redirected`) and defaults to `en`. Use `useI18n()` composable and the `$t()` helper inside templates.

### Kill-switch

`nuxt.config.ts` injects an inline script into `<head>` that checks `sessionStorage.getItem("killed") === "1"`. If set, it synchronously fetches `public/404.html` and replaces the entire document before any paint. This is intentional — do not remove it.

### Pixel canvas (`app/components/HeroSection/PixelCanvas.vue`)

Renders a pixel-art portrait and QR code from data in `app/data/pixelData.js`. The `useIntroEffects` composable pre-loads this module at the top level so it's in cache before the component mounts.

## Key library docs

- Nuxt 4: https://nuxt.com/docs
- @nuxtjs/i18n: https://i18n.nuxtjs.org
- @nuxtjs/tailwindcss: https://tailwindcss.nuxtjs.org
- @nuxtjs/sitemap: https://nuxtseo.com/sitemap

## Access to docs

If any online documentations are forbidden, obfuscated or truncated. Try scrape [url] by accessing webclaw mcp.