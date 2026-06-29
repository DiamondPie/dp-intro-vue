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

### DX Transition system (`app/components/Transition/`)

A maimai DX-inspired full-screen page transition. `DXTransition.vue` is the orchestrator — it takes a `:loading` boolean prop and manages a minimum-display-time guard so the animation always completes before dismissing. Sub-components (`DXTransitionBg`, `DXTransitionSide`, `DXTransitionSlide`, `DXTransitionSlideLong`, `DXTransitionHold`) are pure presentational and get their colors from CSS custom properties set on `.dx-transition`.

### Styling conventions

- **Tailwind** for layout and utility classes. Config at `tailwind.config.js` — content paths point into `app/`. Plugins: `@tailwindcss/forms`, `@tailwindcss/typography`.
- **CSS custom properties** (in `app/assets/css/main.css`) for all design tokens: colors (`--accent-primary`, `--text-secondary`, `--border-color-1`, `--content-1`, etc.), spacing, radii, shadows, and transitions. Always prefer these variables over hardcoded values.
- **Fonts**: `Google Sans Flex` (body/sans) and `Google Sans Code` (mono), loaded from Google Fonts. Referenced as `font-sans` / `font-mono` in Tailwind.
- Named animation classes (`.animate-fadeIn`, `.animate-fadeInUp`, `.animate-blink`) and keyframes are defined globally in `main.css`.
- The `button.home` and `.link-tag` classes are global reusable styles defined in `main.css`.

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

## Available MCP Servers

### `github` — GitHub operations
Tools: `mcp__github__*`

Use for: reading/writing GitHub issues, pull requests, commits, branches, file contents, and repository metadata. Prefer these tools over `gh` CLI when the task is purely about GitHub data (not local git state).

Common scenarios:
- Creating or reviewing PRs: `pull_request_read`, `pull_request_review_write`, `create_pull_request`
- Browsing issues: `list_issues`, `issue_read`, `add_issue_comment`
- Navigating commits or history: `list_commits`, `get_commit`, `search_commits`
- Reading remote files without cloning: `get_file_contents`, `search_code`

### `nuxt-remote` — Nuxt official documentation
Tools: `mcp__nuxt-remote__*`

Use for: fetching up-to-date Nuxt docs, module pages, blog posts, and changelogs directly from the Nuxt website. Prefer over pre-trained knowledge when checking API signatures, module options, or migration guides.

Common scenarios:
- Looking up a module: `get-module`, `list-modules`
- Reading docs pages: `get-documentation-page`, `list-documentation-pages`
- Checking getting-started guides: `get-getting-started-guide`
- Verifying deploy provider config: `get-deploy-provider`, `list-deploy-providers`

### `chrome-devtools` — Browser automation & DevTools
Tools: `mcp__plugin_chrome-devtools-mcp_chrome-devtools__*`

Use for: testing UI changes in a live browser, taking screenshots, auditing performance/accessibility, capturing console errors, and verifying network requests. Required when verifying frontend changes in a real browser environment.

Common scenarios:
- Verifying a UI change: `take_screenshot`, `navigate_page`, `click`, `fill`
- Checking console errors after a change: `list_console_messages`, `get_console_message`
- Performance audits: `lighthouse_audit`, `performance_start_trace` / `performance_stop_trace`
- Network inspection: `list_network_requests`, `get_network_request`
- Accessibility debugging: use `lighthouse_audit` with a11y category
- Memory/heap profiling: `take_heapsnapshot`

### `webclaw` — Web content extraction
Tools: `mcp__webclaw__*`

Use for: fetching and parsing external documentation, scraping web pages that block direct fetches, or extracting structured data from URLs. Fall back to this when official docs are truncated or unavailable.

Common scenarios:
- Fetching obfuscated/blocked docs: `scrape [url]`
- Extracting structured data from a page: `extract`
- Summarizing a long page: `summarize`
- Researching a topic across multiple pages: `research`, `crawl`
- Comparing two versions of a page: `diff`
- Mapping all links on a site: `map`
