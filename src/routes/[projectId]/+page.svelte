<script lang="ts">
	import { textColor, bgColor, elements, filesLocalCopy } from '$lib/store';
	import { generateUUID, initialCodeFiles } from '$lib/utils';

	import TextInput from '$lib/TextInput.svelte';
	import ImageInput from '$lib/ImageInput.svelte';
	import VideoGeneration from '$lib/VideoGeneration.svelte';
	import ImageGeneration from '$lib/ImageGeneration.svelte';
	import Sketch from '$lib/SketchPaper.svelte';
	import CodeProject from '$lib/CodeProject.svelte';

	let isCreateOptionsVisible = $state(false);
	let createButton: any;
	let layout = $state('container-block');

	function addElement(elements: any = [], type = 'text') {
		if (type === 'code') {
			elements.push({
				uuid: generateUUID(),
				type: type,
				files: initialCodeFiles,
				run: true
			});
		} else {
			elements.push({
				uuid: generateUUID(),
				type: type,
				systemPrompt: '',
				query: ''
			});
		}
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
	<h1>New Conversation</h1>
	<!-- <CodeProject /> -->
	<!-- <button onclick={setLayout}>display grid</button> -->

	<div class={layout}>
		<!-- <TextInput imageUrl={'https://media.istockphoto.com/id/1443562748/photo/cute-ginger-cat.jpg?s=612x612&w=0&k=20&c=vvM97wWz-hMj7DLzfpYRmY2VswTqcFEKkC437hxm3Cg='} /> -->
		{#each $elements as element}
			{#if element.type === 'text'}
				<TextInput imageUrl={element.imageUrl} codeProjectUuid={element.codeProjectUuid}/>
			{:else if element.type === 'image'}
				<ImageInput uuid={element.uuid}/>
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
			{:else if element.type === 'code'}
				<CodeProject files={element.files} uuid={element.uuid} />
			{/if}
		{/each}
	</div>

	{#if isCreateOptionsVisible}
	<div class='optionsContainer'>
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
		<button
			class="createOptionsMenu"
			style="color: hsl({$textColor});"
			onclick={() => {
				isCreateOptionsVisible = false;
				addElement($elements, 'code');
				$elements = $elements;
				scrollToCreateButton();
			}}>code</button
		>
	</div>
	{:else}
		<button
			bind:this={createButton}
			style="background: hsl({$textColor}); color: hsl({$bgColor});"
			class="createButton"
			onclick={() => {
				isCreateOptionsVisible = !isCreateOptionsVisible;
				setTimeout(()=>{isCreateOptionsVisible = false;}, 10000)
			}}>Add</button
		>
	{/if}
</div>

<style>
	.container-block {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		max-width: 1200px;
		margin-left: auto;
		margin-right: auto;
	}
	.container {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 100px;
	}
	.container-grid {
		max-width: 1200px;
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
	.createOptionsContainer{
		width: 100%;
	}
	.createOptionsMenu {
		background: none;
		border: none;
	}
</style>
