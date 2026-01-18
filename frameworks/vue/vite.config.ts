import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'VistaViewVue',
      formats: ['es'],
      fileName: (format) => `main.${format}.js`,
    },
    rollupOptions: {
      external: ['vue', 'vistaview'],
      output: {
        globals: {
          vue: 'Vue',
          vistaview: 'VistaView',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
})
