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
pnpm content:fetch # Pull site content from KV into app/content/content.json (also runs as pre{dev,build,generate})
```

Package manager is **pnpm** (v11). Always use `pnpm`, never `npm` or `yarn`.

Cloudflare Pages builds with `pnpm run build` (output dir `dist`), so `nuxt build` + the `cloudflare-pages` preset is the production path — `/` is prerendered via `routeRules`, not by `nuxt generate`.

## Architecture

This is a **Nuxt 4** single-page portfolio site. All application code lives under `app/` (Nuxt 4 convention). The site is deployed on **Cloudflare Pages** (`nitro.preset: 'cloudflare-pages'`).

### Page structure

There are two routes:

- **`app/pages/index.vue`** — the main portfolio page. Renders a full-page vertical scroll layout with sections stacked in order: `HeroSection → AboutSection → PathwaySection → FriendsSection → SiteFooter`. Also includes `BackgroundCover`, `HeadBar`, and `BackToTopButton`. `NavDock` exists but is currently commented out.
- **`app/pages/music.vue`** — a standalone music player page at `/music`, backed by a server API (`server/api/music.ts` reads `server/assets/music.json`). Uses `useFetch('/api/music')` at runtime (`routeRules: { '/music': { ssr: true } }`), so this route is not purely static.

### Component tree

```
app/components/
├── AboutSection.vue
│   └── AboutSection/PhotoGrid.vue
├── PathwaySection.vue                ← orchestrator: heading + Timeline + Works
│   ├── PathwaySection/Timeline.vue   ← the commit timeline
│   ├── PathwaySection/Works.vue      ← the works grid
│   ├── PathwaySection/Badge.vue
│   ├── PathwaySection/Code.vue
│   └── PathwaySection/Details.vue
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
└── SiteFooter.vue
```

### Site content (`app/composables/useSiteContent.js`)

The four list-type content blocks — **works, photos, friends, commits** — are **not** in the locale files or hardcoded in components. They live in Cloudflare KV (namespace `CONTENT`, key `content:v1`) and are baked into the prerendered page at build time:

```
KV content:v1 ──(scripts/fetch-content.mjs, REST API)──▶ app/content/content.json ──(static import)──▶ useSiteContent()
                       │ fails / no CF_* env → content/seed.json (warning)
                       │ schema invalid      → exit 1, build stops
