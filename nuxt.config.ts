// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxt/eslint',
    '@nuxt/icon'
  ],

  icon: {
    clientBundle: {
      scan: true,
    },
    mode: 'svg'
  },

  tailwindcss: {
    configPath: 'tailwind.config.js',
  },

  css: [
    '~/assets/css/main.css'
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {}
    }
  },

  site: {
    url: "https://dpp.qzz.io",
    name: "DiamondPie's intro page"
  },

  sitemap: {
    zeroRuntime: true
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'Weirdo DiamondPie',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0' },
        { name: 'description', content: "DiamondPie's intro page - No sorrow in falling, even stars burn out." },
        { name: 'author', content: 'diamondpie' },
        { name: 'keywords', content: 'diamondpie, developer, technology, coding' },
        { name: 'robots', content: 'index, follow' },
        { name: 'google-site-verification', content: 'ZyziDD5-aBjYavK2JTEQPCJG9IpJirxt9AgdYvelguw' },
        // If you're planning to deploy your own website, don't forget to replace this!
 
        // Open Graph / Facebook
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: "DiamondPie's intro page" },
        { property: 'og:description', content: "DiamondPie's intro page - No sorrow in falling, even stars burn out." },
        { property: 'og:image', content: 'https://dpp.qzz.io/preview.png' },
 
        // Twitter
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: "DiamondPie's intro page" },
        { name: 'twitter:description', content: "DiamondPie's intro page - No sorrow in falling, even stars burn out." },
        { name: 'twitter:image', content: 'https://dpp.qzz.io/preview.png' }
      ],
      link: [
        { rel: 'icon', href: '/icon.jpg', type: 'image/jpeg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght@0,300..800;1,300..800&family=Google+Sans+Flex:opsz,wght@6..144,1..1000&display=swap&font-display=block'
        }
      ],
      script: [
        // Kill-switch: must run as early as possible to hide the document
        // before any paint when the previous session triggered the "kill" command.
        // After DOMContentLoaded, fetch /404.html and replace the entire document.
        {
          innerHTML: `
            if (sessionStorage.getItem("killed") === "1") {
                sessionStorage.removeItem("killed");
                document.documentElement.style.visibility = "hidden";
                
                const xhr = new XMLHttpRequest();
                xhr.open("GET", "/404.html", false); // public/404.html
                xhr.send();
                
                const parsed = new DOMParser().parseFromString(xhr.responseText, "text/html");

                parsed.documentElement.style.visibility = "visible";
                document.documentElement.style.visibility = "visible";

                document.replaceChild(
                    document.importNode(parsed.documentElement, true),
                    document.documentElement
                );
            }
          `,
          tagPosition: 'head',
          type: 'text/javascript'
        }
      ]
    }
  },

  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
    locales: [
      {
        code: 'en',
        name: 'English',
        file: 'en.json'
      },
      {
        code: 'zh',
        name: '简体中文',
        file: 'zh.json'
      }
    ],
    langDir: 'locales/',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  }
})
