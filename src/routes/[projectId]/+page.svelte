<script lang="ts">
	import { textColor, bgColor, elements } from '$lib/store';

	import TextInput from '$lib/TextInput.svelte';
	import ImageInput from '$lib/ImageInput.svelte';
	import VideoGeneration from '$lib/VideoGeneration.svelte';
	import ImageGeneration from '$lib/ImageGeneration.svelte';

	let isCreateOptionsVisible = false;
	let createButton: any;

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
</script>

<div class="container">
	<h1>Diffusion Workflow</h1>

	<!-- <TextInput imageUrl={'https://media.istockphoto.com/id/1443562748/photo/cute-ginger-cat.jpg?s=612x612&w=0&k=20&c=vvM97wWz-hMj7DLzfpYRmY2VswTqcFEKkC437hxm3Cg='} /> -->
	{#each $elements as element}
		{#if element.type === 'text'}
			<TextInput imageUrl={element.imageUrl} />
		{:else if element.type === 'image'}
			<ImageInput />
		{:else if element.type === 'video'}
			<VideoGeneration refImageUrl={element.imageUrl}/>
		{:else if element.type === 'imageGeneration'}
			<ImageGeneration refImageUrl={element.imageUrl} maskImageUrl={element.maskImageUrl} prompt = {element.prompt}/>
		{/if}
	{/each}

	<button
		bind:this={createButton}
		style="background: hsl({$textColor}); color: hsl({$bgColor});"
		class="createButton"
		on:click={() => {
			isCreateOptionsVisible = !isCreateOptionsVisible;
		}}>Add</button
	>

	{#if isCreateOptionsVisible}
		<button
			class="createOptionsMenu"
			style="color: hsl({$textColor});"
			on:click={() => {
				isCreateOptionsVisible = false;
				addElement($elements, 'text');
				$elements = $elements;
				scrollToCreateButton();
			}}>text</button
		>
		<button
			class="createOptionsMenu"
			style="color: hsl({$textColor});"
			on:click={() => {
				isCreateOptionsVisible = false;
				addElement($elements, 'image');
				$elements = $elements;
				scrollToCreateButton();
			}}>image</button
		>
		<!-- <button
			class="createOptionsMenu"
			style="color: hsl({$textColor});"
			on:click={() => {
				isCreateOptionsVisible = false;
				addElement($elements, 'video');
				$elements = $elements;
				scrollToCreateButton();
			}}>video</button
		> -->
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
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
