// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import svelte from '@astrojs/svelte';
import vue from '@astrojs/vue';
import solid from '@astrojs/solid-js';

// https://astro.build/config
export default defineConfig({
	site: 'https://vistaview.jujiplay.com',
	vite: {
    resolve: {
      alias: {
        'astro/jsx-dev-runtime': 'astro/jsx-runtime',
      },
    },
  },
	integrations: [
		solid({
			include: ['**/solid/**/*.tsx'],
		}),
		react({
			include: ['**/react/**/*.tsx'],
		}),
		svelte(),
		vue(),
		starlight({
			title: 'VistaView',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/juji/vistaview' }],
			sidebar: [],
			customCss: ['./src/styles/custom.css'],
			components: {
				Hero: './src/components/Hero.astro',
			},
		}),
	],
});
