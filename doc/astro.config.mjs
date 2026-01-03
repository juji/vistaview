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
					label: 'Core',
					items: [
						{ label: 'Installation', slug: 'core/installation' },
						{
							label: 'Configuration',
							collapsed: false,
							items: [
								{ label: 'Basic', slug: 'core/configuration/basic' },
								{ label: 'Data Attributes', slug: 'core/configuration/data-attributes' },

							{ label: 'Animation', slug: 'core/configuration/animation' },
							{ label: 'Zoom', slug: 'core/configuration/zoom' },
							{ label: 'Preloading', slug: 'core/configuration/preloading' },
							{ label: 'Controls', slug: 'core/configuration/controls' },
							{ label: 'Keyboard & UI', slug: 'core/configuration/keyboard' },
							{ label: 'Z-Index', slug: 'core/configuration/z-index' },
							{ label: 'Events', slug: 'core/configuration/events' },
							{ label: 'Lifecycle', slug: 'core/configuration/lifecycle' },
							{ label: 'Extensions', slug: 'core/configuration/extensions' },
							
							{ label: 'Complete Options', slug: 'core/configuration/complete' },
							],
						},
					],
				},
				{
					label: 'Integrations',
					items: [
						{ label: 'React', slug: 'integrations/react' },
						{ label: 'Vue', slug: 'integrations/vue' },
						{ label: 'Svelte', slug: 'integrations/svelte' },
						{ label: 'Solid', slug: 'integrations/solid' },
						{ label: 'Vanilla JS', slug: 'integrations/vanilla' },
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
						{
							label: 'Authoring',
							collapsed: false,
							items: [
								{ label: 'Guide', slug: 'extensions/authoring' },
								{ label: 'UI Extensions', slug: 'extensions/authoring/ui-extensions' },
								{ label: 'Behavior Extensions', slug: 'extensions/authoring/behavior-extensions' },
								{ label: 'Content Extensions', slug: 'extensions/authoring/content-extensions' },
							],
						},
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
				{ label: 'API Reference', slug: 'api-reference' },
			],
			customCss: ['./src/styles/custom.css'],
			components: {
				Hero: './src/components/Hero.astro',
			},
		}),
	],
});
