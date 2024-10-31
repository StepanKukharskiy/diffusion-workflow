<script lang="ts">
	import { textColor, bgColor, elements } from './store';
	import { generateUUID } from './utils';
	import { page } from '$app/stores';
	import paper from 'paper';
	import { onMount, onDestroy } from 'svelte';
	import { slide } from 'svelte/transition';

	let generatedImage: any = $state(),
		isGeneratingImage = $state(false),
		{ refImageUrl = '', maskImageUrl = '', prompt = '' } = $props(),
		modelOption = $state('flux-schnell'),
		generatedImageUrl = $state(''),
		isSettingsVisible = $state(false);
	let canvas: any = $state();
	let selectedShape = $state('rectangle'); // Default shape
	let tool: paper.Tool;
	let path: paper.Path | null = null;
	let color = $state('#ffffff'); // Default color

	let controlsMenuHeight: any = $state(),
		controlsMenu: any = $state(),
		textareaHeight: any = $state(),
		textarea: any = $state();

	// Define a type for shapes
	type Shape =
		| { type: 'rectangle'; bounds: paper.Rectangle; color: string }
		| { type: 'circle'; center: paper.Point; radius: number; color: string }
		| { type: 'path'; segments: paper.Segment[]; color: string };

	let shapes: Shape[] = []; // Array to store shapes
	let isMakingScreenshot = $state(false),
		isEmptySketch = $state(true),
		sketchUrl = $state(''),
		isInpainting = $state(false),
		isDisabled = $state(true),
		uuid = generateUUID();

	function toggleDisabledState() {
		if (generatedImageUrl === '' || isInpainting) {
			isDisabled = true;
		} else {
			isDisabled = false;
		}
		if (refImageUrl != '') {
			isDisabled = false;
		}
	}

	function resizeCanvas(width: number, height: number) {
		if (canvas) {
			canvas.width = width;
			canvas.height = height;
			paper.view.viewSize = new paper.Size(canvas.width, canvas.height);

			// Redraw the background
			new paper.Path.Rectangle({
				point: [0, 0],
				size: [canvas.width, canvas.height],
				fillColor: 'black'
			});

			// Redraw all shapes from the array
			shapes.forEach((shape) => {
				if (shape.type === 'rectangle') {
					new paper.Path.Rectangle({
						point: shape.bounds.topLeft,
						size: shape.bounds.size,
						strokeColor: shape.color,
						fillColor: shape.color
					});
				} else if (shape.type === 'circle') {
					new paper.Path.Circle({
						center: shape.center,
						radius: shape.radius,
						strokeColor: shape.color,
						fillColor: shape.color
					});
				} else if (shape.type === 'path') {
					const newPath = new paper.Path({
						strokeColor: shape.color
					});
					shape.segments.forEach((segment) => {
						newPath.add(segment.point);
					});
				}
			});
		}
	}

	function setShape(shape: string) {
		selectedShape = shape;
		console.log('Selected shape:', selectedShape);
	}

	onMount(() => {
		controlsMenuHeight = controlsMenu.offsetHeight;
		textareaHeight = textarea.offsetHeight;
		if (prompt != '') {
			generateImage();
		}
		if (refImageUrl != '') {
			modelOption = 'sdxl-controlnet-canny';
		}
		if (maskImageUrl != '') {
			modelOption = 'flux-dev-inpaint';
		}
		if (typeof window !== 'undefined') {
			//setTimeout(setupCanvas, 1000);
		}
		toggleDisabledState();
	});

	onDestroy(() => {
		window.removeEventListener('resize', () => {
			resizeCanvas(canvas.parentElement.clientWidth, canvas.parentElement.clientHeight);
		});
	});

	async function generateImage() {
		isGeneratingImage = true;
		if (maskImageUrl != '') {
			modelOption = 'flux-dev-inpaint';
		}
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

	// function toggleInpaintingMode() {
	// 	isInpainting = !isInpainting;
	// }

	function toggleInpaintingMode() {
		isInpainting = !isInpainting;
		setTimeout(() => {
			if (isInpainting && canvas) {
				paper.setup(canvas);
				canvas.width = generatedImage.clientWidth;
				canvas.height = generatedImage.clientHeight;
				canvas.style.backgroundColor = 'black';

				let rectangle: paper.Path.Rectangle | null = null;
				let startPoint: paper.Point | null = null;

				canvas.onpointerdown = (event: PointerEvent) => {
					startPoint = new paper.Point(event.offsetX, event.offsetY);
					rectangle = new paper.Path.Rectangle({
						point: startPoint,
						size: [0, 0],
						strokeColor: 'white'
					});
				};

				canvas.onpointermove = (event: PointerEvent) => {
					if (rectangle && startPoint) {
						const endPoint = new paper.Point(event.offsetX, event.offsetY);
						rectangle.remove();
						rectangle = new paper.Path.Rectangle({
							from: startPoint,
							to: endPoint,
							strokeColor: 'white',
							fillColor: 'white'
						});
					}
				};

				canvas.onpointerup = () => {
					rectangle = null;
					startPoint = null;
				};
			}
		}, 10);
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

	async function getScreenshotUrl() {
		const canvas = document.getElementById(`${uuid}-canvas`);
		isMakingScreenshot = true;
		const dataURL = canvas.toDataURL('image/jpeg');
		const blob = await fetch(dataURL).then((res) => res.blob());
		const formData = new FormData();
		formData.append('file', blob, 'canvas.jpeg');
		formData.append('projectId', $page.params.projectId);
		console.log($page.params.projectId);
		console.log(formData);
		const response = await fetch('/api/save-image', { method: 'POST', body: formData });
		if (!response.ok) {
			isMakingScreenshot = false;
			console.error('Upload failed:', response.statusText);
		} else {
			const result = await response.json();
			console.log('Upload successful:', result);
			isMakingScreenshot = false;
			return result.url;
		}
	}
</script>

<div class="elementContainer">
	<details open>
		<summary>
			<div class="colorLine" style="background: #FFD7BE;"></div>
			<h3 style="color: hsl({$textColor})">Image Generation</h3>
			{#if refImageUrl != ''}
				<!-- <h3 style='margin-left: 10px;'>using this image</h3> -->
				<img src={refImageUrl} alt="data for generation" width="30" style="margin-left: 10px;" />
			{/if}
			{#if maskImageUrl != ''}
				<!-- <h3 style='margin-left: 10px;'>using this image</h3> -->
				<img src={maskImageUrl} alt="data for generation" width="30" style="margin-left: 10px;" />
			{/if}
		</summary>

		<div class="imageAndControlsContainer">
			{#if isInpainting}
				<canvas
					bind:this={canvas}
					style="width: 100%; height: {generatedImage.offsetHeight}px"
					id="{uuid}-canvas"
				></canvas>
			{/if}
			{#if generatedImageUrl}
				<img
					bind:this={generatedImage}
					src={generatedImageUrl}
					class="generatedImage"
					alt="generated file"
				/>
			{:else if refImageUrl}
				<img
					bind:this={generatedImage}
					src={refImageUrl}
					class="generatedImage"
					alt="source file"
				/>
			{:else}
				<div class="generatedImageMockup" style="border: 1px solid hsla({$textColor}, 20%); "></div>
			{/if}

			{#if isGeneratingImage}
				<div style="display: flex; align-items: center;" transition:slide>
					<span class="warning"></span>
					<p style="margin-right: 10px;">Generating image</p>
					<div class="loader" style="border-color: hsl({$textColor}) transparent;"></div>
				</div>
			{:else}
				{#if isSettingsVisible}
					<div transition:slide style="margin-bottom: 10px;">
						<label for="model">Model</label>
						<select
							id="model"
							name="model"
							style="color: hsl({$textColor}); background: hsla({$textColor}, 20%);"
							bind:value={modelOption}
						>
							{#if refImageUrl === '' && maskImageUrl === ''}
								<option value="stable-diffusion-3">stable-diffusion-3</option>
								<option value="flux-schnell">flux-schnell</option>
							{:else if refImageUrl != '' && maskImageUrl === ''}
								<option value="sdxl-controlnet-canny">sdxl-controlnet-canny</option>
								<option value="sdxl-controlnet-depth">sdxl-controlnet-depth</option>
								<option value="flux-dev-controlnet-depth">flux-dev-controlnet-depth</option>
								<!-- <option value="sdxl-controlnet-seg">sdxl-controlnet-seg</option>
					<option value="flux-dev-controlnet-canny">flux-dev-controlnet-canny</option>
					 -->
							{:else if maskImageUrl != ''}
								<option value="flux-dev-inpaint">flux-dev-inpaint</option>
							{/if}

							<!-- <option value='mistral-7B-Instruct-v0.1'>mistral-7B-Instruct-v0.1</option> -->
							<!-- <option value='Qwen2-72B-Instruct'>Qwen2-72B-Instruct</option> -->
						</select>
					</div>
				{/if}
				<textarea
					bind:this={textarea}
					bind:value={prompt}
					style="border: 1px solid hsla({$textColor}, 20%); background: hsla({$textColor}, 10%); color: hsl({$textColor}); margin: 0 0 5px 0;"
					placeholder="Type in a descripiton here">{prompt}</textarea
				>
				{#if generatedImageUrl === '' && refImageUrl === ''}
					<div style="display: flex; align-items: center;" transition:slide>
						<span class="warning"></span>
						<p>Please, generate an image to continue</p>
					</div>
				{/if}
				<div class="controlsMenu" bind:this={controlsMenu}>
					<button
						class="generationControlsButton"
						onclick={async () => {
							isGeneratingImage = true;
							if (isInpainting) {
								maskImageUrl = await getScreenshotUrl();
								if(refImageUrl === ''){
								refImageUrl = generatedImageUrl;
								}
								isInpainting = false;
							}
							const url = await generateImage();
							console.log(url);
							maskImageUrl = '';
							refImageUrl = '';
							toggleDisabledState();
						}}
					>
						Generate image
					</button>
					<button
						class="optionsButton"
						disabled={isDisabled}
						onclick={() => {
							toggleInpaintingMode();
							isDisabled = true;
						}}>Vary Region</button
					>
					<button
						class="optionsButton"
						disabled={isDisabled}
						onclick={() => {
							addElement($elements, 'text', generatedImageUrl);
							$elements = $elements;
						}}
					>
						Discuss
					</button>
					<button
						class="optionsButton"
						disabled={isDisabled}
						onclick={async () => {
							addElement($elements, 'imageGeneration', generatedImageUrl);
							$elements = $elements;
						}}>New Image</button
					>
					<button
						class="optionsButton"
						disabled={isDisabled}
						onclick={() => {
							addElement($elements, 'video', generatedImageUrl);
							$elements = $elements;
						}}>New Video</button
					>
					<button class="settingsButton" onclick={toggleSettings}>Settings</button>
				</div>
			{/if}
		</div>
	</details>
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
		position: relative;
		display: flex;
		flex-direction: column;
		margin-top: 10px;
		margin-bottom: 5px;
		width: 100%;
		height: 100%;
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
		margin-bottom: 10px;
		background: #1a1a1a20;
	}
	.generatedImage {
		height: fit-content;
		margin-bottom: 10px;
	}
	.canvasContainer {
		width: 100%;
		height: 100%;
		position: absolute;
		background: rgb(213, 171, 171);
	}
	canvas {
		position: absolute;
		border-radius: 10px;
		opacity: 0.5;
	}
</style>
