<script lang="ts">
	import { onMount } from 'svelte';
	let p5;
	export let sketch;
	let appCanvas: any;

	onMount(async () => {
		// Dynamically import p5.js only in the browser
		p5 = (await import('p5')).default;
		new p5((p: any) => sketch(p, appCanvas), appCanvas);
	});
</script>

<div bind:this={appCanvas} class="canvasContainer"></div>

<style>
   :global(canvas){
    border-radius: 10px;
	box-sizing: border-box;
   }
   .canvasContainer {
	min-height: 400px;
   }
</style>
