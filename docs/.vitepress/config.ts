import { defineConfig } from 'vitepress'
import implicitFigures from 'markdown-it-implicit-figures'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'aAI Art',
  description: 'Alternative AI Art - Procedural Graphics with LLMs',
  outDir: '../dist/docs',
  base: '/aAI-Art/docs/',
  vite: {
    configFile: false,
  },
  markdown: {
    config: (md) => {
      md.use(implicitFigures, {
        figcaption: true,
        copyAttrs: '^class$',
      })
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Go to App', link: 'https://parsehex.github.io/aAI-Art/' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          // { text: 'What is aAI Art?', link: '/guide/what-is-aai-art' },
          { text: 'Getting Started', link: '/guide/getting-started' },
        ],
      },
    ],

    socialLinks: [{ icon: 'github', link: 'https://github.com/parsehex/aAI-Art' }],
  },
})
