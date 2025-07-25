<script lang="ts">
	import { onMount } from 'svelte';
	import { map } from '$lib/map';

	let container: HTMLElement;

	onMount(() => {
		map(container);
	});
</script>

<div class="map" bind:this={container}></div>

<style>
	.map {
		position: absolute;
		inset: 0;
	}
</style>
