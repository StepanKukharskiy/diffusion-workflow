<script lang="ts">
	import { textColor, bgColor, elements } from './store';
	import { page } from '$app/stores';

	let generatedImage = $state(),
		modelOption = $state('flux-schnell'),
		isGeneratingImage = $state(false),
		{ refImageUrl = '', maskImageUrl = '', prompt = '' } = $props(),
		generatedImageUrl = $state(''),
		isSettingsVisible = $state(false);

	async function generateImage() {
		const message = await fetch(`/api/image-generation`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				refImageUrl: refImageUrl,
				maskUrl: maskImageUrl,
				prompt: prompt,
				model: modelOption,
				projectId: $page.params.projectId
			})
		});
		console.log(message);
		const messageObject = await message.json();
		generatedImageUrl = messageObject.imageUrl;
		console.log(`api response: ${messageObject}`);
		isGeneratingImage = false;
		return generatedImageUrl;
	}
	// Function to toggle settings visibility
	function toggleSettings() {
		isSettingsVisible = !isSettingsVisible; // Update state here
		console.log(isSettingsVisible);
	}
	function addElement(elements: any = [], type = 'text', imageUrl = '') {
		console.log(elements);
		elements.push({
			type: type,
			systemPrompt: '',
			query: '',
			imageUrl: imageUrl
		});

		console.log(elements);
	}
</script>

<div class="elementContainer">
	<div class="colorLine" style="background: #FFD7BE;"></div>
	<div class="imageAndControlsContainer">
		{#if generatedImageUrl}
			<img
				bind:this={generatedImage}
				src={generatedImageUrl}
				class="generatedImage"
				alt="generated file"
			/>
		{:else}
			<div class="generatedImageMockup" style="border: 1px solid hsla({$textColor}, 20%);"></div>
		{/if}
		{#if isGeneratingImage}
			<div style="display: flex; align-items: center;">
				<span class="warning"></span>
				<p style="margin-right: 10px;">Generating image</p>
				<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
			</div>
		{:else}
			{#if isSettingsVisible}
				<label for="model">Model</label>
				<select
					id="model"
					name="model"
					style="color: hsl({$textColor}); background: hsla({$textColor}, 20%);"
					bind:value={modelOption}
				>
					<option value="sdxl-controlnet-canny">sdxl-controlnet-canny</option>
					<option value="sdxl-controlnet-depth">sdxl-controlnet-depth</option>
					<option value="sdxl-controlnet-seg">sdxl-controlnet-seg</option>
					<option value="flux-dev-controlnet-canny">flux-dev-controlnet-canny</option>
					<option value="flux-dev-controlnet-depth">flux-dev-controlnet-depth</option>
					<option value="flux-dev-inpaint">flux-dev-inpaint</option>
					<option value="stable-diffusion-3">stable-diffusion-3</option>
					<option value="flux-schnell">flux-schnell</option>

					<!-- <option value='mistral-7B-Instruct-v0.1'>mistral-7B-Instruct-v0.1</option> -->
					<!-- <option value='Qwen2-72B-Instruct'>Qwen2-72B-Instruct</option> -->
				</select>
			{/if}
			<textarea
				bind:value={prompt}
				style="border: 1px solid hsla({$textColor}, 20%); background: hsla({$textColor}, 10%); color: hsl({$textColor})"
				>{prompt}</textarea
			>
			{#if generatedImageUrl === ''}
				<div style="display: flex; align-items: center;">
					<span class="warning"></span>
					<p>Please, generate an image to create a video</p>
				</div>
			{/if}
			<div class="controlsMenu">
				<button
					class="generationControlsButton"
					onclick={async () => {
						isGeneratingImage = true;
						const url = await generateImage();
						console.log(url);
					}}
				>
					{#if isGeneratingImage}
						<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
					{:else}
						Generate image
					{/if}
				</button>
				<button
					class="optionsButton"
					disabled={generatedImageUrl === '' ? true : false}
					onclick={() => {
						addElement($elements, 'text', generatedImageUrl);
						$elements = $elements;
					}}
				>
					New Chat
				</button>
				<button
					class="optionsButton"
					disabled={generatedImageUrl === '' ? true : false}
					onclick={() => {
						addElement($elements, 'video', generatedImageUrl);
						$elements = $elements;
					}}>New Video</button
				>
				<button class="settingsButton" onclick={toggleSettings}>Settings</button>
			</div>
		{/if}
	</div>
</div>

<style>
	label {
		display: block;
		height: 20px;
	}
	select {
		width: 100%;
		border: none;
		border-radius: 10px;
		font-size: 1rem;
		padding: 5px;
		box-sizing: border-box;
	}

	.imageAndControlsContainer {
		display: flex;
		flex-direction: column;
		margin-top: 5px;
		width: 100%;
		height: 100%;
	}
	.loader {
		width: 10px;
		height: 10px;
		margin: 0;
	}
	.generatedImageMockup,
	.generatedImage {
		width: 100%;
		/* height: fit-content; */
		/* aspect-ratio: 16 / 9; */
		box-sizing: border-box;
		border-radius: 10px;
	}
	.generatedImageMockup {
		aspect-ratio: 16 / 9;
		margin-bottom: 5px;
	}
	.generatedImage {
		height: fit-content;
	}
	.controlsMenu {
		display: flex;
		align-items: center;
	}
	.optionsButton {
		position: relative;
		align-self: center;
		max-width: 300px;
		/* width: 120px; */
		height: 40px;
		background: #1a1a1a20;
		color: #1a1a1a;
		border: none;
		border-radius: 10px;
		padding: 10px;
		margin-left: 5px;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.optionsButton:hover {
		background: #1a1a1a30;
	}

	.settingsButton {
		height: 40px;
		border: none;
		border-radius: 10px;
		background: none;
		box-sizing: border-box;
	}
</style>
