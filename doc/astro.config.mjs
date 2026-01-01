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
			sidebar: [
				{
					label: 'Getting Started',
					items: [
						{ label: 'React', slug: 'getting-started/react' },
						{ label: 'Vue', slug: 'getting-started/vue' },
						{ label: 'Svelte', slug: 'getting-started/svelte' },
						{ label: 'Solid', slug: 'getting-started/solid' },
						{ label: 'Vanilla JS', slug: 'getting-started/vanilla' },
					],
				},
				{
					label: 'Core',
					items: [
						{ label: 'Installation', slug: 'core/installation' },
						{ label: 'Configuration', slug: 'core/configuration' },
						{ label: 'API Reference', slug: 'core/api-reference' },
						{ label: 'Events & Lifecycle', slug: 'core/events' },
						{ label: 'Keyboard & Gestures', slug: 'core/keyboard-gestures' },
					],
				},
				{
					label: 'Styling',
					items: [
						{ label: 'CSS Variables', slug: 'styling/css-variables' },
						{ label: 'Themes', slug: 'styling/themes' },
						{ label: 'Custom Styling', slug: 'styling/custom' },
					],
				},
				{
					label: 'Extensions',
					items: [
						{ label: 'Overview', slug: 'extensions/overview' },
						{ label: 'Authoring', slug: 'extensions/authoring' },
						{
							label: 'Video Extensions',
							collapsed: false,
							items: [
								{ label: 'YouTube', slug: 'extensions/youtube-video' },
								{ label: 'Vimeo', slug: 'extensions/vimeo-video' },
								{ label: 'Dailymotion', slug: 'extensions/dailymotion-video' },
								{ label: 'Wistia', slug: 'extensions/wistia-video' },
								{ label: 'Vidyard', slug: 'extensions/vidyard-video' },
								{ label: 'Streamable', slug: 'extensions/streamable-video' },
								{ label: 'Twitch', slug: 'extensions/twitch-video' },
							],
						},
						{
							label: 'Map Extensions',
							collapsed: false,
							items: [
								{ label: 'Google Maps', slug: 'extensions/google-maps' },
								{ label: 'Mapbox', slug: 'extensions/mapbox' },
								{ label: 'OpenStreetMap', slug: 'extensions/openstreetmap' },
							],
						},
						{
							label: 'Other Extensions',
							collapsed: false,
							items: [
								{ label: 'Download', slug: 'extensions/download' },
								{ label: 'Image Story', slug: 'extensions/image-story' },
								{ label: 'Logger', slug: 'extensions/logger' },
							],
						},
					],
				},
			],
			customCss: ['./src/styles/custom.css'],
			components: {
				Hero: './src/components/Hero.astro',
			},
		}),
	],
});
