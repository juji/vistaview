// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'VistaView',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/juji/vistaview' }],
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'Introduction', slug: 'index' },
						{ label: 'Installation', slug: 'getting-started/installation' },
						{ label: 'Quick Start', slug: 'getting-started/quick-start' },
					],
				},
				{
					label: 'Framework Guides',
					items: [
						{ label: 'Vanilla JS', slug: 'frameworks/vanilla' },
						{ label: 'React', slug: 'frameworks/react' },
						{ label: 'Vue', slug: 'frameworks/vue' },
						{ label: 'Svelte', slug: 'frameworks/svelte' },
						{ label: 'Solid', slug: 'frameworks/solid' },
						{ label: 'Angular', slug: 'frameworks/angular' },
					],
				},
				{
					label: 'Core Concepts',
					items: [
						{ label: 'Configuration', slug: 'concepts/configuration' },
						{ label: 'Extensions', slug: 'concepts/extensions' },
						{ label: 'Styling & Themes', slug: 'concepts/styling' },
						{ label: 'Keyboard & Touch', slug: 'concepts/interactions' },
					],
				},
				{
					label: 'Extensions',
					autogenerate: { directory: 'extensions' },
				},
				{
					label: 'API Reference',
					autogenerate: { directory: 'reference' },
				},
			],
		}),
	],
});
