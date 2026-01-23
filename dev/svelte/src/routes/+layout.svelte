<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav style="margin: 24px 0; text-align: center;">
	<a href="/" style="margin: 0 16px;">Basic</a>
	<a href="/hook" style="margin: 0 16px;">Hook</a>
</nav>
{@render children()}
