<script lang="ts">
	import { referenceImageUrl, chatPanelMode, gradientColor } from './store';
	import { slide } from 'svelte/transition';
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

	let panelState = $state(true);

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

	let color = $state('#A1C9F290');

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

		// Green
		// HSL: 120°, 50%, 50%
		// Hex: #34C759

		// Yellow
		// HSL: 60°, 50%, 50%
		// Hex: #F7DC6F

		// Orange
		// HSL: 30°, 50%, 50%
		// Hex: #FFA07A

		// Pink
		// HSL: 340°, 50%, 50%
		// Hex: #FFC0CB

		// Purple
		// HSL: 270°, 50%, 50%
		// Hex: #C7B8EA

		// Blue
		// HSL: 210°, 50%, 50%
		// Hex: #4682B4

		// Silver
		// HSL: 0°, 0%, 50%
		// Hex: #C5C5C5

		if ($chatPanelMode === 'chat') {
			color = '#A1C9F290';
			$gradientColor = color;
		} else if ($chatPanelMode === 'image') {
			color = '#F7DC6F';
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
			color = '#ffef4b90';
			$gradientColor = color;
		}

		document.body.style.setProperty('--gradientColor', $gradientColor);
	});
</script>

{#if panelState}
	<div class="chatContainer">
		

		<div class="modeOptions">
			<button
				class="{$chatPanelMode === 'chat' ? 'secondaryButton' : 'tertiaryButton'}"
				onclick={() => {
					$chatPanelMode = 'chat';
				}}>Chat</button
			>
			<button
				class="{$chatPanelMode === 'image' ? 'secondaryButton' : 'tertiaryButton'}"
				onclick={() => {
					$chatPanelMode = 'image';
				}}>Image</button
			>
			<button
				class="{$chatPanelMode === 'video' ? 'secondaryButton' : 'tertiaryButton'}"
				onclick={() => {
					$chatPanelMode = 'video';
				}}>Video</button
			>
			<button
				class="{$chatPanelMode === 'file' ? 'secondaryButton' : 'tertiaryButton'}"
				onclick={() => {
					$chatPanelMode = 'file';
				}}>File</button
			>
			<button
				class="{$chatPanelMode === 'sketch' ? 'secondaryButton' : 'tertiaryButton'}"
				onclick={() => {
					$chatPanelMode = 'sketch';
				}}>Sketch</button
			>
			<button
				class="{$chatPanelMode === 'code' ? 'secondaryButton' : 'tertiaryButton'}"
				onclick={() => {
					$chatPanelMode = 'code';
				}}>Code</button
			>

			<button
			class="panelStateButton"
			style='position: absolute; right:10px; top: -25px;'
			onclick={() => {
				panelState = !panelState;
			}}
		>
			minify<svg
			style='margin-left: 5px'
				width="10"
				height="10"
				viewBox="0 0 100 100"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<line x1="20" y1="20" x2="50" y2="80" stroke="#1a1a1a" stroke-width="10" />
				<line x1="50" y1="80" x2="80" y2="20" stroke="#1a1a1a" stroke-width="10" />
			</svg></button
		>
		</div>

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
		
	</div>
{:else}
	<button
		class="primaryButton"
		style='width: 40px; height: 40px; border-radius: 50%; margin-bottom: 30px; padding: 0; font-size: 1.5rem; display: flex; justify-content:center;'
		onclick={() => {
			panelState = !panelState;
		}}
		>
		+</button
	>
{/if}

<style>
	.chatContainer {
		min-height: 40px;
		width: calc(100% - 20px);
		max-width: 800px;
		box-sizing: border-box;
		border-radius: 10px;
		background: #fff;
		/* background: linear-gradient(45deg, rgba(255, 255, 255, 0.52), rgba(255, 255, 255, 0.25)); */
		/* backdrop-filter: blur(25px); */
		/* -webkit-backdrop-filter: blur(25px); */
		padding: 10px;
		margin: 10px;
		box-sizing: border-box;
		box-shadow: 0 0 10px hsl(0, 0%, 80%);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: 25;
		transition: all 0.25s;
		position: relative;
	}
	.modeOptions {
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 10px;
	}
	.panelStateButton {
		/* position: absolute; */
		/* top: -25px;
		left: 20px; */
		margin: 0;
		height: 25px;
		border: 1px solid  hsl(0, 0%, 70%);
		border-bottom: none;
		background: #f9f9f920;
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(40px);
		border-radius: 10px 10px 0 0;
		font-family: 'Roboto', sans-serif;
		font-weight: 300;
		color: #1a1a1a;
	}
	.panelStateButton:hover {
		text-decoration: underline;
	}
	.panelStateHiddenButton {
		/* position: absolute; */
		/* top: -25px;
		left: 20px; */
		margin: 0;
		margin-bottom: 20px;
		width: 40px;
		height: 40px;
		border: none;
		background: hsl(0, 0%, 0%);
		backdrop-filter: blur(40px);
		-webkit-backdrop-filter: blur(40px);
		border-radius: 50%;
		font-family: 'Roboto', sans-serif;
		font-weight: 300;
		color: hsl(0, 0%, 98%);
	}
</style>
