<div align="center">
  <h1>ダイヤモンドパイ — DiamondPie</h1>
  
  *No sorrow in falling - even stars burn out.*

  ![Nuxt 4](https://img.shields.io/badge/Nuxt-4.4.8-09dd86?logo=nuxt)
  ![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss)
  [![CC BY-NC-SA 4.0](https://custom-icon-badges.demolab.com/badge/License-CC%20BY%20NC--SA%204.0-blue?logo=law)](https://creativecommons.org/licenses/by-nc-sa/4.0/)


  ![](https://img.shields.io/github/last-commit/DiamondPie/dp-intro-vue)

</div>

A personal introduction and portfolio site for **DiamondPie** (myself!), which blends a terminal/hacker aesthetic with fluid scroll-driven animations and interactive elements.

👉 Live at **[dpp.qzz.io](https://dpp.qzz.io)** ✨

---

## 🔍 Project Structure

All application code lives under `app/` (Nuxt 4 convention).

```
dp-intro-vue/
├── app/
│   ├── pages/
│   │   ├── index.vue              # Single-page scroll layout
│   │   └── music.vue              # Standalone music player at /music
│   ├── components/
│   │   ├── HeadBar.vue             # Fixed nav — fades in on scroll
│   │   ├── NavDock.vue             # Floating nav dock (currently commented out)
│   │   ├── HeroSection.vue         # Full-viewport landing with terminal & portrait
│   │   │   ├── PixelCanvas.vue         # ASCII-art portrait / QR code canvas
│   │   │   ├── CommandLine.vue         # Interactive terminal with command registry
│   │   │   └── SocialPill.vue          # Social link pill buttons
│   │   ├── Transition/             # maimai DX-style page transition
│   │   │   ├── DXTransition.vue        # Orchestrator — driven by a :loading prop
│   │   │   └── ...                     # Background panels and SVG elements
│   │   ├── BackgroundCover.vue     # Scroll-driven gradient backdrop
│   │   ├── AboutSection.vue        # Bio, interests, photo grid
│   │   │   └── AboutSection/PhotoGrid.vue  # Masonry layout of personal photos
│   │   ├── WorksSection.vue        # Featured project cards
│   │   ├── CommitsSection.vue      # Educational/career milestone timeline
│   │   │   ├── CommitsSection/Badge.vue    # Colored pill tags
│   │   │   ├── CommitsSection/Details.vue  # Collapsible disclosure items
│   │   │   └── CommitsSection/Code.vue     # Inline code formatting
│   │   ├── FriendsSection.vue      # Friend cards + invite form
│   │   │   └── FriendsSection/FriendInvite.vue
│   │   ├── Music/                  # Music player components
│   │   │   ├── MusicPlayerPanel.vue
│   │   │   ├── MusicControlBar.vue
│   │   │   ├── MusicTrackList.vue
│   │   │   ├── MusicAudioVisualizer.vue
│   │   │   ├── MusicBackground.vue
│   │   │   └── MusicDrawerTab.vue
│   │   ├── Utils/
│   │   │   └── InlineTerminalInput.vue  # Reusable v-model input styled to blend into terminal text
│   │   ├── SiteFooter.vue          # Social links, draggable logo
│   │   └── BackToTopButton.vue
│   ├── composables/
│   │   └── useIntroEffects.js      # Scroll effects, nav spy, console banner
│   ├── data/
│   │   └── pixelData.js            # Portrait & QR code pixel data
│   ├── assets/
│   │   └── css/main.css            # CSS variables, global animations
│   └── error.vue                   # Custom 404/403 terminal-style error page
├── server/
│   ├── api/music.ts                # Music API endpoint
│   └── assets/music.json           # Music track metadata
└── nuxt.config.ts
```

## 🤝 Contributions

Any suggestions, feedbacks and issues are welcomed. Just [fire an issue](https://github.com/DiamondPie/dp-intro-vue/issues/new) and write anything!

## ⚖️ License

The entire repository, including the page itself, its components, and content, is licensed under [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/). 

You may not use anything in the repository for commercial purposes.

---

<br/>
<div align="center">
  <a href="https://dpp.qzz.io"><img align=center src="https://raw.githubusercontent.com/DiamondPie/storage/refs/heads/main/logo.svg" alt="DiamondPie" width="70%" height="auto" /></a>

  <sub>© 2026 DiamondPie — Crafted with passion, code and ~~LLMs~~.</sub>
</div>
