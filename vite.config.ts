import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import widget from '@widget-js/vite-plugin-widget'
import { defineConfig } from 'vite'

export default defineConfig((config) => {
  const offlineMode = config.mode === 'offline'
  const base = offlineMode ? './' : '/reminders'
  return {
    base,
    plugins: [
      tailwindcss(),
      widget({
        zipName: 'github-reminders',
        generateZip: offlineMode,
        generateFullNamePackage: true,
      }),
      react(),

    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})