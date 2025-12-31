// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'VistaView',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/juji/vistaview' }],
			sidebar: [],
			customCss: ['./src/styles/custom.css'],
		}),
	],
});
