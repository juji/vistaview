import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/vistaview.ts'),
      name: 'VistaView',
      fileName: 'vistaview',
      formats: ['es', 'umd']
    },
    cssCodeSplit: false,
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        exports: 'named'
      }
    },
  }
})