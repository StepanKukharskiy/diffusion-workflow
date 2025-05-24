<script lang="ts">
	import {  createEventDispatcher, onMount, onDestroy } from 'svelte';
	let p5;
	export let sketch;
	let appCanvas: any;

	// onMount(async () => {
	// 	// Dynamically import p5.js only in the browser
	// 	p5 = (await import('p5')).default;
	// 	new p5((p: any) => sketch(p, appCanvas), appCanvas);
	// });

	let p5lib:any, instance:any

	onMount(async ()=> {
    p5lib = (await import('p5')).default;
    instance = new p5lib(p => sketch(p, appCanvas), appCanvas);
  });

  $: if (instance && sketch) {
    // every time `sketch` changes (i.e. page nav) we destroy the old p5 and make a new one
    instance.remove();
    instance = new p5lib(p => sketch(p, appCanvas), appCanvas);
  }

  onDestroy(()=>{
    instance && instance.remove();
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
	display: flex;
	justify-content: center;
   }
</style>
