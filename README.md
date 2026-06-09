<div align="center">
  <h1>ダイヤモンドパイ — DiamondPie</h1>
  
  *No sorrow in falling - even stars burn out.*

  ![Nuxt 4](https://img.shields.io/badge/Nuxt-4.4.7-09dd86?logo=nuxt)
  ![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vue.js)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss)
  [![MIT license](https://custom-icon-badges.demolab.com/github/license/denvercoder1/custom-icon-badges?logo=law)](https://lbesson.mit-license.org/)

  ![](https://img.shields.io/github/last-commit/DiamondPie/dp-intro-vue)

</div>

A personal introduction and portfolio site for **DiamondPie~** which blends a terminal/hacker aesthetic with fluid scroll-driven animations and interactive elements.

Live at **[dpp.qzz.io](https://dpp.qzz.io)**

---

## Project Structure

```
dp-intro-vue/
├── pages/
│   └── index.vue          # Single-page scroll layout
├── components/
│   ├── HeadBar.vue         # Fixed nav — fades in on scroll
│   ├── HeroSection.vue     # Full-viewport landing with terminal & portrait
│   │   ├── PixelCanvas.vue     # ASCII-art portrait / QR code canvas
│   │   └── CommandLine.vue     # Interactive terminal with command registry
│   ├── BackgroundCover.vue # Scroll-driven gradient backdrop
│   ├── AboutSection.vue    # Bio, interests, photo grid
│   │   └── PhotoGrid.vue       # Masonry layout of personal photos
│   ├── WorksSection.vue    # Featured project cards
│   ├── FriendsSection.vue  # Friend cards + invite form
│   │   └── FriendInvite.vue
│   ├── SiteFooter.vue      # Social links, draggable logo
│   └── BackToTopButton.vue
├── error.vue               # Custom 404/403 terminal-style error page
├── assets/
│   ├── css/main.css        # CSS variables, global animations
│   └── data/pixelData.js   # Portrait & QR code pixel data
├── plugins/
│   └── intro.client.js     # Console banner, scroll effects, nav spy
└── nuxt.config.ts
```

<div align="center">
  <sub>© 2026 DiamondPie — Crafted with passion, code and Gemini.</sub>
</div>
