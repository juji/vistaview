import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { readdirSync } from 'fs';

// Check if building UMD specifically
const isUMD = process.env.BUILD_UMD === 'true';
const isProd = process.env.BUILD_ENV === 'prod';
const buildExt = process.env.BUILD_EXT; // specific extension to build as UMD

// Get all CSS files from styles directory
const stylesDir = resolve(__dirname, 'src/styles');
const styleFiles = readdirSync(stylesDir)
  .filter((file) => file.endsWith('.css'))
  .reduce((acc, file) => {
    const name = file.replace('.css', '');
    acc[`styles/${name}`] = resolve(stylesDir, file);
    return acc;
  }, {});

// Get all CSS files from styles/extensions directory
const stylesExtDir = resolve(__dirname, 'src/styles/extensions');
const styleExtFiles = readdirSync(stylesExtDir)
  .filter((file) => file.endsWith('.css'))
  .reduce((acc, file) => {
    const name = file.replace('.css', '');
    acc[`styles/extensions/${name}`] = resolve(stylesExtDir, file);
    return acc;
  }, {});

// Get all extension files from extensions directory
const extensionsDir = resolve(__dirname, 'src/lib/extensions');
const extensionFiles = readdirSync(extensionsDir)
  .filter((file) => file.endsWith('.ts'))
  .reduce((acc, file) => {
    const name = file.replace('.ts', '');
    acc[`extensions/${name}`] = resolve(extensionsDir, file);
    return acc;
  }, {});

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
    // Don't drop console/debugger via esbuild, let our plugin handle it
    ...(isProd && { pure: ['console.log'] }),
  },
  build: isUMD
    ? buildExt
      ? {
          lib: {
            entry: resolve(__dirname, `src/lib/extensions/${buildExt}.ts`),
            name: 'VistaView',
            formats: ['umd'],
            fileName: () => `extensions/${buildExt}.umd.js`,
          },
          cssCodeSplit: false,
          emptyOutDir: false,
          rollupOptions: {
            output: {
              extend: true, // Extend existing VistaView global instead of overwriting
            },
          },
        }
      : {
          lib: {
            entry: resolve(__dirname, 'src/vistaview.ts'),
            name: 'VistaView',
            formats: ['umd'],
            fileName: () => 'vistaview.umd.js',
          },
          cssCodeSplit: false,
          emptyOutDir: false,
          rollupOptions: {
            output: {
              extend: true, // Preserve existing VistaView object
            },
          },
        }
    : {
        lib: {
          entry: {
            vistaview: resolve(__dirname, 'src/vistaview.ts'),
            react: resolve(__dirname, 'src/react.tsx'),
            vue: resolve(__dirname, 'src/vue.ts'),
            svelte: resolve(__dirname, 'src/svelte.ts'),
            solid: resolve(__dirname, 'src/solid.tsx'),
            style: resolve(__dirname, 'src/style.css'),
            ...styleFiles,
            ...styleExtFiles,
            ...extensionFiles,
          },
          name: 'VistaView',
          formats: ['es'],
        },
        cssCodeSplit: true,
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
            assetFileNames: (assetInfo) => {
              if (assetInfo.names[0] && assetInfo.names[0].endsWith('.css')) {
                return '[name][extname]';
              }
              return 'assets/[name]-[hash][extname]';
            },
            banner: (chunk) => {
              // Add 'use client' directive to React wrapper
              if (chunk.name === 'react') {
                return "'use client';";
              }
              return '';
            },
          },
        },
      },
});
