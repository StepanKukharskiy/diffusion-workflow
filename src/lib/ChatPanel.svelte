<script lang="ts">
	import { referenceImageUrl, chatPanelMode, gradientColor } from './store';
	import SimpleImageGeneration from './SimpleImageGeneration.svelte';
	import SimpleFileInput from './SimpleFileInput.svelte';
	import SimpleTextGeneration from './SimpleTextGeneration.svelte';
	import SimpleCodeTemplates from './SimpleCodeTemplates.svelte';
	import SimpleVideoGeneration from './SimpleVideoGeneration.svelte';
	import SimpleSketchGeneration from './SimpleSketchGeneration.svelte';

	let mode = $state('chat'),
		isSettingsVisible = $state(false),
		previousReferenceImageUrl = $state('');

	let imageUrl = '',
		codeProjectUuid = '';

	// function addElement(
	// 		elements: any = [],
	// 		type = 'text',
	// 		imageUrl = '',
	// 		maskImageUrl = '',
	// 		prompt = '',
	// 		answer = ''
	// 	) {
	// 		console.log(elements);
	// 		console.log(prompt);
	// 		elements.push({
	// 			type: type,
	// 			systemPrompt: '',
	// 			query: '',
	// 			imageUrl: imageUrl,
	// 			maskImageUrl: maskImageUrl,
	// 			prompt: prompt
	// 		});

	// 		console.log(elements);
	// 	}

	let color = $state('');

	$effect(() => {
		// #A1C9F290 - text
		// #FFD7BE - image generation
		// #D6C4FF - image input
		// #FFCFF6 - sketch 2D
		// #7CFFFB - video generation
		// #C5F9F7 - a soft, pale blue-green color that's calming and easy on the eyes.
		// #F7D2C4 - a warm, beige-like color that's inviting and suggests creativity.
		// #8BC34A - a muted, greenish-yellow color that's fresh and energetic.
		// #6495ED - a soft, blue-purple color that's soothing and suggests innovation.

		if ($chatPanelMode === 'chat') {
			color = '#A1C9F2';
			$gradientColor = color;
		} else if ($chatPanelMode === 'image') {
			color = '#FFD7BE';
			$gradientColor = color;
		} else if ($chatPanelMode === 'file') {
			color = '#D6C4FF';
			$gradientColor = color;
		} else if ($chatPanelMode === 'code') {
			color = '#0eede590';
			$gradientColor = color;
		} else if ($chatPanelMode === 'video') {
			color = '#f673ff90';
			$gradientColor = color;
		} else if ($chatPanelMode === 'sketch') {
			color = '#8BC34A90';
			$gradientColor = color;
		}

		document.body.style.setProperty('--gradientColor', $gradientColor);
	});
</script>

<div class="chatContainer" style="border: 1px solid {color}; box-shadow: 0 0 20px {color};">
	{#if $chatPanelMode === 'chat'}
		<SimpleTextGeneration />
	{:else if $chatPanelMode === 'image'}
		<SimpleImageGeneration />
	{:else if $chatPanelMode === 'file'}
		<SimpleFileInput />
	{:else if $chatPanelMode === 'code'}
		<SimpleCodeTemplates />
	{:else if $chatPanelMode === 'video'}
		<SimpleVideoGeneration />
	{:else if $chatPanelMode === 'sketch'}
		<SimpleSketchGeneration />
	{/if}

	<div class="modeOptions">
		<button
			class="settingsButton"
			style="text-decoration: {$chatPanelMode === 'chat' ? 'underline' : 'none'}"
			onclick={() => {
				$chatPanelMode = 'chat';
			}}>Chat</button
		>
		<button
			class="settingsButton"
			style="text-decoration: {$chatPanelMode === 'image' ? 'underline' : 'none'}"
			onclick={() => {
				$chatPanelMode = 'image';
			}}
			>Image</button
		>
		<button
			class="settingsButton"
			style="text-decoration: {$chatPanelMode === 'video' ? 'underline' : 'none'}"
			onclick={() => {
				$chatPanelMode = 'video';
			}}>Video</button
		>
		<button
			class="settingsButton"
			style="text-decoration: {$chatPanelMode === 'file' ? 'underline' : 'none'}"
			onclick={() => {
				$chatPanelMode = 'file';
			}}>File</button
		>
		<button
			class="settingsButton"
			style="text-decoration: {$chatPanelMode === 'sketch' ? 'underline' : 'none'}"
			onclick={() => {
				$chatPanelMode = 'sketch';
			}}>Sketch</button
		>
		<button
			class="settingsButton"
			style="text-decoration: {$chatPanelMode === 'code' ? 'underline' : 'none'}"
			onclick={() => {
				$chatPanelMode = 'code';
			}}>Code</button
		>
	</div>
</div>

<style>
	.chatContainer {
		min-height: 40px;
		width: calc(100% - 20px);
		max-width: 800px;
		box-sizing: border-box;
		border-radius: 20px;
		background: #fff;
		/* background: linear-gradient(45deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0.25)); */
		backdrop-filter: blur(25px);
		-webkit-backdrop-filter: blur(25px);
		padding: 10px;
		margin: 10px;
		box-sizing: border-box;
		box-shadow: 0 0 10px rgba(152, 152, 152, 0.3);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: 25;
		transition: all 0.25s;
	}
	.modeOptions {
		display: flex;
		margin-top: 10px;
	}
</style>
