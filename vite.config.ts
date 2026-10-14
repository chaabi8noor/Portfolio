import react from '@vitejs/plugin-react'
import { copyFileSync } from 'node:fs'
import { defineConfig } from 'vite'

// BASE_PATH: '/' for a root domain, '/<repo>/' for GitHub Pages project sites.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [
    react(),
    {
      // Static hosts serve 404.html for unknown paths, so deep links like /work/x still boot the app.
      name: 'spa-404-fallback',
      closeBundle: () => copyFileSync('dist/index.html', 'dist/404.html'),
    },
  ],
})
