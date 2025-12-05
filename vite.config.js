import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/vistaview.ts'),
      name: 'VistaView',
      fileName: 'vistaview',
      formats: ['es', 'umd']
    },
    cssCodeSplit: false,
    rolldownOptions: {
      external: [],
      output: {
        globals: {},
        exports: 'named'
      }
    },
  }
})