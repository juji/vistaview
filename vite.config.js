import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

// Check if building UMD specifically
const isUMD = process.env.BUILD_UMD === 'true';
const isProd = process.env.BUILD_ENV === 'prod';

export default defineConfig({
  server: {
    allowedHosts: ['.trycloudflare.com'],
  },
  plugins: [
    dts({
      insertTypesEntry: true,
    }),
  ],
  esbuild: {
    ...(isProd && { drop: ['console', 'debugger'] }),
  },
  build: isUMD
    ? {
        lib: {
          entry: resolve(__dirname, 'src/vistaview.ts'),
          name: 'VistaView',
          formats: ['umd'],
          fileName: () => 'vistaview.umd.js',
        },
        cssCodeSplit: false,
        emptyOutDir: false,
      }
    : {
        lib: {
          entry: {
            vistaview: resolve(__dirname, 'src/vistaview.ts'),
            react: resolve(__dirname, 'src/react.tsx'),
            vue: resolve(__dirname, 'src/vue.ts'),
            svelte: resolve(__dirname, 'src/svelte.ts'),
            solid: resolve(__dirname, 'src/solid.ts'),
          },
          name: 'VistaView',
          formats: ['es'],
        },
        cssCodeSplit: false,
        rollupOptions: {
          external: ['react', 'react/jsx-runtime', 'vue', 'svelte', 'solid-js'],
          output: {
            globals: {
              react: 'React',
              'react/jsx-runtime': 'jsxRuntime',
              vue: 'Vue',
              svelte: 'svelte',
              'solid-js': 'solid',
            },
            exports: 'named',
          },
        },
      },
});