```

- `scripts/fetch-content.mjs` runs as `predev` / `prebuild` / `pregenerate`. It needs `CF_ACCOUNT_ID`, `CF_KV_NAMESPACE_ID`, `CF_API_TOKEN` (see `.env.example`); when unset it copies `content/seed.json`, so local dev needs zero config.
- `app/content/content.json` is gitignored. `content/seed.json` is the committed fallback — keep it in sync with KV when you make structural changes.
- `shared/validateContent.js` is the single schema validator (plain ESM so both the node script and Nitro handlers can import it). It exports `CONTENT_KV_KEY` and `validateContent(obj) → string[]` (empty = valid).
- **Schema**: one object with `version`, `revision`, `updatedAt` and the four arrays. Publish-tracking state (`deployedRevision`, `deployStartedAt`, `deployAttempts`, …) lives in a **separate** key `content:v1:deploy` (`DEPLOY_KV_KEY`) so the build stamp and the editor never read-modify-write the same value. Every item has a stable `id` (used as `v-for` key). Bilingual text is stored **at field level** as `{ en, zh }` — never as two parallel documents. `friend.name` and `badge.label` are not bilingual. `friend.desc` is rendered with `v-html` (site-owner-controlled content).
- `useSiteContent()` returns `{ works, photos, friends, commits, revision, pick }`. The lists are **computeds** over a module-level `siteContent` ref (deep-cloned from `content.json`; deliberately not `useState`, so the document isn't serialised into the payload a second time) — use `.value` in script, auto-unwrapped in templates. `pick(field)` resolves an `{ en, zh }` value for the active locale (falls back to `en`); it reads `locale.value` so it stays reactive inside templates and computeds. Call `pick()` at render time — don't cache its result in a plain variable.
- `Timeline.vue` maps `commits` through `pick()` inside its `entries` computed and then layers the runtime `metVisitor` entry on top; the met entry never goes into KV.
- The **site** never reads KV at runtime. Publishing a content change = write KV → Pages build. The editor endpoints below are the only runtime KV readers, and the in-page editor (next section) is their only client.

#### In-page editor (`app/composables/useEditor.ts`, `app/components/Editor/`)

- Entry: open `/#edit=<EDIT_TOKEN>`. `useEditor().init()` (called from `index.vue` `onMounted`) reads the hash, strips it with `history.replaceState`, keeps the token in `sessionStorage` (`edit_token`), then loads the live document from `GET /api/content` into `siteContent`. The front-end token only decides whether editing controls render — `PUT` is the real gate.
- Editing mutates `siteContent` in place, so the normal components render the draft. `snapshot` (JSON string of the last server-matching document) drives `dirty`; `problems` runs `#shared/validateContent` live and disables Save while non-empty.
- Save = explicit, whole-document `PUT` with the loaded `revision`. **No autosave** (KV: 1 write/s per key). After a save the editor polls `/api/status` every 10 s until `deployedRevision >= savedRevision`, `stalled`, or `hookConfigured: false`; that polling is also what re-fires a failed hook (§4.3c). 401 clears the token and exits; 409 shows a Reload action that refetches (dropping local edits). `load()` also checks `/api/status` once so a reloaded tab still shows an in-flight publish.
- Components: `Editor/EditorBar.vue` (floating status/save bar, mounted in `index.vue`), one list editor per content block — `EditorWorks.vue` (swapped in by `Works.vue`), `EditorPhotos.vue` (`PhotoGrid.vue`; a plain grid, not the live masonry), `EditorFriends.vue` (`FriendsSection.vue`) — and the shared pieces `EditorInput.vue` (block field with EN/ZH/href/img tag), `EditorCardControls.vue` (drag handle + delete), `EditorAddCard.vue` (dashed "+ add"). Every mount point uses `<ClientOnly>` + `LazyEditor*` gated on `useEditor().enabled` (always `false` on the server), so nothing editor-related reaches the prerendered HTML and the editor code lives in its own chunks. Copy is under `editor.*` in the locale files.
- `app/composables/useEditorList.ts` is what each list editor builds on: `useEditorList<T>('works' | 'photos' | 'friends' | 'commits')` → `{ list, grid, add, remove }`. `list` is a **writable** computed over `siteContent` and `grid` is the template ref the sortable attaches to (`sortablejs` via `@vueuse/integrations` `useSortable`, pinned to 14.3.0 to match `@vueuse/nuxt`; `draggable: '.editor-card'`, handle `.editor-drag-handle`). It must stay writable: given a ref, `useSortable` copies the array and assigns `list.value`, which a read-only computed drops silently (DOM moves, data doesn't). `.editor-sortable-ghost` lives in `main.css` because Sortable applies it by name.
- `commits` is not editable yet (nested courses / badges / details); it follows the same pattern (see `temp/content-manager-plan.md` phase C).

#### Content API (`server/api/content.*.ts`, `server/api/status.get.ts`)

- `GET /api/content` — current KV document (editor only, `Cache-Control: no-store`).
- `PUT /api/content` — full-document save. Requires `Authorization: Bearer <EDIT_TOKEN>` (constant-time compare in `server/utils/editAuth.ts`; 401 otherwise), validates with `shared/validateContent.js` (400), and applies an optimistic lock: `body.revision` must equal the stored revision (409 with `data.revision`). Writes `revision + 1` and a fresh `updatedAt`, then runs `reconcileDeploy`.
- `GET /api/status` — `{ revision, deployedRevision, deployStartedAt, deployAttempts, publishing, stalled, hookConfigured, lastError }` for the editor to poll. It also runs `reconcileDeploy`, so polling is what heals a failed build/hook.
- `server/utils/contentStore.ts` — KV access. Uses the `CONTENT` binding (`event.context.cloudflare.env.CONTENT`) in production; under `nuxt dev` it falls back to the KV REST API with the same `CF_*` variables (token needs Write for PUT — point `CF_KV_NAMESPACE_ID` at `CONTENT_preview`). `put` retries 429 with backoff (KV allows 1 write/s per key) — hence **no keystroke-level autosave** in the editor, ever.
- `server/utils/deployState.ts` — `reconcileDeploy()`: if `revision > deployedRevision` and no build started within the last 120 s (`IN_FLIGHT_WINDOW_MS`), POST `DEPLOY_HOOK_URL`; saves inside that window are merged into the in-flight build. After 3 attempts (`MAX_ATTEMPTS`) for the same revision without `deployedRevision` advancing it stops and reports `stalled`. A new revision resets the budget.
- `scripts/stamp-deployed.mjs` (`postbuild`) writes the built revision (from `app/content/fetch-meta.json`) to `deployedRevision`. It only acts when `CF_PAGES=1` and content came from KV; failures are warnings, never build errors.
- Secrets: `EDIT_TOKEN`, `DEPLOY_HOOK_URL` are Pages **runtime** secrets (`wrangler pages secret put`) and must never reach the client. `CF_API_TOKEN` (build variable) needs KV Read **and Write** now, for the stamp.
- KV writes via wrangler need `--remote` (`wrangler kv key put --remote --namespace-id=… content:v1 --path=content/seed.json`); wrangler 4 defaults to the local `.wrangler/state` store otherwise.

### Cross-cutting scroll logic (`app/composables/useIntroEffects.js`)

This is the most architecturally important file. It was previously a client-only plugin (`app/plugins/intro.client.js`) and has been rewritten as a composable. It is called from `index.vue` via `useIntroEffects()` in `<script setup>`, with all DOM access guarded inside `onMounted`.

It owns all DOM-driven behavior that spans multiple components:

- **Scroll effects** — drives opacity/transform on `#cover`, `#head-bar`, `#avatar`, `#top-btn`, `#side-text`, `#arrow-down` by reading `window.scrollY` thresholds. RAF-throttled.
- **Scroll spy** — `IntersectionObserver` on section anchors (`#home`, `#about`, `#pathway`, `#friends`) that toggles active styles on `button[data-target]` elements in both the desktop nav and `#mobile-nav`.
- **Button hover tints** — reads `background-color` from inline `style` attributes on `<a>` tags inside `#btn-container` (hero) and `#bottom-container` (footer), then adjusts the alpha on hover.
- **Console branding** — prints a styled ASCII art banner and status badge on page load.
- **Pixel data pre-load** — imports `~/data/pixelData.js` at the top of the module so it is in the module cache before `PixelCanvas` mounts.

> **Rule**: Do not move scroll/nav logic into individual components. It's in the composable because it touches elements rendered by both `HeroSection` and `SiteFooter`.

### PathwaySection (`app/components/PathwaySection.vue`)

The single `#pathway` section that merges what used to be the separate `COMMITS` and `WORKS` sections. `PathwaySection.vue` is a thin orchestrator: it owns the `<section id="pathway">` wrapper, the `PATHWAY` `<h2>` (`pathway.title`) and a divider, then renders `PathwaySection/Timeline.vue` followed by `PathwaySection/Works.vue`. Both sub-components are plain `<div>`s with their own `<h3>` sub-heading (`pathway.commits_title` / `pathway.works_title`) — they must not reintroduce a `<section>` or an `id`, since the scroll spy observes `#pathway` only.

`Timeline.vue` is a vertical timeline of educational/career milestones. Entries come from `useSiteContent().commits` (KV-backed, see "Site content" above), not from the locale files. Sub-components: `Badge` (colored pill tags), `Details` (collapsible disclosure items), `Code` (inline code formatting). `Works.vue` is a grid of project cards driven by `useSiteContent().works`; only the section headings (`pathway.*`) remain in i18n.

The tagline above the timeline (`git commit -m "build: met <input>"`) is interactive: the input is `Utils/InlineTerminalInput.vue`, styled to blend into the surrounding text (see Styling conventions below). Pressing Enter opens a `mailto:` link to the site owner and, on the first submission, prepends a synthetic "met {name}" entry to the top of `entries` — its `{ name, date }` is held in a `metVisitor` ref, and its title/desc are resolved from `commits.met_entry.title` / `.desc` reactively inside the `entries` computed (not cached as plain strings), so they stay correct if the language is switched afterwards. The flag switches from `-m` to `--amend -m` once `metVisitor` is set. Submitting again with a different name mutates `metVisitor.name` in place — updating the existing entry's text — rather than adding another timeline row.

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
- `.inline-terminal-input` and `.inline-enter-hint` (also in `main.css`) are the shared base styles for terminal-blended `<input>`s and their `↵` hints — used by both `HeroSection/CommandLine.vue` (`#cmd-input` / `#cmd-enter-hint`) and `Utils/InlineTerminalInput.vue` (used in `PathwaySection/Timeline.vue`). Each consumer layers its own color/animation on top in scoped styles.

### Icons (`@nuxt/icon`)

Uses `@nuxt/icon` with SVG mode and client bundle scanning. Icon sets available: `mdi`, `mingcute`, `simple-icons` (via `@iconify-json/*` dev deps). Use the `<Icon name="mdi:..." />` component syntax.

### i18n

Uses `@nuxtjs/i18n` with `strategy: 'no_prefix'`. Locale files live in `i18n/locales/en.json` and `zh.json`. Language defaults to `en`; browser language detection is disabled (`detectBrowserLanguage: false`). Language is switched via a cookie (`i18n_redirected`). Use `useI18n()` composable and the `$t()` helper inside templates. For complex structured translations (arrays/objects), use `tm()` + `rt()`.

The locale files hold **UI copy only** (`nav.*`, `hero.*`, `about.*`, `pathway.*`, `friends.invite_*`, `commits.met_entry`, `footer.*`). List content (works / photos / friends / commit entries) is bilingual at field level in KV — do not add `works.*` or `commits.entries` back to the locale files.

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

@CLAUDE.local.md
