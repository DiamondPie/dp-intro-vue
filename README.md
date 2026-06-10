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

```
dp-intro-vue/
├── pages/
│   └── index.vue              # Single-page scroll layout
├── components/
│   ├── HeadBar.vue             # Fixed nav — fades in on scroll
│   ├── HeroSection.vue         # Full-viewport landing with terminal & portrait
│   │   ├── PixelCanvas.vue         # ASCII-art portrait / QR code canvas
│   │   └── CommandLine.vue         # Interactive terminal with command registry
│   ├── Transition/             # maimai DX-style page transition
│   │   ├── DXTransition.vue        # Orchestrator — driven by a :loading prop
│   │   └── ...                     # Rest of background panels and svg elements
│   ├── BackgroundCover.vue     # Scroll-driven gradient backdrop
│   ├── AboutSection.vue        # Bio, interests, photo grid
│   │   └── PhotoGrid.vue           # Masonry layout of personal photos
│   ├── WorksSection.vue        # Featured project cards
│   ├── FriendsSection.vue      # Friend cards + invite form
│   │   └── FriendInvite.vue
│   ├── SiteFooter.vue          # Social links, draggable logo
│   └── BackToTopButton.vue
├── error.vue                  # Custom 404/403 terminal-style error page
├── assets/
│   ├── css/main.css            # CSS variables, global animations
│   └── data/pixelData.js       # Portrait & QR code pixel data
├── plugins/
│   └── intro.client.js         # Console banner, scroll effects, nav spy
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

  <sub>© 2026 DiamondPie — Crafted with passion, code and LLms.</sub>
</div>
