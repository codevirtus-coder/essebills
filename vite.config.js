import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'react-hot-toast': resolve(__dirname, 'src/lib/react-hot-toast-shim.tsx'),
      // Workaround for a corrupted/incomplete framer-motion install where `dist/es/*.mjs` is missing.
      // Alias to the CJS entry (which Vite can pre-bundle) to keep dev server running.
      'framer-motion': resolve(__dirname, 'node_modules/framer-motion/dist/cjs/index.js'),
    },
  },
})
