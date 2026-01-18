

import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// Collect all CSS files from src/styles
const stylesDir = resolve(__dirname, 'src/styles');
const styleFiles = readdirSync(stylesDir)
  .filter((file) => file.endsWith('.css'))
  .reduce((acc, file) => {
    const name = file.replace('.css', '');
    acc[`styles/${name}` as string] = resolve(stylesDir, file);
    return acc;
  }, {} as Record<string, string>);

// Add src/style.css as entry
let entry = {
  vistaview: resolve(__dirname, 'src/vistaview.ts'),
  style: resolve(__dirname, 'src/style.css'),
  ...styleFiles
};


const isUMD = process.env.UMD === '1';

export default defineConfig({
  build: isUMD
    ? {
        outDir: 'dist',
        emptyOutDir: true,
        lib: {
          entry: resolve(__dirname, 'src/vistaview.ts'),
          name: 'VistaView',
          formats: ['umd'],
          fileName: () => 'vistaview.umd.js',
        },
        cssCodeSplit: false,
        rollupOptions: {
          output: {
            extend: true,
          },
          // Exclude all CSS from UMD build
          plugins: [
            {
              name: 'remove-css',
              generateBundle(_options, bundle) {
                for (const file of Object.keys(bundle)) {
                  if (file.endsWith('.css')) {
                    delete bundle[file];
                  }
                }
              },
            },
          ],
        },
        minify: true,
      }
    : {
        outDir: 'dist',
        emptyOutDir: false,
        lib: {
          entry,
          formats: ['es'],
        },
        rollupOptions: {
          output: {
            preserveModules: true,
            preserveModulesRoot: 'src',
            entryFileNames: '[name].js',
            chunkFileNames: '[name].js',
            exports: 'named',
            assetFileNames: (assetInfo) => {
              if (assetInfo.names[0] && assetInfo.names[0].endsWith('.css')) {
                return assetInfo.names[0] === 'style.css' ?  '[name][extname]' : 'styles/[name][extname]';
              }
              return '[name][extname]';
            },
          },
        },
        cssCodeSplit: true,
        minify: true,
      },
});
