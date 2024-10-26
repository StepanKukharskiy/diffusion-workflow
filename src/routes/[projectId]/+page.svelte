<script lang="ts">
	import { textColor, bgColor, elements } from '$lib/store';

	import TextInput from '$lib/TextInput.svelte';
	import ImageInput from '$lib/ImageInput.svelte';
	import VideoGeneration from '$lib/VideoGeneration.svelte';
	import ImageGeneration from '$lib/ImageGeneration.svelte';
	import Sketch2D from '$lib/Sketch2D.svelte';
	import Sketch from '$lib/SketchPaper.svelte';

	let isCreateOptionsVisible = $state(false);
	let createButton: any;
	let layout = $state('container-block');

	function addElement(elements: any = [], type = 'text') {
		elements.push({
			type: type,
			systemPrompt: '',
			query: ''
		});
	}

	function scrollToCreateButton() {
		createButton.scrollIntoView({ behavior: 'smooth' });
	}

	function setLayout() {
		layout === 'container-block' ? (layout = 'container-grid') : (layout = 'container-block');
		console.log(layout);
	}
</script>

<div class="container">
	<h1>Ideas Diffusion</h1>
	<!-- <button onclick={setLayout}>display grid</button> -->

	<div class={layout}>
		<!-- <TextInput imageUrl={'https://media.istockphoto.com/id/1443562748/photo/cute-ginger-cat.jpg?s=612x612&w=0&k=20&c=vvM97wWz-hMj7DLzfpYRmY2VswTqcFEKkC437hxm3Cg='} /> -->
		{#each $elements as element}
			{#if element.type === 'text'}
				<TextInput imageUrl={element.imageUrl} />
			{:else if element.type === 'image'}
				<ImageInput />
			{:else if element.type === 'video'}
				<VideoGeneration refImageUrl={element.imageUrl} />
			{:else if element.type === 'imageGeneration'}
				<ImageGeneration
					refImageUrl={element.imageUrl}
					maskImageUrl={element.maskImageUrl}
					prompt={element.prompt}
				/>
			{:else if element.type === 'sketch'}
				<Sketch />
			{/if}
		{/each}
	</div>
	<button
		bind:this={createButton}
		style="background: hsl({$textColor}); color: hsl({$bgColor});"
		class="createButton"
		onclick={() => {
			isCreateOptionsVisible = !isCreateOptionsVisible;
		}}>Add</button
	>
	{#if isCreateOptionsVisible}
		<button
			class="createOptionsMenu"
			style="color: hsl({$textColor});"
			onclick={() => {
				isCreateOptionsVisible = false;
				addElement($elements, 'text');
				$elements = $elements;
				scrollToCreateButton();
			}}>chat</button
		>
		<button
			class="createOptionsMenu"
			style="color: hsl({$textColor});"
			onclick={() => {
				isCreateOptionsVisible = false;
				addElement($elements, 'image');
				$elements = $elements;
				scrollToCreateButton();
			}}>image</button
		>
		<button
			class="createOptionsMenu"
			style="color: hsl({$textColor});"
			onclick={() => {
				isCreateOptionsVisible = false;
				addElement($elements, 'sketch');
				$elements = $elements;
				scrollToCreateButton();
			}}>sketch</button
		>
	{/if}
</div>

<style>
	.container,
	.container-block {
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
	}
	.container-grid {
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;

		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.createButton {
		padding: 10px;
		box-sizing: border-box;
		border: none;
		border-radius: 10px;
	}
	.createOptionsMenu {
		background: none;
		border: none;
	}
</style>
