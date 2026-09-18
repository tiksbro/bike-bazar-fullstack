import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Prevent Vite from searching parent directories for a postcss config
  // (Tailwind is applied via the @tailwindcss/vite plugin above, not PostCSS).
  css: {
    postcss: {},
  },
})
